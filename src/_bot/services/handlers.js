import redis from "../cache/redis.js";
import { commandList, generalInfo, onBack, onCancel, onStart, operatingHours } from "./botServices.js";
import { agentKeyboard, endChatKeyboard, queryMessage } from "../config/config.js";
import { userOnboarding } from "../user/userInfo/onboarding.js";
import { onUserQuery } from "../user/query.js";
import { selectedSupportChannel, supportChannel } from "../user/channel.js";
import { liveChatHNP, liveChatIPH } from "../user/chat.js";
import { restrictedQuery } from "../agent/restricted.js";
import { editUserInfo } from "../user/userInfo/confirmation.js";
import { serviceMaintenance, servicePrompt } from "../utils/utils.js";
import { requestAgentReply } from "../agent/reply.js";
import { agentEscalated } from "../agent/escalations.js";
import { doesUserExist } from "../api/user-api.js";
import { viewUserInfo } from "../user/userInfo/view.js";
import { requestResetUserAccount } from "../user/userInfo/reset.js";
// import *?
const errorMessage = `⚠️ Service unavailable! Please reach out to our support team for help.`;
const invalidSessionMsg = "⚠️ Your chat session has not started or has expired! Please start a new Live Chat session.";
const disabledCommandsMsg = "⚠️ Commands are currently disabled! End the live chat to enable them.";

export async function userMessage(key, bot, msg, ...args) {
    const userID = msg.chat.id;
    const [agentID] = args;
    const { userExists, authExists } = await doesUserExist(userID);
    // console.log(userExists, authExists);
    const onboarding = await redis.hGet(`user:${userID}`, 'onboarding_step');
    const ticket = await redis.hGet('active_tickets', `${userID}`);

    // if (!ticket || !messageHandlers[key]) { // !ticket && (!selectedChannel || !chatSession)
    //     await bot.sendMessage(userID, invalidSessionMsg);
    //     return await servicePrompt(bot, userID); // remove before production
    // }

    if (!userExists && !authExists) return await userOnboarding(bot, msg);

    if (messageHandlers[key]) return messageHandlers[key](bot, msg, ...args);

    await onUserQuery(bot, msg, agentID);
    return;

    // const onboarding = await userOnboarding(bot, msg);
    // const chatSession = await redis.get(`chat_session_${userID}`);
    // const selectedChannel = await redis.get(`selected_channel_${userID}`);
    // const ticket = await redis.get(`ticket_id_${userID}`);

    // if (!ticket && messageHandlers[key]) return await messageHandlers[key](bot, msg, ...args);
}
// random input during onboarding because of redis?
// high latency
// auth and user dont exist -> onboarding
// auth exists, user dont exist -> pending mesasge
// auth dont exist, user exists -> live chat
// delete redis selected channel in onback?
// remove keyboard agent hashkey?
// redis ticket hash or string?
// live chat will check for user data and onboard if not present
// check encryption/decryption (let changed to const)
// invalid msg overshadows onboarding's own error handling of random input
// block commands during onboarding
// block commands during active live chat
// check view info when condition for commands fixed
// disable live chat when awaiting approval

export async function agentMessage(key, bot, msg, ...args) {
    return;
}

export async function botCommands(key, bot, msg) {
    const userID = msg.chat.id;
    const selectedChannel = await redis.get(`selected_channel_${userID}`); // change

    if (!commandHandlers[key]) return bot.sendMessage(userID, "⚠️ Please enter a valid command!");

    if (selectedChannel && commandHandlers[key]) {
        return bot.sendMessage(userID, disabledCommandsMsg, endChatKeyboard);
    }

    return await commandHandlers[key](bot, msg);
}

export async function callback(key, bot, callbackQuery) {
    if (callbackHandlers[key]) return await callbackHandlers[key](bot, callbackQuery);

    if (supportChannel[key]) {
        const channel = await selectedSupportChannel(bot, callbackQuery.message, key);
        if (!channel) return bot.sendMessage(callbackQuery.message.chat.id, invalidSessionMsg);
        return channel;
    }
}

