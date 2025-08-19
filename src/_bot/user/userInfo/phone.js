import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/max";
import { phoneNumberKeyboard, requestPhoneNumberMessage } from "../../config/config.js";
import { incrementOnboardingStep, userOnboarding } from "./onboarding.js";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
import redis from "../../cache/redis.js";

dotenv.config();

let countryCode = process.env.COUNTRY_CODE;

export async function requestUserPhoneNumber(bot, msg, shouldIncrement = true) {
    const userID = msg.chat.id;

    await bot.sendMessage(userID, requestPhoneNumberMessage, {
        parse_mode: "HTML",
        reply_markup: phoneNumberKeyboard.reply_markup,
    });

    if (shouldIncrement) return incrementOnboardingStep(userID);
}

export async function saveUserPhoneNumber(bot, msg) {
    const userID = msg.chat.id;
    const phoneNumber = msg.contact?.phone_number;
    if (!phoneNumber) return invalidPhoneNumber(bot, msg, false);

    const sanitisedPhoneNumber = sanitiseUserPhoneNumber(phoneNumber);
    if (!sanitisedPhoneNumber) return invalidPhoneNumber(bot, msg, false);
    
    await redis.hSet(`user:${userID}`, 'phone_number', sanitisedPhoneNumber);
    await redis.expire(`user:${userID}`, 600);

    await bot.sendMessage(userID, "✅ Phone number received!", { reply_markup: { remove_keyboard: true }});
    console.log("User Phone Number Saved");

    await incrementOnboardingStep(userID);
    return userOnboarding(bot, msg);
}

function getCountryCode() {
    if (!countryCode) throw new Error(`Invalid Country Code`);
    return countryCode;
}

function sanitiseUserPhoneNumber(phoneNumber) {
    if (typeof phoneNumber !== 'string') return null;
    return isValidPhoneNumber(phoneNumber, getCountryCode())
        ? parsePhoneNumber(phoneNumber, getCountryCode()).formatInternational()
        : null;
}

async function invalidPhoneNumber(bot, msg, shouldIncrement) {
    await bot.sendMessage(msg.chat.id, "⚠️ Invalid Phone Number! Please try again.");
    return requestUserPhoneNumber(bot, msg, shouldIncrement);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    countryCode = 'SG';
    console.log(sanitiseUserPhoneNumber("98761234"));
    console.log(sanitiseUserPhoneNumber("invalid number"));
}