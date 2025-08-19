import redis from "../cache/redis.js";
import { 
    mainMenuKeyboard, welcomeMessage, generalInfoMessage, commandListMessage, operatingHoursMessage 
} from "../config/config.js";
import { clearPreviousMessages, removeKeyboard, servicePrompt } from "../utils/utils.js";

const infoMessage = async (bot, msg, infoMsg) => {
    const userID = msg.chat.id;
    await bot.sendMessage(userID, infoMsg, { parse_mode: "HTML" });
    return await servicePrompt(bot, userID);
};

// To send message after user presses /start
export function onStart(bot, msg) {
    return bot.sendMessage(msg.chat.id, welcomeMessage, { 
        parse_mode: "HTML", 
        reply_markup: mainMenuKeyboard.reply_markup,
    });
}

// To provide information on bot service to user
export function generalInfo(bot, msg) {
    return infoMessage(bot, msg, generalInfoMessage);
}

// To inform user of bot's operating hours
export function operatingHours(bot, msg) {
    return infoMessage(bot, msg, operatingHoursMessage);
}

// To inform user of a list of bot commands to use
export function commandList(bot, msg) {
    return infoMessage(bot, msg, commandListMessage);
}

// To return to previous bot action
export async function onBack(bot, msg) {
    const userID = msg.chat.id;

    await clearPreviousMessages(bot, userID);

    const previousKeyboard = JSON.parse(await redis.hGet(`user:${userID}`, `previous_keyboard`));
    const msgID = await redis.hGet(`user:${userID}`, 'message_id');

    return await bot.editMessageReplyMarkup(previousKeyboard.reply_markup, {
        chat_id: userID,
        message_id: msgID,
    }).catch((e) => console.error("Error restoring selected channel keyboard:", e));
}

// To cancel current bot action
export async function onCancel(bot, callbackQuery) {
    const userID = callbackQuery.message.chat.id || callbackQuery.from.id;

    await removeKeyboard(bot, userID);
    await redis.del(`user:${userID}`);

    await bot.sendMessage(userID, "⚠️ Action has been cancelled!");
    return await servicePrompt(bot, userID);
}