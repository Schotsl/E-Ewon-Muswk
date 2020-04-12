"use strict"

const Twitter = require('twitter');

const fs = require('fs');

const twitter = new Twitter({
    consumer_key: 'TUdDQnqUlu8ExINXeHvbUTrBY',
    consumer_secret: 'QJhD9xPYDklf8nWyiKMEvW4odh0si7EKalPz4lIwgcVS7T3pfa',
    access_token_key: '1249293166383116288-soKQ8hv5DtRuwBBzpRVtAaRon9cdW4',
    access_token_secret: '3vFfoHjg2988DdJlRWJU3NVE2lUqhEr1dUjxpoTkX3TO7',
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

function uwufieText(text) {
    // Speaks for itself hopefully..
    text = text.replace(/(?:r|l)/g, "w");
    text = text.replace(/(?:R|L)/g, "W");
    text = text.replace(/n([aeiou])/g, 'ny$1');
    text = text.replace(/N([aeiou])/g, 'Ny$1');
    text = text.replace(/N([AEIOU])/g, 'Ny$1');
    text = text.replace(/ove/g, "uv");
    text = text.replace(/\!+/g, " " + faces[Math.floor(Math.random() * faces.length)] + " ");
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