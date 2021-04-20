import { TwitterApi } from "https://raw.githubusercontent.com/stefanuros/deno_twitter_api/master/twitterApi.ts";

export async function fetchTweets(
  user: string,
  count: number,
  twitterAPI: TwitterApi,
): Promise<Array<Tweet>> {
  // Get the latest Tweets by the users ID in extended format
  const response = await twitterAPI.get("statuses/user_timeline.json", {
    count: count.toString(),
    user_id: user,
    tweet_mode: "extended",
    include_rts: "false",
    exclude_replies: "true",
  });

  const results = await response.json();
  return results;
}
