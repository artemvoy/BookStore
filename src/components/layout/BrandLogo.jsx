import { Link } from 'react-router-dom';
import LogoMark from '../LogoMark.jsx';

// "ЧитаYou" logo linking home; `light` turns the teal parts white for the dark footer.
export default function BrandLogo({ light = false }) {
  return (
    <Link to="/" className={`brand${light ? ' brand--light' : ''}`} aria-label="ЧитаYou — на головну">
      <LogoMark width={72} />
    </Link>
  );
}
