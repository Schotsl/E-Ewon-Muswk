import { Tweet } from "./interface.ts";
import { fetchTweets } from "./functions/fetch.ts";
import { tweetParodied, userParodied } from "./functions/check.ts";
import { postReply, postTweet, postUser } from "./functions/twitter.ts";

import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Database } from "https://deno.land/x/aloedb/mod.ts";
import { TwitterApi } from "https://raw.githubusercontent.com/stefanuros/deno_twitter_api/master/twitterApi.ts";

// Load .env variables
config({ export: true });

// Make sure al required .env variables are set
if (!Deno.env.get("ACCESS_TOKEN")) {
  throw new Error("ACCESS_TOKEN .env variable must be set.");
}
if (!Deno.env.get("TWITTER_USER_ID")) {
  throw new Error("TWITTER_USER_ID .env variable must be set.");
}
if (!Deno.env.get("CONSUMER_API_KEY")) {
  throw new Error("CONSUMER_API_KEY .env variable must be set.");
}
if (!Deno.env.get("CONSUMER_API_SECRET")) {
  throw new Error("CONSUMER_API_SECRET .env variable must be set.");
}
if (!Deno.env.get("ACCESS_TOKEN_SECRET")) {
  throw new Error("ACCESS_TOKEN_SECRET .env variable must be set.");
}

// Create a "simplified" database where we only store the Tweets ID
const userDatabase = new Database<{ id: string }>("database/users.json");
const tweetDatabase = new Database<Tweet>("database/tweets.json");

const twitterAPI = new TwitterApi({
  accessToken: Deno.env.get("ACCESS_TOKEN")!,
  consumerApiKey: Deno.env.get("CONSUMER_API_KEY")!,
  consumerApiSecret: Deno.env.get("CONSUMER_API_SECRET")!,
  accessTokenSecret: Deno.env.get("ACCESS_TOKEN_SECRET")!,
});

setInterval(async () => {
  // Fetch the latest Tweet
  const user = Deno.env.get("TWITTER_USER_ID")!;
  const tweets = await fetchTweets(user, 1, twitterAPI);

  // Sometimes the Twitter API returns an empty array
  if (tweets.length > 0) {
    const tweet = tweets[0];

    // If the tweet hasn't been parodied
    if (!await tweetParodied(tweet, tweetDatabase)) {
      postTweet(tweet, tweetDatabase, twitterAPI);

      // Only reply an UwU face 33% of the time
      if (Math.random() < 0.33) {
        postReply(tweet, twitterAPI);
      }

      // If the bio, location or URL has changed update it
      if (await userParodied(tweet.user, userDatabase)) {
        postUser(tweet.user, userDatabase, twitterAPI);
      }
    }
  }
}, 10000);
