import { backKeyboard, mainMenuKeyboard } from "../config/config.js";
import { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";
import redis from "../cache/redis.js";

export async function servicePrompt(bot, userID) {
    return await bot.sendMessage(userID, "What else can I help you with? 😊", mainMenuKeyboard);
}

export async function serviceMaintenance(bot, userID) {
    await bot.sendMessage(userID, "⚠️ Service is undergoing maintenance!");
    return await servicePrompt(bot, userID);
}

export async function loadCSVData(file) {
    const data = await readFile(file, 'utf-8');
    return parse(data, { columns: true });
}

export async function loadJSONData(file, key = null) {
    try {
        const data = await readFile(file);
        const parsedData = JSON.parse(data);
        return key ? parsedData[key] ?? [] : parsedData[key] ?? {};
    } catch {
        return key ? [] : {};
    }
}

export function generateCallbackTextMap(keyboard) {
    if (!keyboard?.reply_markup?.inline_keyboard) throw new Error('Invalid keyboard structure');

    return keyboard.reply_markup.inline_keyboard.flat().reduce((map, { text, callback_data }) => {
        map[callback_data] = text;
        return map;
    }, {});
}

export async function clearPreviousMessages(bot, userID) {
    const msgIDs = JSON.parse(await redis.hGet(`user:${userID}`,'previous_messages'));
    if (!msgIDs) return;

    msgIDs.forEach(msgID => bot.deleteMessage(userID, msgID).catch(() => {}));
    await redis.hDel(`user:${userID}`, 'previous_messages');
    return true;
}

export function modifyBackKeyboard(bot, msg, userID) {
    return bot.editMessageReplyMarkup(backKeyboard.reply_markup, {
        chat_id: userID,
        message_id: msg.message_id,
    }).catch((e) => console.error(`Error modifying back keyboard: ${e}`));
}

export async function removeKeyboard(bot, userID) {
    const hashKey = `user:${userID}`;
    const previousKeyboard = JSON.parse(await redis.hGet(hashKey, 'previous_keyboard'));
    const msgID = await redis.hGet(hashKey, 'message_id');
    if (!previousKeyboard) return;

    return bot.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } }, {
        chat_id: userID,
        message_id: msgID,
    })
    .then(async () => {
        await redis.hDel(hashKey, 'previous_keyboard');
        await redis.hDel(hashKey, 'message_id');
        return true;
    })
    .catch((e) => {
        console.error(`Error removing keyboard: ${e}`);
        return false;
    });
}

export function calculateTTL(targetHour) {
    if (targetHour < 0 || targetHour > 23) throw new Error('Target hour must be between 0 and 23');

    const now = new Date();
    let targetTime = new Date(now);
    
    targetTime.setHours(targetHour, 0, 0, 0);

    if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    return Math.floor((targetTime - now) / 1000);
}

export function getCustomDate() {
    return new Date().toLocaleString('en-SG', {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
    }).replace(",", "").trim();
}