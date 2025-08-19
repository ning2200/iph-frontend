import { fileURLToPath } from "url";
import { requestNameMessage } from "../../config/config.js";
import { incrementOnboardingStep, userOnboarding } from "./onboarding.js";
import redis from "../../cache/redis.js";

const nameRegex = /^[\p{L}\s'./\\-]{2,50}$/gu;

export async function requestUserName(bot, msg, shouldIncrement = true) {
    const userID = msg.chat.id;
    await bot.sendMessage(userID, requestNameMessage, { parse_mode: "HTML" });
    if (shouldIncrement) return incrementOnboardingStep(userID);
}

export async function saveUserName(bot, msg) {
    const userID = msg.chat.id;
    const sanitisedName = sanitiseUserName(msg.text);
    
    if (!sanitisedName) {
        await bot.sendMessage(userID, `⚠️ Invalid Full Name! Please try again.`);
        return requestUserName(bot, msg, false);
    }

    await redis.hSet(`user:${userID}`, 'name', sanitisedName);
    await redis.expire(`user:${userID}`, 600);

    await bot.sendMessage(userID, "✅ Full name received!");
    console.log("User Name Saved");

    await incrementOnboardingStep(userID);
    return userOnboarding(bot, msg);
}

function sanitiseUserName(userName) {
    if (typeof userName !== 'string') return null;
    const sanitisedName = userName.trim().toUpperCase();
    return sanitisedName.match(nameRegex) ? sanitisedName : null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log(sanitiseUserName("john doe"));
    console.log(sanitiseUserName("@John Doe"));
}