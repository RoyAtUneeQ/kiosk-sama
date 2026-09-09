export function toSeatViewerBackgroundUrl(url: string): string {
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const withoutQverse = segments.filter((segment) => segment !== 'qverse');
    const seatViewerIndex = withoutQverse.lastIndexOf('seat-viewer');
    const after = seatViewerIndex >= 0 ? withoutQverse.slice(seatViewerIndex + 1) : [];

    parsed.search = '';
    parsed.hash = '';

    if (after.length < 2 || after[after.length - 1].endsWith('.webp')) {
      parsed.pathname = `/${withoutQverse.join('/')}`;
      return parsed.toString();
    }

    parsed.pathname = `/${[
      ...withoutQverse.slice(0, seatViewerIndex + 1),
      after[0],
      after[1],
      `${after.join('-')}.webp`,
    ].join('/')}`;

    return parsed.toString();
  } catch {
    return trimmed;
  }
}
