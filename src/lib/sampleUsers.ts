import { TwitterUser } from "./twitterProvider";

export function sampleUsers(
  users: TwitterUser[],
  min = 5,
  max = 10
): TwitterUser[] {
  const count = Math.min(
    users.length,
    Math.floor(Math.random() * (max - min + 1)) + min
  );

  const shuffled = [...users].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
