"use strict"

import { watchUser, sendTweet } from "./twitter";

import { uwufySentence, uwuFace } from "uwufier";

watchUser('44196397', true, false)
.on('error', (error) => console.error(error))
.on('tweeted', copyUwuTweet);

watchUser('44196397', false, false)
.on('error', error => console.error(error))
.on('tweeted', replyUwuFace);

// If thewe is a tweet ow wepwy
function replyUwuFace(tweet) {

    // Onwy wepwy with an uwu face onye in thwee tweets
    if (Math.random() < 1 / 3) {
        const reply = `@${tweet.user.screen_name} ${uwuFace()}`;
        console.log(`Wepwying with "${reply}"`);

        sendTweet(reply, tweet.id_str)
        .then(() => console.log(`Wepwied succesfuwwy (・\`ω´・)`))
        .catch(error => console.error(error));
    }
}

// If thewe is an owiginyaw tweet
function copyUwuTweet(tweet) {
    console.log(`Detected a tweet that shouwd be copied`);
    const content = !tweet.truncated ? tweet.full_text : tweet.text;

    // Uwufy the content and tweet it
    sendTweet(uwufySentence(content))
    .then(() => console.log(`Copied succesfuwwy owo`))
    .catch(error => console.error(error));
}