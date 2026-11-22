import { useEffect } from 'react';
import { CloseIcon } from '../../components/icons.jsx';

// Centred dialog for the admin add/edit forms; Esc or the backdrop closes it.
export default function AdminModal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="admin-modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Закрити" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Label + control + error line used by every admin form.
export function AdminField({ label, error, children }) {
  return (
    <label className={`admin-field${error ? ' has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
