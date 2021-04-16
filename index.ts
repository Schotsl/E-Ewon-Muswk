import Uwuifier from "https://deno.land/x/uwuifier/src/index.ts";

import { Tweet, User } from "./interface.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Database } from "https://deno.land/x/aloedb/mod.ts";
import { TwitterApi } from "https://raw.githubusercontent.com/stefanuros/deno_twitter_api/master/twitterApi.ts";

// Load .env variables
config({ export: true });

// Create databases
const userDatabase = new Database<User>("database/users.json");
const tweetDatabase = new Database<Tweet>("database/tweets.json");

const uwuifier = new Uwuifier();
const twitterApi = new TwitterApi({
  accessToken: Deno.env.get("ACCESS_TOKEN")!,
  consumerApiKey: Deno.env.get("CONSUMER_API_KEY")!,
  consumerApiSecret: Deno.env.get("CONSUMER_API_SECRET")!,
  accessTokenSecret: Deno.env.get("ACCESS_TOKEN_SECRET")!,
});

async function executeCycle() {
  // Fetch the latest Tweet
  const response = await twitterApi.get("statuses/user_timeline.json", {
    count: "1",
    user_id: Deno.env.get("TWITTER_USER_ID")!,
    tweet_mode: "extended",
  });

  const tweets = await response.json();

  // Sometimes the Twitter API returns an empty array
  if (tweets.length > 0) {
    const tweet = tweets[0];

    // Look through the database to check if we've uwuified this Tweet before
    const result = await tweetDatabase.findOne({ id: tweet.id });

    if (!result) {
      // If we've never seen this tweet before uwuify and post it
      await twitterApi.post("statuses/update.json", {
        status: uwuifier.uwuifySentence(tweet.full_text),
      });

      // Reply with an uwu face every once in a while
      if (Math.random() < 0.35) {
        const faces = uwuifier.faces;
        const face = faces[Math.floor(Math.random() * faces.length)];
        
        await twitterApi.post("statuses/update.json", {
          in_reply_to_status_id: tweet.id_str,
          auto_populate_reply_metadata: "true",
          status: `${face}`,
        });
      }

      // Fetch the relevant user data
      const description = tweet.user.description;
      const location = tweet.user.location;
      const url = tweet.user.url;

      // Get the latest stored user data
      const result = await userDatabase.findOne({});

      // If the latest stored user data doesn't match the current user information
      if (!result || result.description !== description || result.location !== location || result.url !== url) {
        
        // Update our local copy of the stored user data
        userDatabase.insertOne({
          description,
          location,
          url,
        });

        const user: Partial<User> = {};

        // Uwuify the user data
        if (description) user.description = uwuifier.uwuifySentence(description);
        if (location) user.location = uwuifier.uwuifySentence(location);

        if (url) user.url = url;

        // Update our Twitter profile
        await twitterApi.post("account/update_profile.json", user);
      }

      // Save the ID in the database to prevent duplicates
      await tweetDatabase.insertOne({
        id: tweet.id,
      });
    }
  }

  setTimeout(executeCycle, 1000);
}

executeCycle();