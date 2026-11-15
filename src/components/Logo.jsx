import LogoMark from './LogoMark.jsx';

// Logo above the sign-in / sign-up forms.
export default function Logo({ size = 96 }) {
  return <LogoMark className="logo" width={size} />;
}
