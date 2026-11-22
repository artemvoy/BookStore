import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { checkout, getCart } from '../api.js';
import BookCover from '../components/BookCover.jsx';
import CartSummary from '../components/CartSummary.jsx';
import { ChevronRight, PlusIcon } from '../components/icons.jsx';
import useAuth from '../useAuth.js';
import useProfile from '../useProfile.js';
import { EMAIL_RE } from '../validation.js';
import { EmptyCart, coverOf } from './CartPage.jsx';

// Each delivery method asks for the city plus one more detail (branch, parcel locker or street address).
const DELIVERY = [
  { id: 'np-branch', label: 'Нова пошта (відділення)', detail: 'Номер відділення', placeholder: 'Наприклад, 12', free: true },
  { id: 'np-locker', label: 'Нова пошта (поштомат)', detail: 'Номер поштомату', placeholder: 'Наприклад, 5341' },
  { id: 'np-courier', label: "Нова пошта (кур'єр)", detail: 'Адреса', placeholder: 'Вулиця, будинок, квартира' },
  { id: 'up-branch', label: 'Укрпошта (відділення)', detail: 'Індекс відділення', placeholder: 'Наприклад, 01001' },
  { id: 'up-courier', label: "Укрпошта (кур'єр)", detail: 'Адреса', placeholder: 'Вулиця, будинок, квартира' },
];

const PAYMENT = [
  { id: 'card', label: 'Оплата карткою при отриманні' },
  { id: 'cash', label: 'Оплата готівкою при отриманні' },
];

const CITIES = ['Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Вінниця', 'Івано-Франківськ', 'Полтава', 'Чернігів'];

const PHONE_RE = /^\d{9}$/;

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "Введіть ім'я";
  if (!form.lastName.trim()) errors.lastName = 'Введіть прізвище';
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Невірний формат email';
  if (!PHONE_RE.test(form.phone.replace(/\D/g, ''))) errors.phone = '9 цифр після +380';
  if (!form.city.trim()) errors.city = 'Вкажіть місто';
  if (!form.detail.trim()) errors.detail = 'Заповніть це поле';
  if (!form.payment) errors.payment = 'Оберіть спосіб оплати';
  return errors;
}

