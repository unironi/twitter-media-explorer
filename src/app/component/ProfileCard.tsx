import Image from "next/image";
import { TwitterUser } from "@/lib/twitterProvider";
import { MediaGrid } from "./MediaGrid";

interface ProfileCardProps {
  user: TwitterUser;
  media?: {
    id: string;
    text: string;
    created_at: string;
  }[];
  onClick?: (user: TwitterUser) => void;
}


export function ProfileCard({ user, media, onClick }: ProfileCardProps) {
  return (
    <div onClick={() => onClick?.(user)}
      className="cursor-pointer rounded-xl border p-4 hover:bg-gray-50 transition"
    >
      <div className="flex items-center gap-3">
        <a
          href={`https://x.com/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
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

      <MediaGrid media={media ?? []} />
      <button disabled className="mt-3 w-full rounded-lg border py-2 text-sm text-gray-400 cursor-not-allowed">View More</button>

    </div>
  );
}
