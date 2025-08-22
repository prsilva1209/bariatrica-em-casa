export function normalizeYouTubeEmbed(input: string): string {
  if (!input) return '';
  const raw = input.trim();

  // If an iframe HTML was pasted, try to extract the src
  const srcMatch = raw.match(/src\s*=\s*"([^"]+)"/i);
  const initial = srcMatch ? srcMatch[1] : raw;

  if (initial.startsWith('http')) {
    try {
      const url = new URL(initial);
      let videoId = '';
      
      // youtu.be short links
      if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.replace(/^\//, '').split('/')[0];
      }
      // shorts
      else if (url.pathname.startsWith('/shorts/')) {
        videoId = url.pathname.split('/')[2] || url.pathname.split('/')[1];
      }
      // watch?v=
      else if (url.searchParams.get('v')) {
        videoId = url.searchParams.get('v')!;
      }
      // already /embed/
      else if (url.pathname.startsWith('/embed/')) {
        videoId = url.pathname.split('/')[2] || url.pathname.split('/')[1];
      }
      // fallback: last segment as ID
      else {
        const segs = url.pathname.split('/').filter(Boolean);
        if (segs.length) {
          videoId = segs[segs.length - 1];
        }
      }

      if (videoId) {
        // Clean video ID (remove query parameters like si)
        videoId = videoId.split('?')[0].split('&')[0];
        // Use youtube-nocookie for better privacy and performance
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
      }
      
      return initial;
    } catch {
      // fall through to treat as ID
    }
  }

  // Assume plain ID
  const idMatch = initial.match(/[a-zA-Z0-9_-]{6,}/);
  const id = idMatch ? idMatch[0] : initial;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}
