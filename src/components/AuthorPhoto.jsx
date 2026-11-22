// Author's photo, or their initials on a tinted square when no photo URL is set.
export default function AuthorPhoto({ author, className = '' }) {
  const name = `${author.firstName} ${author.lastName}`.trim();
  if (author.photoUrl) {
    return <img className={`author-photo ${className}`} src={author.photoUrl} alt={name} />;
  }
  const initials = [author.firstName, author.lastName].map((p) => p?.[0] ?? '').join('');
  return (
    <span className={`author-photo author-photo--initials ${className}`} role="img" aria-label={name}>
      {initials}
    </span>
  );
}
