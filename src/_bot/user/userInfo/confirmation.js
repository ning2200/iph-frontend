import { uploadTempUserData } from "../../api/user-api.js";
import redis from "../../cache/redis.js";
import { confirmUserDataKeyboard, requestConfirmationMessage } from "../../config/config.js";
import { encrypt } from "../../utils/encryption.js";
import { removeKeyboard } from "../../utils/utils.js";
import { incrementOnboardingStep, userOnboarding } from "./onboarding.js";

const fields = ['consent', 'phone_number', 'rank', 'name', 'unit', 'email_address'];
const processingError = `⚠️ We couldn't process your information. Please reach out to our support team for help.`;

export async function requestUserConfirmation(bot, msg, shouldIncrement = true) {
    try {
        const userID = msg.chat.id;        
        const { 
            rank, name: userName, unit, phone_number: phoneNumber, email_address: email,
        } = await getUserDataFromCache(bot, msg, userID);

        const confirmationMsg = requestConfirmationMessage(rank, userName, unit, phoneNumber, email);

        const sentMessage = await bot.sendMessage(userID, confirmationMsg, { 
            parse_mode: "HTML",
            reply_markup: confirmUserDataKeyboard.reply_markup,
        });

        await redis.hSet(`user:${userID}`, {
            previous_keyboard: JSON.stringify(confirmUserDataKeyboard),
            message_id: sentMessage.message_id,
        });
        await redis.expire(`user:${userID}`, 600);

        if (shouldIncrement) return incrementOnboardingStep(userID);
    } catch (e) {
        console.error(`Error requesting user confirmation: ${e}`);
        return bot.sendMessage(msg.chat.id, processingError);
    }
}

export async function editUserInfo(bot, msg) {
    const userID = msg.chat.id;
    await removeKeyboard(bot, userID);
    await bot.sendMessage(userID, "⚠️ Please complete the re-registration process.");
    return restartUserOnboarding(bot, msg, userID);
}

export async function saveUserConfirmation(bot, msg) {
    const userID = msg.chat.id;

    if (!msg.reply_markup) {
        await bot.sendMessage(userID, "⚠️ Invalid Confirmation! Please try again.");
        return requestUserConfirmation(bot, msg, false);
    }

    await removeKeyboard(bot, userID);

    const userDataCache = await getUserDataFromCache(bot, msg, userID);
    if (!userDataCache) return;
    const userData = transformUserData(userDataCache);

    await uploadTempUserData(userID, userData);
    console.log("User Onboarding Completed");

    await incrementOnboardingStep(userID);
    return userOnboarding(bot, msg);
}

async function getUserDataFromCache(bot, msg, userID) {
    const values = await redis.hmGet(`user:${userID}`, fields);
    const data = {};

    fields.forEach((field, index) => data[field] = values[index]);

    const missingData = fields.filter((_, i) => values[i] === undefined || values[i] === null);
    const invalidConsent = data.consent !== '1';

    if (!data || missingData.length || invalidConsent) {
        await bot.sendMessage(userID, "⚠️ Your onboarding was incomplete!");
        await restartUserOnboarding(bot, msg, userID);
        return null;
    }

    return data;
}

function transformUserData(data) {
    return {
        rank: data.rank,
        userName: data.name,
        unit: data.unit,
        phoneNumber: encrypt(data.phone_number),
        email: encrypt(data.email_address),
        consent: Boolean(Number(data.consent)),
    };
}

async function restartUserOnboarding(bot, msg, userID) {
    await redis.del(`user:${userID}`); 
    return userOnboarding(bot, msg);
}