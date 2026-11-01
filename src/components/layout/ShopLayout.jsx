import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

// Header + footer around storefront pages; the cart counter is shared through the outlet context.
export default function ShopLayout() {
  const [cart, setCart] = useState([]);
  const addToCart = (book) => setCart((items) => [...items, book.id]);

  return (
    <div className="shop">
      <Header cartCount={cart.length} />
      <main>
        <Outlet context={{ addToCart }} />
      </main>
      <Footer />
    </div>
  );
}
