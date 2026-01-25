import { useState, useEffect } from "react";
import { TwitterUserMedia } from "@/lib/twitterProvider";

interface FullscreenMediaViewerProps {
  media: TwitterUserMedia;
  onClose: () => void;
}

export function FullscreenMediaViewer({
  media,
  onClose,
}: FullscreenMediaViewerProps) {

    const [mediaError, setMediaError] = useState(false);

  // prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // if (media.video) { // to remove tag parameter at very end of video URL to see if that would resolve the 403 forbidden error (it didn't)
  //   media.video = media.video.split("?")[0];
  //   //media.video = media.video.replace(/^(https:\/\/)/,"")
  // }

  // if (media.gif) {
  //   media.gif = media.gif.split("?")[0];
  // }

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

        {media.type === "text" && (
          <div
            className="bg-white rounded-xl max-w-md w-full p-4 mr-4 ml-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {media.text}
            </p>
          </div>
        )}

        {media.type === "photo" && media.image && (
          <div className="flex items-center justify-center max-h-[70vh]">
            <img
              src={media.image}
              alt=""
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
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

              {/* video or gif */}

              <video
              src={`/api/twitterVideo?url=${encodeURIComponent((media.type === "video" ? media.video : media.gif)!)}`}
              /*src={media.type === "video" ? media.video : media.gif}*/
              onError={() => setMediaError(true)}
              muted={media.type === "animated_gif"}
              autoPlay
              loop={media.type === "animated_gif"}
              playsInline
              controls={media.type === "video"}
              preload="metadata"
              className="relative z-10 max-h-full max-w-full"
              />

              {mediaError && (
              <div className="z-20 absolute inset-0 flex flex-col items-center justify-center text-white text-sm bg-black/70">
                  <p className="mb-2">This video can’t be played here.</p>
                  <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  >
                  Open in X
                  </a>
              </div>
              )}
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