export async function botPhoto(bot, msg) {
    if (!msg.photo) return;
    // const groupId = '-123456789'; // Replace with your group chat ID
    // const fileId = msg.photo[msg.photo.length - 1].file_id;

    // await bot.sendPhoto(groupId, fileId, { caption: 'Photo shared from user.' });
    // bot.sendMessage(msg.chat.id, "photo");
}

export async function botVideo() {
    // const groupId = '-123456789'; // Replace with your group chat ID
    // const fileId = msg.video.file_id;

    // await bot.sendVideo(groupId, fileId, { caption: 'Video shared from user.' });
    // bot.sendMessage(msg.chat.id, "video");
}

export async function botDocument() {
    // const groupId = '-123456789'; // Replace with your group chat ID
    // const fileId = msg.document.file_id;

    // await bot.sendDocument(groupId, fileId, { caption: 'Document shared from user.' });
    // bot.sendMessage(msg.chat.id, "document");
}

export async function errors(bot, msg, chatType, agentID) {
    const userID = msg.chat.id;

    if (chatType === 'private') {
        await bot.sendMessage(userID, errorMessage);
        return await servicePrompt(bot, userID);
    }

    if (chatType === 'group' || chatType === 'supergroup') return await bot.sendMessage(agentID, errorMessage);
}

const messageHandlers = {
    "General Information": (bot, msg) => 
        generalInfo(bot, msg),
    "Operating Hours": (bot, msg) => 
        operatingHours(bot, msg),
    "Command List": (bot, msg) => 
        commandList(bot, msg),
    "Live Chat - iPers Hub (Office Hours)": async (bot, msg) => 
        await liveChatIPH(bot, msg),
    "Live Chat - Head Naval Personnel (Office Hours)": async (bot, msg) => 
        await liveChatHNP(bot, msg),
    "End Live Chat": (bot, msg) => 
        endLiveChat(bot, msg),
};

const commandHandlers = {
    "/start": (bot, msg) => 
        onStart(bot, msg),
    "/terms": placeholder,
    "/feedback": placeholder,
    "/viewinfo": async (bot, msg) =>
        await viewUserInfo(bot, msg),
    "/editinfo": placeholder,
    "/resetacc": (bot, msg) => 
        requestResetUserAccount(bot, msg),
    "/test": async (bot, msg) => 
        await test(bot, msg),
};

const callbackHandlers = {
    "consent": async (bot, callbackQuery) => 
        await userOnboarding(bot, callbackQuery.message),
    "confirm_user_data": async (bot, callbackQuery) => 
        await userOnboarding(bot, callbackQuery.message),
    "edit_info": async (bot, callbackQuery) => 
        await editUserInfo(bot, callbackQuery.message),
    "reply": async (bot, callbackQuery) => 
        await requestAgentReply(bot, callbackQuery),
    "reply_complex": async (bot, callbackQuery) => 
        await agentEscalated(bot, callbackQuery),
    "reply_restricted": async (bot, callbackQuery) => 
        await restrictedQuery(bot, callbackQuery),
    "close": () => 
        placeholder(),
    "back": async (bot, callbackQuery) => 
        await onBack(bot, callbackQuery.message),
    "cancel": async (bot, callbackQuery) => 
        await onCancel(bot, callbackQuery),
    "confirm_reset": async (bot, callbackQuery) =>
        await resetUserAccount(bot, callbackQuery.message),
};

function placeholder() { // delete
    console.log("placeholder");
}

async function test(bot) { // delete
    await bot.sendMessage(
        "-4657525412", 
        queryMessage("rank", "name", "unit", "phone number", "email", "ticket type", "query", "dd/mm/yyyy hh:mm", "IPH-kj45mdg"), 
        {
            parse_mode: "HTML",
            reply_markup: agentKeyboard.reply_markup,
        },
    );
}