// Prefixes files from public/ with the site's base path, so they load on GitHub Pages (/BookStore/) too.
// Full URLs (http..., data:...) and empty values pass through unchanged.
export default function assetUrl(path) {
  if (!path || !path.startsWith('/')) return path;
  return `${import.meta.env.BASE_URL}${path.slice(1)}`;
}
