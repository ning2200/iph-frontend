import { offHoursMessage, formatWarningMessage, supportChannelsKeyboard } from "../config/config.js";
import { userOnboarding } from "./userInfo/onboarding.js";
import isOfficeHours from "../services/timeCheck.js";
import dotenv from 'dotenv';
import redis from "../cache/redis.js";
import { getUserData } from "../api/user-api.js";

dotenv.config();

const development = process.env.NODE_ENV === "development";
const supportChannelMessage = "Choose an option below to get started!";

export const liveChatIPH = async (bot, msg) => liveChat(bot, msg, 'IPH');
export const liveChatHNP = async (bot, msg) => liveChat(bot, msg, 'HNP');

async function liveChat(bot, msg, mode) {
    const userID = msg.chat.id;
    const chatSession = msg.text;
    
    if (!await handleOfficeHours(bot, userID, development)) return;

    const user = await getUser(bot, msg, userID);

    const { rank, full_name: userName } = user;
    const warningMsgFormatted = formatWarningMessage(rank, userName, mode);

    await bot.sendMessage(userID, warningMsgFormatted, { parse_mode: "HTML" });
    const sentMessage = await bot.sendMessage(userID, supportChannelMessage, supportChannelsKeyboard);

    await redis.hSet(`user:${userID}`, {
        chat_session: chatSession,
        previous_keyboard: JSON.stringify(supportChannelsKeyboard),
        message_id: sentMessage.message_id,
    });
    await redis.expire(`user:${userID}`, 900);
    
    console.log("Live Chat Passed");
    return true;
}

async function handleOfficeHours(bot, userID, development) {
    const officeHours = await isOfficeHours();
 
    if (!officeHours && !development) {
        await bot.sendMessage(userID, offHoursMessage);
        return false;
    }

    return true;
}

async function getUser(bot, msg, userID) {
    const userData = JSON.parse(await redis.hGet(`user:${userID}`, 'user_data')) || await getUserData(userID);

    if (!userData.user) {
        await userOnboarding(bot, msg);
        return null;
    }

    await redis.hSet(`user:${userID}`, 'user_data', JSON.stringify(userData));
    await redis.expire(`user:${userID}`, 900);
    
    return userData.user;
}