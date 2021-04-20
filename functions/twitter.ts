import Uwuifier from "https://deno.land/x/uwuifier/src/index.ts";

import { Database } from "https://deno.land/x/aloedb/mod.ts";
import { TwitterApi } from "https://raw.githubusercontent.com/stefanuros/deno_twitter_api/master/twitterApi.ts";
import { Tweet, User } from "../interface.ts";

export async function postReply(tweet: Tweet, twitterAPI: TwitterApi) {
  const uwuifier = new Uwuifier();
  const faces = uwuifier.faces;
  const face = faces[Math.floor(Math.random() * faces.length)];

  // Reply a random Uwuifier face to the given Tweet
  await twitterAPI.post("statuses/update.json", {
    in_reply_to_status_id: tweet.id_str,
    auto_populate_reply_metadata: "true",
    status: `${face}`,
  });
}

export async function postTweet(
  tweet: Tweet,
  database: Database<Tweet>,
  twitterAPI: TwitterApi,
): Promise<void> {
  // Insert the Tweet into our local database
  await database.insertOne(tweet);
  const uwuifier = new Uwuifier();

  // Reply the uwuified version of the Tweet content
  await twitterAPI.post("statuses/update.json", {
    status: uwuifier.uwuifySentence(tweet.full_text),
  });
}

export async function postUser(
  user: User,
  database: Database<User>,
  twitterAPI: TwitterApi,
): Promise<void> {
  // Update our local copy of the stored user data
  await database.insertOne(user);
  const uwuifier = new Uwuifier();

  if (user.description) {
    user.description = uwuifier.uwuifySentence(user.description);
  }

  if (user.location) {
    user.location = uwuifier.uwuifySentence(user.location);
  }

  // Update our Twitter profile
  await twitterAPI.post("account/update_profile.json", user);
}
