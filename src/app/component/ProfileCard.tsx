// components/ProfileCard.tsx
import Image from "next/image";

interface TwitterUser {
  id: string;
  username: string;
  name?: string;
  profile_image_url?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

export function ProfileCard({ user }: { user: TwitterUser }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <a
          href={`https://x.com/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={user.profile_image_url || "/avatar-placeholder.png"}
            alt={user.username}
            width={48}
            height={48}
            className="rounded-full"
          />
        </a>

        <div className="flex-1">
          <a
            href={`https://x.com/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
          >
            @{user.username}
          </a>
          {user.name && (
            <div className="text-sm text-gray-500">{user.name}</div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm mt-4 text-gray-600">
        <span>{user.public_metrics?.followers_count ?? 0} Followers</span>
        <span>{user.public_metrics?.following_count ?? 0} Following</span>
        <span>{user.public_metrics?.tweet_count ?? 0} Tweets</span>
      </div>

      {/* Media placeholder */}
      <div className="mt-4 h-40 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Media coming soon
      </div>

      {/* View More */}
      <button
        disabled
        className="mt-3 w-full rounded-lg border py-2 text-sm text-gray-400 cursor-not-allowed"
      >
        View More
      </button>
    </div>
  );
}
