import { Tweet, User } from "../interface.ts";
import { Database } from "https://deno.land/x/aloedb/mod.ts";

export async function tweetParodied(
  tweet: Tweet,
  database: Database<Tweet>,
): Promise<boolean> {
  // Return false if a Tweet with this ID couldn't be found
  const result = await database.findOne({ id: tweet.id });
  return result !== null;
}

export async function userParodied(
  user: User,
  database: Database<User>,
): Promise<boolean> {
  // Attempt to find the user by its location, url and description
  const result = await database.findOne(user);
  return result !== null;
}
