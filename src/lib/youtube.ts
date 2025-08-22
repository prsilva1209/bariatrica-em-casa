export function normalizeYouTubeEmbed(input: string): string {
  if (!input) return '';
  const raw = input.trim();

  // If an iframe HTML was pasted, try to extract the src
  const srcMatch = raw.match(/src\s*=\s*"([^"]+)"/i);
  const initial = srcMatch ? srcMatch[1] : raw;

  if (initial.startsWith('http')) {
    try {
      const url = new URL(initial);
      // youtu.be short links
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace(/^\//, '').split('/')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      // shorts
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/')[2] || url.pathname.split('/')[1];
        return `https://www.youtube.com/embed/${id}`;
      }
      // watch?v=
      const v = url.searchParams.get('v');
      if (v) {
        return `https://www.youtube.com/embed/${v}`;
      }
      // already /embed/
      if (url.pathname.startsWith('/embed/')) {
        return `https://www.youtube.com${url.pathname}${url.search}`;
      }
      // fallback: last segment as ID
      const segs = url.pathname.split('/').filter(Boolean);
      if (segs.length) {
        const id = segs[segs.length - 1];
        return `https://www.youtube.com/embed/${id}`;
      }
      return initial;
    } catch {
      // fall through to treat as ID
    }
  }

  // Assume plain ID
  const idMatch = initial.match(/[a-zA-Z0-9_-]{6,}/);
  const id = idMatch ? idMatch[0] : initial;
  return `https://www.youtube.com/embed/${id}`;
}
