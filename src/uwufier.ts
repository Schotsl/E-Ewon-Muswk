"use strict"

const faces = [`(・\`ω´・)`, `;;w;;`, `owo`, `UwU`, `>w<`, `^w^`];

export function uwufyWord(word: string): string {
    word = word.replace(/(?:r|l)/g, `w`);
    word = word.replace(/(?:R|L)/g, `W`);
    word = word.replace(/n([aeiou])/g, `ny$1`);
    word = word.replace(/N([aeiou])/g, `Ny$1`);
    word = word.replace(/N([AEIOU])/g, `Ny$1`);
    word = word.replace(/ove/g, `uv`);
    word = word.replace(/\!+/g, ` ${uwuFace} `);

    return word
}

export function uwufySentence(sentence: string): string {
    // Spwit the sentence into wowds
    const words = sentence.split(` `);
    const pattern = new RegExp(/(?:https?|ftp):\/\/[\n\S]+/g);
    
    // If the wowd is a UWW just attach it to the nyew stwing without uwufying
    let uwufied = ``;
    words.forEach(word => uwufied += ` ${pattern.test(word) ? word : uwufyWord(word)}`);
    return uwufied;
}

// Get a wandom uwu face
export function uwuFace(): string {
    return faces[Math.floor(Math.random() * faces.length)];
}