import { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  TwitterIcon,
  YoutubeIcon,
} from '../icons.jsx';
import { EMAIL_RE } from '../../validation.js';
import { subscribe } from '../../api.js';
import LogoMark from '../LogoMark.jsx';
import Modal from '../Modal.jsx';

function Subscribe() {
  const [form, setForm] = useState({ name: '', email: '' });
  // { type: 'error' | 'pending', text } for the line under the form; thanks opens the dialog.
  const [status, setStatus] = useState(null);
  const [thanks, setThanks] = useState(null);

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(form.email.trim())) {
      setStatus({ type: 'error', text: 'Невірний формат email' });
      return;
    }
    setStatus({ type: 'pending' });
    try {
      const { message } = await subscribe(form.email.trim());
      // The backend answers 200 both for a new and an existing subscription.
      setThanks(/already/i.test(message ?? '') ? 'already' : 'new');
      setStatus(null);
      setForm({ name: '', email: '' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    }
  };

  return (
    <section className="subscribe">
      <div className="container subscribe-inner">
        <div>
          <h2 className="subscribe-title">Підпишись на новини та розсилки</h2>
          <p className="subscribe-text">
            Інформація про новинки, книжкові добірки , секретні промокоди
          </p>
        </div>
        <form className="subscribe-form" onSubmit={handleSubmit} noValidate>
          <input placeholder="Ваше ім'я" aria-label="Ваше ім'я" value={form.name} onChange={update('name')} />
          <input
            type="email"
            placeholder="Ваш email"
            aria-label="Ваш email"
            className={status?.type === 'error' ? 'is-invalid' : undefined}
            value={form.email}
            onChange={update('email')}
          />
          <button type="submit" className="btn-accent" disabled={status?.type === 'pending'}>
            {status?.type === 'pending' ? 'Підписуємо…' : 'Підписатися'}
          </button>
          {status?.text && (
            <p className="subscribe-status subscribe-status--error" role="alert">
              {status.text}
            </p>
          )}
        </form>
      </div>
      {thanks && (
        <Modal label="Дякуємо за підписку" onClose={() => setThanks(null)}>
          <div className="modal-thanks">
            <LogoMark width={56} withText={false} className="modal-logo" />
            <h2 className="auth-title auth-title--upper">Дякуємо!</h2>
            <p className="auth-subtitle auth-subtitle--small">
              {thanks === 'already'
                ? 'Цей email вже підписаний на нашу розсилку.'
                : 'Ви підписалися на новини, книжкові добірки та секретні промокоди.'}
            </p>
            <span className="modal-check" aria-hidden="true">
              ✓
            </span>
            <button type="button" className="btn" onClick={() => setThanks(null)}>
              Закрити
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

const GENERAL = ['Видавництва', 'Відгуки', 'Події', 'Автори', 'Розпродаж'];
const CATALOG = [
  'Новинки',
  'Дитяча література',
  'Художня література',
  'Спорт,здоров’я',
  'Наука і Техніка',
  'Історичні книги',
  'Навчальна література',
  'Детективи та трилери',
  'Бізнес та мотивація',
  'Романи про кохання',
];

export default function Footer() {
  return (
    <>
      <Subscribe />
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <BrandLogo light />
            <ul className="footer-links">
              <li><a href="#">Про нас</a></li>
              <li><a href="#">Книги</a></li>
              <li><a href="#">Оплата та Доставка</a></li>
            </ul>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" aria-label="Twitter"><TwitterIcon /></a>
              <a href="#" aria-label="YouTube"><YoutubeIcon /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            </div>
          </div>

          <div>
            <h3 className="footer-heading">Загальне</h3>
            <ul className="footer-links">
              {GENERAL.map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Каталог</h3>
            <ul className="footer-links footer-links--cols">
              {CATALOG.map((l) => (
                <li key={l}><Link to="/catalog">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Контактна інформація</h3>
            <ul className="footer-contacts">
              <li><PinIcon /> «Книгрід», а/с 84, Київ, 61001</li>
              <li><PhoneIcon /> <a href="tel:+380681236787">+38(068) 123 67 87</a></li>
              <li><MailIcon /> <a href="mailto:help@knygread.ua">help@knygread.ua</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
