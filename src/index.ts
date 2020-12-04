/**
 * Discord BeuthBot integration
 *
 * Contributed by:
 *  - Dennis Walz
 */

import {config as dotenvConig} from 'dotenv';
import {Client} from 'discord.js';
import {Gateway, BotRequest} from '@bhtbot/bhtbot';
import {stripMentions} from "./discord/helpers";

// use `dotenv` to ready `.env` file even when not running with docker-compose
dotenvConig();

const gateway = new Gateway(process.env.GATEWAY_ENDPOINT, 'disco');
const client = new Client();

// selfUpdateCommand();


/*
const sendToUser = async function (userId, message){
    return await _sendToUser(String("" + userId), message);
}
const _sendToUser = async function (userId, message){
    const user = await client.users.fetch(userId.toString());
    return await user.send(message);
}
setTimeout(()=>{
    // sendToUser('sick#0917', 'Timeoutt')
    sendToUser('185540011314249729', 'Timeout');
    // sendToUser(185540011314249729, 'Timeout II');
}, 5000)

 */

console.log('gateway', gateway);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', queryMessage => {

    const {author, mentions, createdTimestamp} = queryMessage;
    const isMentioned = mentions.has(client.user);
    const cleanMessage = stripMentions(queryMessage.content);

    if(author.bot) return;

    const message = new BotRequest({
        text: cleanMessage,
        serviceUserId: author.id,
        clientDate: createdTimestamp,
        clientLanguage: author.locale !== null ? author.locale : 'de',
        firstName: author.username,
    });

    if (message.payload.text === 'ping') {
        return queryMessage.reply('pong');
    }

    if(message.payload.text === 'uptime'){
        return queryMessage.reply('BHT Discord Chatbot is running for ' + Math.floor(client.uptime/1000/60) + ' minutes');
    }

    // if(message.payload.text === 'pong'){
    //     return setTimeout(()=>{
    //         sendToUser(author.id, 'Ping');
    //     }, Math.floor(Math.random() * 5000));
    // }

    // @bot mentioned messages
    if (isMentioned) {
        console.log(message)

        gateway.query(message).then(botResponse => {
            console.log('bot responded', botResponse)
            if(botResponse && botResponse.answer && botResponse.answer.content){
                const responseMessage = botResponse.answer.content;
                queryMessage.reply(responseMessage)
            }
            else{
                queryMessage.reply('ERROR cant connect to bot gateway')
            }
        });

    }
});

client.login(process.env.DISCORD_TOKEN);
