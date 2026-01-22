interface MediaGridProps {
  media: {
    id: string;
    text: string;
    created_at: string;
  }[];
}

export function MediaGrid({ media }: MediaGridProps) {
  if (!media.length) {
    return (
      <div className="mt-4 h-40 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        No recent posts
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-3 gap-1">
      {media.slice(0, 9).map((post) => (
        <div
          key={post.id}
          className="aspect-square rounded bg-gray-200 p-2 text-xs text-gray-700 overflow-hidden"
        >
          {post.text || "—"}
        </div>
      ))}
    </div>
  );
}
