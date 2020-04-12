"use strict"

const Twitter = require('twitter');

const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const twitter = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const options = { 
    user_id: '44196397', 
    exclude_replies: true, 
    include_rts: false,
    count: 1,
    tweet_mode: 'extended'
};

const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];

let tweetedArray = [];
let tweetedRead = false;

function getTweeted(id) {
    // Check if the JSON file has been read and return it
    if (tweetedRead) return tweetedArray;

    // If the file doesn't exists create it
    if (!fs.existsSync('tweeted.json')) addTweeted();

    // Read the JSON file and return the array
    const tweetedJSON = fs.readFileSync('tweeted.json');
    tweetedArray = JSON.parse(tweetedJSON);
    return tweetedArray;
}

function addTweeted(id) {
    // Add the new tweet ID to the tweeted array
    if (id) tweetedArray.push(id);

    // Save the new tweeted array in a JSON file
    const tweetedJSON = JSON.stringify(tweetedArray);
    fs.writeFileSync('tweeted.json', tweetedJSON);
}

function generateURLObject(text, array = []) {
    // Map the input text and find the URL + generate an millis stamp
    const pattern = new RegExp(/(?:https?|ftp):\/\/[\n\S]+/g);
    const result = pattern.exec(text);
    const object = {
        url: result[0],
        millis: performance.now()
    }

    // Add the URL / millis stamp object to the array
    array.push(object);

    // Remove the found URL from the text string
    text = text.replace(object.url, object.millis);

    // If there is still an URL in the string call this function another time
    if (pattern.exec(text)) generateURLObject(text, array);
    return array;
}

function uwufieText(text) {
    const array = generateURLObject(text);

    /// Replace all URL instances with their assigned millis stamps
    array.forEach(object => text = text.replace(object.url, object.uuid));

    // Uwufie the text
    text = text.replace(/(?:r|l)/g, "w");
    text = text.replace(/(?:R|L)/g, "W");
    text = text.replace(/n([aeiou])/g, 'ny$1');
    text = text.replace(/N([aeiou])/g, 'Ny$1');
    text = text.replace(/N([AEIOU])/g, 'Ny$1');
    text = text.replace(/ove/g, "uv");
    text = text.replace(/\!+/g, " " + faces[Math.floor(Math.random() * faces.length)] + " ");

    // Switch back the URL by searching for the millis stamps
    array.forEach(object => text = text.replace(object.millis, object.url));

    return text;
}

function sendTweet(text) {
    twitter.post('statuses/update', {status: text}, (error) => {
        if (error) console.error(error);
    });
}

function watchTwitter() {
    twitter.get('statuses/user_timeline', options, (error, data) => {
        if (error) console.error(error);
        const currentTweet = data[0];
        
        // If the tweet hasn't been processed before process it
        if (!getTweeted().includes(currentTweet.id)) {
            console.log("Wecieved nyew tweet ^w^")

            const currentText = !currentTweet.truncated ? currentTweet.full_text : currentTweet.text;
            const uwufiedText = uwufieText(currentText);
            console.log("Used vewy advanced technyowogy to uwu-fie the tweet!! UwU")

            sendTweet(uwufiedText);
            addTweeted(currentTweet.id);
            console.log("Tweet has been powsted! (・`ω´・)")
        }
    });
}

setInterval(watchTwitter, 1500);