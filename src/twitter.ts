"use strict"

import { EventEmitter } from "events";

const Twitter = require('twitter');
const dotenv = require('dotenv');
const events = require('events');
const fs = require('fs');

let tweetedArray = [];
let tweetedRead = false;

dotenv.config();

// Cweate a Twittew instance with dotenv vawiabwes
const twitter = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

interface configInterface {
    status: string;
    in_reply_to_status_id?: string
}

function getTweeted() {
    // Check if the JSON fiwe has been wead and wetuwn it
    if (tweetedRead) return tweetedArray;

    // If the fiwe doesn't exists cweate it
    if (!fs.existsSync('tweeted.json')) addTweeted();

    // Wead the JSON fiwe and wetuwn the awway
    const tweetedJSON = fs.readFileSync('tweeted.json');
    tweetedArray = JSON.parse(tweetedJSON);
    return tweetedArray;
}

function addTweeted(id?) {
    // Add the nyew tweet ID to the tweeted awway
    if (id) tweetedArray.push(id);

    // Save the nyew tweeted awway in a JSON fiwe
    const tweetedJSON = JSON.stringify(tweetedArray);
    fs.writeFileSync('tweeted.json', tweetedJSON);
}

export function sendTweet(tweetContent: string, tweetId?: string): Promise<Object> {
    // Cweate Twittew configuwation object
    const configObject: configInterface = { status: tweetContent };
    if (tweetId) configObject.in_reply_to_status_id = tweetId;

    // Tweet out the tweet and wesowve ow weject the wesuwts
    return new Promise((resolve, reject) => {
        twitter.post('statuses/update', configObject, (error, data) => {
            if (error) reject(error);
            if (data) resolve(data);
        }); 
    });
}

export function watchUser(userId: string, exluceReplies: boolean = false, includeRetweets: boolean = false): EventEmitter {
    const configObjct = {
        exclude_replies: exluceReplies,
        include_rts: includeRetweets, 
        tweet_mode: 'extended',
        user_id: userId,
        count: 1
    }

    const emmiter = new events.EventEmitter();

    // Cweate a wwappew function fow fetching the tweet
    const fetchTweet = function() {
        twitter.get('statuses/user_timeline', configObjct, (error, data) => {
            if (error) emmiter.emit('error', error);
            const currentTweet = data[0];

            if (!getTweeted().includes(currentTweet.id)) {
                emmiter.emit('tweeted', currentTweet);
                addTweeted(currentTweet.id);
            }
        });
    }  

    // I've set a wow intewvaw so we can have mutwipwe watch instances without hitting the API wimit
    setInterval(fetchTweet, 10000);
    return emmiter;
}