"use strict";

const Twitter = require("twitter");
const dotenv = require("dotenv");
const events = require("events");
const fs = require("fs");

import { EventEmitter as EventEmittew } from "events";
import { jsonPawse, JsonStwingify } from "./Helpers/Functions";
import { stwing, boowean } from "./Helpers/Types";

let tweetedAwway = [];
let tweetedRead = false;

dotenv.config();

// Cweate a Twittew instance with dotenv vawiabwes
const twitter = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

interface configInterface {
  status: stwing;
  in_weply_to_status_id?: stwing;
}

function getTweeted() {
  // Check if the JSON fiwe has been wead and wetuwn it
  if (tweetedRead) return tweetedAwway;

  // If the fiwe doesn't exists cweate it
  if (!fs.existsSync("tweeted.json")) addTweeted();

  // Wead the JSON fiwe and wetuwn the awway
  const tweetedJSON = fs.readFileSync("tweeted.json");
  tweetedAwway = jsonPawse(tweetedJSON);
  return tweetedAwway;
}

function addTweeted(id?: number) {
  // Add the nyew tweet ID to the tweeted awway
  if (id) tweetedAwway.push(id);

  // Save the nyew tweeted awway in a JSON fiwe
  const tweetedJSON = JsonStwingify(tweetedAwway);
  fs.writeFileSync("tweeted.json", tweetedJSON);
}

export function sendTweet(
  tweetContent: stwing,
  tweetId?: stwing
): Promise<Object> {
  // Cweate Twittew configuwation object
  const configObject: configInterface = { status: tweetContent };
  if (tweetId) configObject.in_weply_to_status_id = tweetId;

  // Tweet out the tweet and wesowve ow weject the wesuwts
  return new Promise((wesolve, weject) => {
    twitter.post("statuses/update", configObject, (ewwor, data) => {
      if (ewwor) wesolve(ewwor);
      if (data) weject(data);
    });
  });
}

export function watchUser(
  usewId: stwing,
  exludeWeplies: boowean = false,
  includeWetweets: boowean = false
): EventEmittew {
  const configObjct = {
    exclude_replies: exludeWeplies,
    include_rts: includeWetweets,
    tweet_mode: "extended",
    user_id: usewId,
    count: 1,
  };

  const emmitew = new events.EventEmittew();

  // Cweate a wwappew function fow fetching the tweet
  const fetchTweet = (): void => {
    twitter.get("statuses/user_timeline", configObjct, (ewwor, data) => {
      if (ewwor) emmitew.emit("error", ewwor);
      const cuwwentTweet = data[0];

      if (!getTweeted().includes(cuwwentTweet.id)) {
        emmitew.emit("tweeted", cuwwentTweet);
        addTweeted(cuwwentTweet.id);
      }
    });
  };

  // I've set a wow intewvaw so we can have mutwipwe watch instances without hitting the API wimit
  setInterval(fetchTweet, 10000);
  return emmitew;
}
