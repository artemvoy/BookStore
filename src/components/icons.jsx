// Line icons used across the storefront; they inherit colour via currentColor.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const MenuIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const PhoneIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

export const UserIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const HeartIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9Z" />
  </svg>
);

export const CartIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M3 4h2l2.4 11h10.2L20 7H6.2" />
    <circle cx="9" cy="19.5" r="1.5" />
    <circle cx="17" cy="19.5" r="1.5" />
  </svg>
);

export const StarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"
    />
  </svg>
);

export const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const RefreshIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />
  </svg>
);

export const FilterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const PinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 21s-7-6.3-7-12a7 7 0 0 1 14 0c0 5.7-7 12-7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const MailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const social = (d) =>
  function SocialIcon({ size = 28 }) {
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="5" fill="#fff" />
        <path d={d} fill="currentColor" />
      </svg>
    );
  };

export const FacebookIcon = social(
  'M15.5 23v-7h2.4l.4-2.8h-2.8v-1.8c0-.8.2-1.4 1.4-1.4h1.5V7.5a19 19 0 0 0-2.2-.1c-2.2 0-3.6 1.3-3.6 3.7v2.1H10.2V16h2.4v7z'
);
export const TwitterIcon = social(
  'M22 9.3c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.3.6-2.1.8a3.3 3.3 0 0 0-5.6 3A9.3 9.3 0 0 1 7 8.4a3.3 3.3 0 0 0 1 4.4c-.5 0-1-.2-1.5-.4 0 1.6 1.1 2.9 2.6 3.2-.5.1-1 .2-1.5.1.4 1.3 1.6 2.3 3.1 2.3A6.6 6.6 0 0 1 6 19.4a9.3 9.3 0 0 0 14.3-8.3c.7-.5 1.2-1 1.7-1.8'
);
export const YoutubeIcon = social(
  'M22.6 10.2a2.3 2.3 0 0 0-1.6-1.6C19.6 8.2 14 8.2 14 8.2s-5.6 0-7 .4a2.3 2.3 0 0 0-1.6 1.6C5 11.6 5 14 5 14s0 2.4.4 3.8c.2.8.8 1.4 1.6 1.6 1.4.4 7 .4 7 .4s5.6 0 7-.4a2.3 2.3 0 0 0 1.6-1.6c.4-1.4.4-3.8.4-3.8s0-2.4-.4-3.8M12.2 16.6v-5.2l4.6 2.6z'
);
export const InstagramIcon = social(
  'M14 7.5c-1.8 0-2 0-2.7.1-2.6.1-4.1 1.6-4.2 4.2v5.4c.1 2.6 1.6 4.1 4.2 4.2h5.4c2.6-.1 4.1-1.6 4.2-4.2v-5.4c-.1-2.6-1.6-4.1-4.2-4.2zm0 1.2h2.6c1.9.1 2.8 1 2.9 2.9v4.8c-.1 1.9-1 2.8-2.9 2.9h-5.2c-1.9-.1-2.8-1-2.9-2.9v-4.8c.1-1.9 1-2.8 2.9-2.9zm0 2a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6m0 5.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2m3.4-6.3a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6'
);
