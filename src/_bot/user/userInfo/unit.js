import { fileURLToPath } from "url";
import { requestUnitMessage } from "../../config/config.js";
import { incrementOnboardingStep, userOnboarding } from "./onboarding.js";
import redis from "../../cache/redis.js";

const unitRegex = /^[\p{L}\s0-9,./'()&\\-]{2,50}$/gu;

export async function requestUserUnit(bot, msg, shouldIncrement = true) {
    const userID = msg.chat.id;
    await bot.sendMessage(userID, requestUnitMessage, { parse_mode: "HTML" });
    if (shouldIncrement) return incrementOnboardingStep(userID);
}

export async function saveUserUnit(bot, msg) {
    const userID = msg.chat.id;
    const sanitisedUnit = sanitiseUserUnit(msg.text);

    if (!sanitisedUnit) {
        await bot.sendMessage(userID, "⚠️ Invalid Unit! Please try again.");
        return requestUserUnit(bot, msg, false);
    }

    await redis.hSet(`user:${userID}`, 'unit', sanitisedUnit);
    await redis.expire(`user:${userID}`, 600);

    await bot.sendMessage(userID, "✅ Unit received!");
    console.log("User Unit Saved");

    await incrementOnboardingStep(userID);
    return userOnboarding(bot, msg);
}

function sanitiseUserUnit(unit) {
    if (typeof unit !== 'string') return null;
    const sanitisedUnit = unit.trim().toUpperCase();
    return sanitisedUnit.match(unitRegex) ? sanitisedUnit : null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log(sanitiseUserUnit("unit 1-2 (T&C, 1.3)"));
}