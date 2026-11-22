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
  // FormData (file uploads) sets its own multipart Content-Type.
  const isForm = body instanceof FormData;
  return fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body && !isForm && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && (isForm ? body : JSON.stringify(body)),
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

// The backend answers in English; these are the messages a visitor can actually see.
const MESSAGES = {
  'User with this email already exists': 'Користувач з таким email вже існує',
  'Invalid email or password': 'Невірний email або пароль',
  'Email is not confirmed': 'Пошту не підтверджено. Перевірте лист у скриньці.',
  'Invalid or expired confirmation link': 'Посилання недійсне або термін його дії минув',
  'Email is already confirmed': 'Пошту вже підтверджено',
  'Invalid or expired reset link': 'Посилання недійсне або термін його дії минув',
  'Current password is incorrect': 'Поточний пароль невірний',
  'File is required': 'Оберіть файл',
  'File size must not exceed 5 MB': 'Файл має бути не більшим за 5 МБ',
  'Invalid file format. Allowed: jpg, jpeg, png, webp': 'Дозволені формати: jpg, png, webp',
};

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
    const raw = data?.message || data?.title || (typeof data === 'string' && data) || `Помилка сервера (${res.status})`;
    const message = MESSAGES[raw] ?? raw;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return data;
}

// Register only takes email and password, and the account can't sign in until the email is confirmed.
// The names typed at sign-up wait in localStorage and are saved to the profile on the first sign-in.
const pendingKey = (email) => `pendingProfile:${email.trim().toLowerCase()}`;

export async function login(email, password) {
  saveTokens(await api('/account/login', { method: 'POST', body: { email, password } }));

  let pending = null;
  try {
    pending = JSON.parse(localStorage.getItem(pendingKey(email)));
  } catch {
    pending = null;
  }
  if (pending) {
    await updateProfile(pending).catch(() => {});
    localStorage.removeItem(pendingKey(email));
  }
}

export async function register({ email, password, firstName, lastName }) {
  await api('/account/register', { method: 'POST', body: { email, password } });
  try {
    localStorage.setItem(pendingKey(email), JSON.stringify({ firstName, lastName }));
  } catch {
    // Names are optional; without storage the user can still add them in the profile.
  }
}

export const confirmEmail = (email, token) =>
  api('/account/confirm-email', { method: 'POST', body: { email, token } });

export const resendConfirmation = (email) =>
  api('/account/resend-confirmation', { method: 'POST', body: { email } });

export async function logout() {
  try {
    await api('/account/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}

export const getProfile = async () => {
  const profile = await api('/account/me');
  return { ...profile, isAdmin: profile.role === 'Admin' };
};

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append('file', file);
  return api('/account/avatar', { method: 'POST', body: form });
}

export const deleteAvatar = () => api('/account/avatar', { method: 'DELETE' });

export const subscribe = (email) => api('/newsletter/subscribe', { method: 'POST', body: { email } });

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
  // BookCard shows the rating line only for books that have reviews.
  rating: b.reviewsCount ? b.averageRating.toFixed(1) : null,
  reviews: b.reviewsCount,
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

// Setting the quantity to 0 removes the line on the backend.
export const updateCartItem = (id, quantity) => api(`/cart/${id}`, { method: 'PUT', body: { quantity } });

export const removeCartItem = (id) => api(`/cart/${id}`, { method: 'DELETE' });

// The backend stores the whole delivery/contact block as one ShippingAddress string.
export const checkout = (shippingAddress) => api('/orders/checkout', { method: 'POST', body: { shippingAddress } });

export const getAuthor = (id) => api(`/authors/${id}`);

export const getReviews = (bookId, page = 1, pageSize = 3) =>
  api(`/books/${bookId}/reviews?${new URLSearchParams({ page, pageSize })}`);

export const createReview = (bookId, review) => api(`/books/${bookId}/reviews`, { method: 'POST', body: review });

// Bonus coins: every book counts double (the "x2 YOUкоїнів" badge).
export const coinsFor = (quantity) => quantity * 2;

// Cheapest and dearest book. The whole catalog uses GET /books/price-range; inside a category,
// author or search the range comes from the first book of the cheapest and dearest sort.
export async function getPriceRange(filters = {}) {
  const filtered = Object.values(filters).some((v) => v !== undefined && v !== null && v !== '');
  if (!filtered) {
    const { minPrice, maxPrice } = await api('/books/price-range');
    return maxPrice > 0 ? { min: Math.floor(minPrice), max: Math.ceil(maxPrice) } : null;
  }
  const [cheap, dear] = await Promise.all([
    getBooks({ ...filters, sortBy: 'price_asc', pageSize: 1 }),
    getBooks({ ...filters, sortBy: 'price_desc', pageSize: 1 }),
  ]);
  if (cheap.items.length === 0) return null;
  return { min: Math.floor(cheap.items[0].price), max: Math.ceil(dear.items[0].price) };
}

// Admin: catalog editing (the backend allows these only for users whose role is Admin).
const crud = (resource) => ({
  create: (data) => api(`/${resource}`, { method: 'POST', body: data }),
  update: (id, data) => api(`/${resource}/${id}`, { method: 'PUT', body: data }),
  remove: (id) => api(`/${resource}/${id}`, { method: 'DELETE' }),
});

export const adminBooks = crud('books');
export const adminCategories = crud('categories');
export const adminAuthors = crud('authors');
