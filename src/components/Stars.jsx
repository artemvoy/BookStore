import { StarIcon } from './icons.jsx';

// Five stars filled up to `value` (rounded). With `onChange` they become buttons for picking a rating.
export default function Stars({ value = 0, size = 16, onChange, label = 'Оцінка' }) {
  const filled = Math.round(value);

  if (!onChange) {
    return (
      <span className="stars" role="img" aria-label={`${label}: ${filled} з 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= filled ? 'is-on' : undefined}>
            <StarIcon size={size} />
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="stars stars--input" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === filled}
          aria-label={`${n} з 5`}
          className={n <= filled ? 'is-on' : undefined}
          onClick={() => onChange(n)}
        >
          <StarIcon size={size} />
        </button>
      ))}
    </span>
  );
}
