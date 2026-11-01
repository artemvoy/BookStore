import { Link } from 'react-router-dom';
import { ChevronRight } from './icons.jsx';

export default function SectionHeader({ title, to = '/catalog' }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      <Link to={to} className="pill-accent">
        Усі добірки <ChevronRight size={14} />
      </Link>
    </div>
  );
}
