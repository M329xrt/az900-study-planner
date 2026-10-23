/**
 * The name stored on a user record is often all caps or an email handle.
 * This returns it neatly capitalised, falling back to the email's first part.
 */
export function displayName(user) {
  const raw = (user?.full_name || '').trim() || (user?.email || '').split('@')[0];
  if (!raw) return '';

  return raw
    .replace(/[._]+/g, ' ')
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}