import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { 
    agentMessage, botCommands, botDocument, botPhoto, botVideo, callback, errors, userMessage 
} from './services/handlers.js'; // change to import *?
import { userOnboarding } from './user/userInfo/onboarding.js';
import express from 'express';
import ngrok from '@ngrok/ngrok';
import path from 'path';

dotenv.config();

const BOTTOKEN = process.env.BOT_TOKEN;
const AUTHTOKEN = process.env.NGROK_AUTHTOKEN;
const PORT = process.env.PORT;
const agentID = process.env.AGENT_ID;
const ENV = process.env.NODE_ENV;

if (!BOTTOKEN) throw new Error(`Invalid bot token`);
if (!AUTHTOKEN) throw new Error(`Invalid auth token`);
if (!PORT) throw new Error(`Invalid port`);
if (!agentID) throw new Error(`Invalid agent ID`);
if (ENV === 'development') console.warn(`CAUTION: DEVELOPER MODE`);

const app = express();
app.use(express.json());

// const bot = new TelegramBot(BOTTOKEN);

// app.post(`/webhook/${BOTTOKEN}`, (req, res) => {
//     bot.processUpdate(req.body);
//     res.sendStatus(200);
// });

// async function setWebHook(url) {
//     try {
//         await bot.setWebHook(`${url}/webhook/${BOTTOKEN}`);
//         console.log("Webhook Set");
//     } catch (e) {
//         console.error(`Error setting webhook: ${e}`);
//     }
// }

// app.listen(PORT, async () => {
//     const listener = await ngrok.connect({ addr: PORT, authtoken: AUTHTOKEN });
//     const WEBHOOKURL = listener.url();

//     console.log(`ngrok tunnel established: ${WEBHOOKURL}`);

//     await setWebHook(WEBHOOKURL);

//     console.log(`Server running on port ${PORT}`);
// })

let bot;

try {
    bot = new TelegramBot(BOTTOKEN, { polling: true });
    console.log(`Bot initialised`);
} catch (e) {
    console.error(`Error initialising bot: ${e}`);
    process.exit(1);
}

bot.on('message', async (msg) => {
    if (msg.contact) return;
    
    const text = msg.text?.trim();
    if (!text) return bot.sendMessage(msg.chat.id, "⚠️ Please enter a valid message!");
    if (text.startsWith('/')) return;

    const chatType = msg.chat.type;

    try {
        if (chatType === 'private') return await userMessage(text, bot, msg, agentID);
        if (chatType === 'group' || chatType === 'supergroup') {
            return await agentMessage(text, bot, msg, agentID);
        }
    } catch (e) {
        console.error(e);
        return await errors(bot, msg, chatType, agentID);
    }
});

bot.onText(/^\/(.+)?/, async (msg) => {
    const text = msg.text?.trim();
    const chatType = msg.chat.type;

    try {
        if (chatType === 'group' || chatType === 'supergroup') return;
        return await botCommands(text, bot, msg);
    } catch (e) {
        console.error(e);
        return await errors(bot, msg, chatType, agentID);
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery?.data;
    const chatType = callbackQuery.message.chat.type;

    try {
        await callback(data, bot, callbackQuery);
        return await bot.answerCallbackQuery(callbackQuery.id);
    } catch (e) {
        console.error(e);
        return await errors(bot, callbackQuery.message, chatType, agentID);
    }
});

bot.on('contact', async (msg) => {
    try {
        return await userOnboarding(bot, msg);
    } catch (e) {
        console.error(e);
        return await errors(bot, msg, 'private');
    }
});

bot.on('photo', async (msg) => {
    try {
        if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
            await botPhoto(bot, msg);
        }
        await botPhoto(bot, msg);
    } catch (e) {
        console.error(e);
        return await errors(bot, msg, );
    }
});

bot.on('video', async (msg) => {
    try {
        await botVideo(bot, msg);
    } catch (e) {
        console.error(e);
        return await errors(bot, msg, );
    }
});

bot.on('document', async (msg) => {
    try {
        await botDocument(bot, msg);
    } catch (e) {
        console.error(e);
        return await errors(bot, msg, );
    }
});

const shutdown = async () => {
    console.log('Bot shutting down...');
    await bot.stopPolling();
    process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
    
export default app;

// server.close(() => {
//     console.log("Server closed");
//     process.exit();
// });