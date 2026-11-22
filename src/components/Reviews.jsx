import { useEffect, useState } from 'react';
import { createReview, getReviews } from '../api.js';
import useProfile from '../useProfile.js';
import { EMAIL_RE } from '../validation.js';
import LogoMark from './LogoMark.jsx';
import Modal from './Modal.jsx';
import Pagination from './Pagination.jsx';
import Stars from './Stars.jsx';
import TextField from './TextField.jsx';

const PAGE_SIZE = 3;

// dd/mm/yy, as in the mockup
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' }).replaceAll('.', '/');

function ReviewForm({ bookId, onDone, onClose }) {
  const profile = useProfile();
  const [form, setForm] = useState({ name: '', email: '', text: '', rating: 5 });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Signed-in readers get their name and email filled in.
  useEffect(() => {
    if (!profile) return;
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    setForm((f) => ({ ...f, name: f.name || name, email: f.email || profile.email }));
  }, [profile]);

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const filled = form.name.trim() && form.email.trim() && form.text.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!EMAIL_RE.test(form.email.trim())) found.email = 'Невірний формат email';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    setServerError('');
    try {
      await createReview(bookId, {
        name: form.name.trim(),
        email: form.email.trim(),
        text: form.text.trim(),
        rating: form.rating,
      });
      setSent(true);
      onDone();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Modal label="Дякуємо за відгук" onClose={onClose}>
        <div className="modal-thanks">
          <LogoMark width={56} withText={false} className="modal-logo" />
          <h2 className="auth-title auth-title--upper">Дякуємо!</h2>
          <p className="auth-subtitle auth-subtitle--small">Ваш відгук опубліковано</p>
          <span className="modal-check" aria-hidden="true">
            ✓
          </span>
          <button type="button" className="btn" onClick={onClose}>
            Закрити
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal label="Залишити відгук" onClose={onClose}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <header className="auth-header">
          <LogoMark width={56} withText={false} className="modal-logo" />
          <h2 className="auth-subtitle">Залишити відгук</h2>
        </header>
        <div className="auth-fields">
          <div className="field">
            <span className="field-label">Ваша оцінка</span>
            <Stars value={form.rating} size={28} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
          </div>
          <TextField label="Ім'я" placeholder="Введіть ім'я" value={form.name} onChange={update('name')} />
          <TextField
            label="Email"
            type="email"
            placeholder="Введіть email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
          />
          <label className="field">
            <span className="field-label">Відгук</span>
            <textarea
              className="field-textarea"
              rows={4}
              maxLength={2000}
              placeholder="Введіть ваш відгук"
              value={form.text}
              onChange={update('text')}
            />
          </label>
        </div>
        <div className="auth-actions">
          {serverError && (
            <p className="field-error" role="alert">
              {serverError}
            </p>
          )}
          <button type="submit" className="btn" disabled={!filled || sending}>
            {sending ? 'Надсилання…' : 'Надіслати відгук'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// "Відгуки" block of the book page: three reviews per page and the "leave a review" dialog.
export default function Reviews({ bookId, onChange }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [writing, setWriting] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [bookId]);

  useEffect(() => {
    let alive = true;
    getReviews(bookId, page, PAGE_SIZE)
      .then((d) => alive && setData(d))
      .catch(() => alive && setData({ items: [], totalPages: 0, totalItems: 0 }));
    return () => {
      alive = false;
    };
  }, [bookId, page, reload]);

  return (
    <section className="reviews" id="reviews">
      <div className="reviews-head">
        <h2 className="reviews-title">Відгуки</h2>
        <button type="button" className="btn-accent btn-small" onClick={() => setWriting(true)}>
          Залишити відгук
        </button>
      </div>

      {data && data.items.length === 0 && (
        <p className="reviews-empty">Відгуків ще немає. Будьте першим, хто поділиться враженнями!</p>
      )}
      <ul className="reviews-list">
        {data?.items.map((r) => (
          <li key={r.id} className="review">
            <div className="review-head">
              <span className="review-name">{r.authorName}</span>
              <span className="review-rating">
                {r.rating}/5 <Stars value={r.rating} />
              </span>
            </div>
            <p className="review-text">{r.text}</p>
            <time className="review-date" dateTime={r.createdAt}>
              {formatDate(r.createdAt)}
            </time>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={setPage} />

      {writing && (
        <ReviewForm
          bookId={bookId}
          onClose={() => setWriting(false)}
          onDone={() => {
            setPage(1);
            setReload((r) => r + 1);
            onChange?.();
          }}
        />
      )}
    </section>
  );
}
