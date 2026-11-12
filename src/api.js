// Thin client for the ASP.NET backend. In dev, Vite proxies /api to it; in production set VITE_API_URL.
import assetUrl from './assetUrl.js';
const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

function saveTokens({ accessToken, refreshToken }) {
  localStorage.setItem(ACCESS, accessToken);
  localStorage.setItem(REFRESH, refreshToken);
  window.dispatchEvent(new Event('auth-change'));
}

function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  window.dispatchEvent(new Event('auth-change'));
}

export const isLoggedIn = () => Boolean(read(ACCESS));

async function send(path, { method = 'GET', body } = {}) {
  const token = read(ACCESS);
  return fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
}

// The access token lives 15 minutes, so a 401 gets one refresh attempt before giving up.
async function refresh() {
  const accessToken = read(ACCESS);
  const refreshToken = read(REFRESH);
  if (!accessToken || !refreshToken) return false;

  const res = await fetch(`${BASE}/account/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return false;
  }
  saveTokens(await res.json());
  return true;
}

const UNREACHABLE = 'Сервер недоступний. Перевірте, чи запущений бекенд.';

export async function api(path, options) {
  let res;
  try {
    res = await send(path, options);
  } catch {
    throw new Error(UNREACHABLE);
  }
  if (res.status === 401 && (await refresh())) res = await send(path, options);

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    // The Vite proxy answers an empty 5xx when nothing listens on the backend port.
    if (res.status >= 500 && !text) throw Object.assign(new Error(UNREACHABLE), { status: res.status });
    // 5xx bodies from ASP.NET in Development are raw stack traces, not something to show users.
    if (res.status >= 500) throw Object.assign(new Error('Помилка сервера. Спробуйте пізніше.'), { status: res.status });
    // The status code in the fallback tells which case it was (401 = token rejected, 404 = wrong address…).
    const message = data?.message || data?.title || (typeof data === 'string' && data) || `Помилка сервера (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function login(email, password) {
  saveTokens(await api('/account/login', { method: 'POST', body: { email, password } }));
}

// Register only takes email and password; names are stored on the profile after signing in.
// Once the account exists, a failed sign-in or name save is reported but doesn't undo the registration.
export async function register({ email, password, firstName, lastName }) {
  try {
    await api('/account/register', { method: 'POST', body: { email, password } });
  } catch (err) {
    throw Object.assign(err, { step: 'register' });
  }
  try {
    await login(email, password);
    await updateProfile({ firstName, lastName });
    return { complete: true };
  } catch (err) {
    console.warn('Account created, but sign-in or saving the name failed:', err);
    return { complete: false, error: err };
  }
}

export async function logout() {
  try {
    await api('/account/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}

export const getProfile = () => api('/account/me');

export const updateProfile = (profile) => api('/account/me', { method: 'PUT', body: profile });

export const changePassword = (currentPassword, newPassword) =>
  api('/account/change-password', { method: 'POST', body: { currentPassword, newPassword } });

export const resetPassword = ({ email, token, newPassword }) =>
  api('/account/reset-password', { method: 'POST', body: { email, token, newPassword } });

// Backend BookDto -> the shape BookCard and BookCover expect.
export const toBook = (b) => ({
  id: b.id,
  title: b.title,
  description: b.description,
  author: b.authorFullName,
  authorId: b.authorId,
  category: b.categoryName,
  categoryId: b.categoryId,
  price: b.price,
  stock: b.stockQuantity,
  image: assetUrl(b.coverImageUrl),
  cover: ['#2b1a3d', '#ff2e8a'],
});

export async function getBooks({ page = 1, pageSize = 12, ...filters } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  // categoryId, authorId, searchTerm, sortBy, minPrice, maxPrice; empty ones are left out.
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value);
  });
  const data = await api(`/books?${params}`);
  return { ...data, items: data.items.map(toBook) };
}

export const getBook = async (id) => toBook(await api(`/books/${id}`));

export const getCategories = () => api('/categories');

export const getAuthors = () => api('/authors');

export const getCart = () => api('/cart');

export const addToCart = (bookId, quantity = 1) => api('/cart', { method: 'POST', body: { bookId, quantity } });