function Field({ label, error, children }) {
  return (
    <label className={`checkout-field${error ? ' has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function PromoCode() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  return (
    <section className="promo-box">
      <div className="promo-box-head">
        <h2>Промокод</h2>
        {!open && (
          <button type="button" className="promo-box-add" onClick={() => setOpen(true)}>
            <PlusIcon size={16} /> Додати промокод
          </button>
        )}
      </div>
      {open && (
        <div className="promo-box-form">
          <input
            value={code}
            placeholder="Введіть промокод"
            aria-label="Промокод"
            onChange={(e) => {
              setCode(e.target.value);
              setMessage('');
            }}
          />
          <button
            type="button"
            className="btn-primary"
            disabled={!code.trim()}
            // The backend has no promo codes yet, so every code is reported as unknown.
            onClick={() => setMessage('Такого промокоду не існує')}
          >
            Застосувати
          </button>
          {message && <small className="form-status form-status--error">{message}</small>}
        </div>
      )}
    </section>
  );
}

export default function CheckoutPage() {
  const loggedIn = useAuth();
  const profile = useProfile();
  const navigate = useNavigate();
  const { refreshCart } = useOutletContext();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    delivery: DELIVERY[0].id,
    city: '',
    detail: '',
    payment: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (loggedIn) getCart().then(setItems).catch(() => setItems([]));
  }, [loggedIn]);

  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      firstName: f.firstName || profile.firstName || '',
      lastName: f.lastName || profile.lastName || '',
      email: f.email || profile.email,
    }));
  }, [profile]);

  if (!loggedIn) return <Navigate to="/sign-in" replace state={{ from: '/checkout' }} />;

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };
  const update = (name) => (e) => set(name, e.target.value);

  const delivery = DELIVERY.find((d) => d.id === form.delivery);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector('.checkout-field.has-error input, .checkout-radios.has-error input')?.focus();
      return;
    }

    const phone = `+380${form.phone.replace(/\D/g, '')}`;
    const address = [
      `Отримувач: ${form.firstName.trim()} ${form.lastName.trim()}, ${phone}, ${form.email.trim()}`,
      `Доставка: ${delivery.label}, м. ${form.city.trim()}, ${delivery.detail.toLowerCase()}: ${form.detail.trim()}`,
      `Оплата: ${PAYMENT.find((p) => p.id === form.payment).label}`,
    ].join('\n');

    setSending(true);
    setServerError('');
    try {
      const { orderId } = await checkout(address);
      refreshCart();
      navigate('/order/success', { replace: true, state: { orderId, cover: coverOf(items[0]) } });
    } catch (err) {
      setServerError(err.message);
      setSending(false);
    }
  };

  let body;
  if (!items) body = <p className="catalog-empty">Завантаження…</p>;
  else if (items.length === 0) body = <EmptyCart />;
  else
    body = (
      <form className="cart-layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout-main">
          <section className="cart-panel">
            <div className="cart-panel-head">
              <h2 className="cart-panel-title">Замовлення</h2>
              <Link to="/cart" className="checkout-edit" aria-label="Змінити замовлення">
                ✎
              </Link>
            </div>
            <ul className="cart-lines">
              {items.map((item) => (
                <li key={item.id} className="cart-line cart-line--compact">
                  <span className="cart-line-cover">
                    <BookCover book={coverOf(item)} />
                  </span>
                  <div className="cart-line-info">
                    <div className="cart-line-title">
                      <span>{item.bookTitle}</span>
                      <span className="coins-badge">x2 YOUкоїнів</span>
                    </div>
                    <p className="cart-line-author">{item.authorFullName}</p>
                    <p className="cart-line-qty">{item.quantity} шт</p>
                  </div>
                  <div className="cart-line-side">
                    <strong className="cart-line-price">{item.price * item.quantity} грн</strong>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="cart-panel">
            <h2 className="cart-panel-title">Ваші контактні дані</h2>
            <div className="checkout-grid">
              <Field label="Ім'я" error={errors.firstName}>
                <input autoComplete="given-name" placeholder="Введіть ваше ім'я" value={form.firstName} onChange={update('firstName')} />
              </Field>
              <Field label="Прізвище" error={errors.lastName}>
                <input autoComplete="family-name" placeholder="Введіть ваше прізвище" value={form.lastName} onChange={update('lastName')} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" autoComplete="email" placeholder="Введіть вашу електронну адресу" value={form.email} onChange={update('email')} />
              </Field>
              <Field label="Номер телефону" error={errors.phone}>
                <span className="phone-input">
                  <span className="phone-flag" aria-hidden="true" />
                  <span className="phone-prefix">+380</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="XX XXX XX XX"
                    maxLength={12}
                    value={form.phone}
                    onChange={update('phone')}
                  />
                </span>
              </Field>
            </div>

            <h2 className="cart-panel-title checkout-subtitle">Доставка</h2>
            <div className="checkout-radios">
              {DELIVERY.map((d) => (
                <div key={d.id} className="checkout-option">
                  <label className="radio">
                    <input
                      type="radio"
                      name="delivery"
                      checked={form.delivery === d.id}
                      onChange={() => {
                        set('delivery', d.id);
                        set('detail', '');
                      }}
                    />
                    {d.label}
                    {d.free && <span className="free-delivery">Безкоштовна доставка</span>}
                  </label>
                  {form.delivery === d.id && (
                    <div className="checkout-grid checkout-option-fields">
                      <Field label="Місто" error={errors.city}>
                        <input list="checkout-cities" placeholder="Виберіть місто" value={form.city} onChange={update('city')} />
                      </Field>
                      <Field label={d.detail} error={errors.detail}>
                        <input placeholder={d.placeholder} value={form.detail} onChange={update('detail')} />
                      </Field>
                    </div>
                  )}
                </div>
              ))}
              <datalist id="checkout-cities">
                {CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <h2 className="cart-panel-title checkout-subtitle">Оплата</h2>
            <div className={`checkout-radios${errors.payment ? ' has-error' : ''}`}>
              {PAYMENT.map((p) => (
                <label key={p.id} className="radio">
                  <input type="radio" name="payment" checked={form.payment === p.id} onChange={() => set('payment', p.id)} />
                  {p.label}
                </label>
              ))}
              {errors.payment && <small className="form-status form-status--error">{errors.payment}</small>}
            </div>
          </section>
        </div>

        <div className="checkout-side">
          <PromoCode />
          <CartSummary
            items={items}
            label="Всього товарів"
            action={
              <>
                {Object.values(errors).some(Boolean) && (
                  <p className="form-status form-status--error" role="alert">
                    Перевірте виділені поля
                  </p>
                )}
                {serverError && (
                  <p className="form-status form-status--error" role="alert">
                    {serverError}
                  </p>
                )}
                <button type="submit" className="btn-accent btn-block" disabled={sending}>
                  {sending ? 'Оформлюємо…' : 'Оформити замовлення'}
                </button>
              </>
            }
          />
        </div>
      </form>
    );

  return (
    <div className="cart-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <ChevronRight size={14} />
          <Link to="/cart">Ваша корзина</Link>
          <ChevronRight size={14} />
          <span aria-current="page">Оформлення замовлення</span>
        </nav>
        <h1 className="page-title checkout-title">Оформлення замовлення</h1>
        {body}
      </div>
    </div>
  );
}
