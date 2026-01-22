interface MediaGridProps {
  media: {
    id: string;
    type: "photo" | "video" | "animated_gif" | "text";
    image?: string;
    video?: string;
    gif?: string;
    text: string;
    created_at: string;
  }[];
}


export function MediaGrid({ media }: MediaGridProps) {
  if (!media.length) {
    return (
      <div className="mt-4 h-40 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        No recent media
      </div>
    );
  }

  // priority: video → gif → photo → text
  const priority: Record<string, number> = {
    video: 0,
    animated_gif: 1,
    photo: 2,
    text: 3,
  };

  const sorted = [...media].sort(
    (a, b) => priority[a.type] - priority[b.type]
  );

  return (
    <div
      className="mt-4 grid grid-cols-3 gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {sorted.slice(0, 9).map((post) => (
        <div
          key={post.id}
          className="relative aspect-square overflow-hidden rounded bg-black"
        >
          {/* VIDEO */}
          {post.type === "video" && post.video && (
            <>
              {/* thumbnail */}
              {post.image && (
                <img
                  src={post.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              {/* video */}
              <video
                src={post.video}
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </>
          )}


          {/* ANIMATED GIF (mp4) */}
          {post.type === "animated_gif" && post.gif && (
            <video
              src={post.gif}
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          )}

          {/* PHOTO */}
          {post.type === "photo" && post.image && (
            <img
              src={post.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}

          {/* FALLBACK TEXT */}
          {post.type === "text" && (
            <div className="p-2 text-xs text-gray-400">
              {post.text || "—"}
            </div>
          )}

          {/* overlay icon */}
          {(post.type === "video" || post.type === "animated_gif") && (
            <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
              {post.type === "video" ? "▶" : "GIF"}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}


// export function MediaGrid({ media }: MediaGridProps) {
//   if (!media.length) {
//     return (
//       <div className="mt-4 h-40 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
//         No recent posts
//       </div>
//     );
//   }

//   return (
//     <div className="mt-4 grid grid-cols-3 gap-1" onClick={(e) => e.stopPropagation()}>
//       {media.slice(0, 9).map((post) => (
//         <div
//           key={post.id}
//           className="aspect-square rounded bg-gray-200 p-2 text-xs text-gray-700 overflow-hidden"
//         >
//           {post.text || "—"}
//         </div>
//       ))}
//     </div>
//   );
// }
