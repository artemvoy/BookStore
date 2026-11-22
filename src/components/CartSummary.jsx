import { Link } from 'react-router-dom';
import { coinsFor } from '../api.js';

export const cartTotals = (items) => ({
  count: items.reduce((sum, i) => sum + i.quantity, 0),
  total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
});

// Right-hand totals card of the cart and checkout pages. `action` is the main button
// (a link on the cart page, the form's submit button at checkout).
export default function CartSummary({ items, action, label = 'Товарів у кошику' }) {
  const { count, total } = cartTotals(items);
  return (
    <aside className="cart-summary">
      <p className="cart-summary-count">
        {label}: {count}
      </p>
      <p className="coins-note">
        На ваш рахунок буде нараховано <strong>+{coinsFor(count)} YOUкоїнів</strong>
      </p>
      <div className="cart-summary-total">
        <span>До сплати:</span>
        <strong>{total} грн</strong>
      </div>
      {action}
      <Link to="/catalog" className="btn-outline-accent btn-block cart-summary-continue">
        Продовжити покупки
      </Link>
    </aside>
  );
}
