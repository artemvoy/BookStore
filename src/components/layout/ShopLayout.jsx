import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { addToCart as addToServerCart, getCart, isLoggedIn } from '../../api.js';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const countItems = (items) => items.reduce((sum, item) => sum + item.quantity, 0);

// Header + footer around storefront pages; the cart lives on the server, so adding needs a signed-in user.
export default function ShopLayout() {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = () => navigate('/sign-in', { state: { from: location.pathname + location.search } });

  const loadCart = () => {
    if (!isLoggedIn()) {
      setCartCount(0);
      return;
    }
    getCart()
      .then((items) => setCartCount(countItems(items)))
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('auth-change', loadCart);
    return () => window.removeEventListener('auth-change', loadCart);
  }, []);

  // Resolves to true once the server has the item; otherwise sends the user to sign in (or alerts).
  const addToCart = async (book, quantity = 1) => {
    if (!isLoggedIn()) {
      signIn();
      return false;
    }
    try {
      await addToServerCart(book.id, quantity);
      loadCart();
      return true;
    } catch (err) {
      if (err.status === 401) signIn();
      else window.alert(err.message);
      return false;
    }
  };

  return (
    <div className="shop">
      <Header cartCount={cartCount} />
      <main>
        <Outlet context={{ addToCart, refreshCart: loadCart }} />
      </main>
      <Footer />
    </div>
  );
}
