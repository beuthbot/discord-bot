/**
 * Discord BeuthBot integration
 *
 * Contributed by:
 *  - Dennis Walz
 */

import {config as dotenvConig} from 'dotenv';
import {Client, MessageAttachment} from 'discord.js';
import {BotRequest, Gateway} from '@bhtbot/bhtbot';
import {stripMentions} from "./discord/helpers";

// use `dotenv` to ready `.env` file even when not running with docker-compose
dotenvConig();

// start service
start();

// socket connection for asynchronous messages from gateway
async function configureSocket(gateway: Gateway, client: Client) {
    const sock = await gateway.connectWebSocket()

    sock.onMessage(async message => {
        const user = await client.users.fetch(message.userId);
        await user.send(message.message);
    })

    sock.onFile(async file=>{
        const buffer = Buffer.from(file.binary);
        const user = await client.users.fetch(file.userId);
        const attach = new MessageAttachment(buffer, file.fileName);
        await user.send(attach)
    })
}

// create discord connection and handle messages
async function start() {

    const gateway = new Gateway(process.env.GATEWAY_ENDPOINT, 'discord');
    const client = new Client();

    console.log('gateway', gateway);

    await configureSocket(gateway, client);

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log(client.user);
    });

    client.on('message', queryMessage => {

        const {author, mentions, createdTimestamp} = queryMessage;
        const isMentioned = mentions.has(client.user);
        const cleanMessage = stripMentions(queryMessage.content);

        if (author.bot) return;

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

        if (message.payload.text === 'uptime') {
            return queryMessage.reply('BHT Discord Chatbot is running for ' + Math.floor(client.uptime / 1000 / 60) + ' minutes');
        }

        // @bot mentioned messages
        if (isMentioned) {
            console.log(message)

            gateway.query(message).then(botResponse => {
                console.log('bot responded', botResponse)
                if (botResponse && botResponse.answer && botResponse.answer.content) {
                    const responseMessage = botResponse.answer.content;
                    queryMessage.reply(responseMessage)
                } else {
                    if(botResponse && botResponse.answer && botResponse.answer.error){
                        queryMessage.reply(botResponse.answer.error);
                    }
                    else{
                        queryMessage.reply('Unknown Error, probably cant connect to bot gateway')
                    }
                }
            });

        }
    });

    client.login(process.env.DISCORD_TOKEN);
}
