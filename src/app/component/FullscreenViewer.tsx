import { useEffect } from "react";
import { TwitterUserMedia } from "@/lib/twitterProvider";

interface FullscreenMediaViewerProps {
  media: TwitterUserMedia;
  onClose: () => void;
}

export function FullscreenMediaViewer({
  media,
  onClose,
}: FullscreenMediaViewerProps) {
  // prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (media.video) {
    media.video = media.video.split("?")[0];
  }

  if (media.gif) {
    media.gif = media.gif.split("?")[0];
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={(e) => e.stopPropagation()}>
      {/* close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white text-xl"
      >
        ✕
      </button>

      {/* media */}
      <div className="flex-1 flex items-center justify-center">
        {media.type === "photo" && media.image && (
          <img
            src={media.image}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        )}

        {(media.type === "video" || media.type === "animated_gif") && (
            <div className="relative max-h-full max-w-full">
                {/* thumbnail */}
                {media.image && (
                <img
                    src={media.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain"
                />
                )}

                {/* video */}
                <video
                src={media.type === "video" ? media.video : media.gif}
                muted={media.type === "animated_gif"}
                autoPlay
                loop={media.type === "animated_gif"}
                playsInline
                controls={media.type === "video"}
                preload="metadata"
                className="relative z-10 max-h-full max-w-full"
                />
            </div>
        )}
      </div>

      {/* metadata */}
      <div className="p-4 text-sm text-gray-300 border-t border-white/10">
        <div className="flex gap-4">
          <span>❤️ {media.public_metrics.like_count}</span>
          <span>🔁 {media.public_metrics.retweet_count}</span>
          <span>💬 {media.public_metrics.reply_count}</span>
          <span>
            {new Date(media.created_at).toLocaleDateString()}
          </span>
        </div>
        {media.text && (
          <p className="mt-2 text-gray-400 line-clamp-3">{media.text}</p>
        )}
      </div>
    </div>
  );
}
