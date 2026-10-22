// Grey backdrop + centred card, shared by Sign In, Sign Up and password recovery.
export default function AuthModal({ children, onClose }) {
  return (
    <div className="auth-backdrop">
      <div className="auth-card" role="dialog" aria-modal="true">
        <button type="button" className="auth-close" aria-label="Закрити" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
