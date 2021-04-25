import { Tweet } from "./interface.ts";
import { fetchTweets } from "./functions/fetch.ts";
import { initializeEnv } from "./helper.ts";
import { tweetParodied, userParodied } from "./functions/check.ts";
import { postReply, postTweet, postUser } from "./functions/twitter.ts";

import { Database } from "https://deno.land/x/aloedb/mod.ts";
import { TwitterApi } from "https://raw.githubusercontent.com/stefanuros/deno_twitter_api/master/twitterApi.ts";

// Load .env variables
initializeEnv([
  "ACCESS_TOKEN",
  "TWITTER_USER_ID",
  "CONSUMER_API_KEY",
  "CONSUMER_API_SECRET",
  "ACCESS_TOKEN_SECRET",
]);

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
