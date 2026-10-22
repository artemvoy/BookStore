// Owl mark from the Figma design, redrawn as inline SVG.
export default function Logo({ size = 64 }) {
  return (
    <svg
      className="logo"
      width={size}
      height={(size * 40) / 64}
      viewBox="0 0 64 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 6 C14 0 26 4 32 10 C38 4 50 0 62 6 C52 6 42 10 32 18 C22 10 12 6 2 6Z" fill="currentColor" />
      <circle cx="20" cy="24" r="10" fill="currentColor" />
      <circle cx="44" cy="24" r="10" fill="currentColor" />
      <circle cx="20" cy="24" r="6.5" fill="#F1F1F1" />
      <circle cx="44" cy="24" r="6.5" fill="#F1F1F1" />
      <circle cx="21" cy="25" r="3.5" fill="currentColor" />
      <circle cx="43" cy="25" r="3.5" fill="currentColor" />
      <path d="M28.5 30 L32 38 L35.5 30 Z" fill="currentColor" />
    </svg>
  );
}
