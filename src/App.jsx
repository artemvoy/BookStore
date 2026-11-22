import { Navigate, Route, Routes } from 'react-router-dom';
import ShopLayout from './components/layout/ShopLayout.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import BookPage from './pages/BookPage.jsx';
import AuthorPage from './pages/AuthorPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/admin/Admin.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ConfirmEmail from './pages/ConfirmEmail.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<ShopLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:slug" element={<Catalog />} />
        <Route path="/book/:id" element={<BookPage />} />
        <Route path="/author/:id" element={<AuthorPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/success" element={<OrderSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
