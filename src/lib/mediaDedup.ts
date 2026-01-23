const STORAGE_KEY = "seen_media_ids";

function getSeenMedia(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenMedia(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function filterNewMedia(media: any[]) {
  const seen = getSeenMedia();
  const fresh: any[] = [];

  for (const item of media) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      fresh.push(item);
    }
  }

  saveSeenMedia(seen);
  return fresh;
}

export function resetSeenMedia() {
  localStorage.removeItem(STORAGE_KEY);
}
