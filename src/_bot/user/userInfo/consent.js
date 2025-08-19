import redis from "../../cache/redis.js";
import { termsOfServiceKeyboard, termsOfServiceMessage, userConsentMessage } from "../../config/config.js";
import { removeKeyboard } from "../../utils/utils.js";
import { incrementOnboardingStep, userOnboarding } from "./onboarding.js";

export async function requestUserConsent(bot, msg, shouldIncrement = true) {
    const userID = msg.chat.id;

    const sentMessage = await bot.sendMessage(userID, termsOfServiceMessage, { 
        parse_mode: "HTML",
        reply_markup: termsOfServiceKeyboard.reply_markup,
    });

    await redis.hSet(`user:${userID}`, {
        previous_keyboard: JSON.stringify(termsOfServiceKeyboard),
        message_id: sentMessage.message_id,
    });
    await redis.expire(`user:${userID}`, 600);

    if (shouldIncrement) return incrementOnboardingStep(userID);
}

export async function saveUserConsent(bot, msg) {
    const userID = msg.chat.id;

    await removeKeyboard(bot, userID);

    if (!msg.reply_markup) {
        await bot.sendMessage(userID, "⚠️ Invalid Consent! Please try again.");
        return requestUserConsent(bot, msg, false);
    }

    await redis.hSet(`user:${userID}`, 'consent', 1);
    await redis.expire(`user:${userID}`, 600);
    
    await bot.sendMessage(userID, userConsentMessage, { parse_mode: "HTML" });
    console.log("User Consent Saved");

    await incrementOnboardingStep(userID);
    return userOnboarding(bot, msg);
}