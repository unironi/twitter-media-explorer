import { useEffect, useRef, useState } from "react";
import { useInfiniteScroll } from "../hooks/infiniteScroll";
import { TwitterUser } from "@/lib/twitterProvider";
import { useAutoPauseVideo } from "../hooks/autoPauseVideo";

interface ViewMoreModalProps {
  user: TwitterUser;
  onClose: () => void;
}

// individual media card for timeline
function MediaFeedItem({ item }: { item: any }) {

const videoRef = useRef<HTMLVideoElement>(null);

  useAutoPauseVideo(videoRef);
  return (
    <div className="border-b border-gray-200 py-4 px-2">
      {/* MEDIA */}

      {(item.type === "video" || item.type === "animated_gif") && (
            <video
            ref={videoRef}
            src={`/api/twitterVideo?url=${encodeURIComponent((item.type === "video" ? item.video : item.gif)!)}`}
            muted={item.type === "animated_gif"}
            autoPlay
            loop={item.type === "animated_gif"}
            playsInline
            controls={item.type === "video"}
            preload="metadata"
            className="relative z-10 max-h-full max-w-full"
            />
        )}

      {/* TEXT-ONLY TWEET */}
      {!item.video && !item.gif && !item.image && (
        <div className="rounded-lg bg-white shadow p-4 text-sm text-gray-800">
          {item.text}
        </div>
      )}

      {/* TWEET TEXT */}
      {item.text && (
        <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
          {item.text}
        </p>
      )}

      {/* METADATA */}
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span>❤️ {item.public_metrics?.like_count ?? 0}</span>
        <span>🔁 {item.public_metrics?.retweet_count ?? 0}</span>
        <span>💬 {item.public_metrics?.reply_count ?? 0}</span>
        <span className="ml-auto">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export function ViewMoreModal({ user, onClose }: ViewMoreModalProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  async function loadMoreMedia() {
    if (loading || !hasMore) return;

    setLoading(true);

    const res = await fetch(
      `/api/userMedia?userId=${user.id}&cursor=${encodeURIComponent(cursor)}`
    );

    const data = await res.json();

    setMedia((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const next = (data.media ?? []).filter((m: { id: any; }) => !seen.has(m.id));
        return [...prev, ...next];
    });
    setCursor(data.next_cursor ?? "");
    setHasMore(Boolean(data.next_cursor));
    setLoading(false);
  }

  useEffect(() => {
    loadMoreMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMoreRef = useInfiniteScroll(loadMoreMedia, hasMore, loading);

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 h-full"
      onClick={onClose}
    >
      <div
        className="mx-auto h-full max-w-md bg-white overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 pb-4 pt-4 flex items-center">
          
          <div className="font-semibold text-m">
            @{user.username}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 rounded-full bg-black/70 text-white w-9 h-9 flex items-center justify-center hover:bg-black"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* FEED */}
        <div>
          {media.map((item) => (
            <MediaFeedItem key={`${item.id}-${item.created_at}`} item={item} />
          ))}

          {!loading && media.length === 0 && (
            <p className="text-center text-gray-400 py-12">
              This user hasn’t posted any original media
            </p>
          )}

          {loading && (
            <p className="text-center text-gray-400 py-4">
              Loading…
            </p>
          )}

          <div ref={loadMoreRef} className="h-12" />
        </div>
      </div>
    </div>
  );
}
