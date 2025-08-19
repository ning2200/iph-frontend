import { fileURLToPath } from "url";
import { requestEmailMessage } from "../../config/config.js";
import dotenv from 'dotenv';
import { incrementOnboardingStep, userOnboarding } from "./onboarding.js";
import dns from 'dns';
import redis from "../../cache/redis.js";

dotenv.config();

let emailDomain = process.env.EMAIL_DOMAIN;

const emailRegex = /^[\p{L}_-]{2,50}$/gu;

export async function requestUserEmail(bot, msg, shouldIncrement = true) {
    const userID = msg.chat.id;
    await bot.sendMessage(msg.chat.id, requestEmailMessage, { parse_mode: "HTML"} );
    if (shouldIncrement) return incrementOnboardingStep(userID);
}

export async function saveUserEmail(bot, msg) {
    const userID = msg.chat.id;
    const sanitisedEmail = await sanitiseUserEmail(msg.text);

    if (!sanitisedEmail) {
        await bot.sendMessage(userID, "⚠️ Invalid Email Address! Please try again.");
        return requestUserEmail(bot, msg, false);
    }

    await redis.hSet(`user:${userID}`, 'email_address', sanitisedEmail);
    await redis.expire(`user:${userID}`, 600);

    await bot.sendMessage(userID, "✅ Email address received!");
    console.log("User Email Saved");

    await incrementOnboardingStep(userID);
    return userOnboarding(bot, msg);
}

function getEmailDomain() {
    if (!emailDomain) throw new Error(`Invalid Email Domain`);
    return emailDomain;
}

async function sanitiseUserEmail(email) {
    if (typeof email !== 'string') return null;

    const trimmedEmail = email.trim();
    if (trimmedEmail.toUpperCase() === 'NIL') return 'NIL';

    const [localPart, domain] = trimmedEmail.split('@');    
    if (domain !== getEmailDomain()) return null;
    if (!localPart.match(emailRegex)) return null;

    return new Promise((resolve) => {
        dns.resolveMx(domain, (err, address) => {
            if (err || !address || address.length === 0) return resolve(null);
            resolve(email.toLowerCase());
        });
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        emailDomain = "gmail.com";
        console.log(await sanitiseUserEmail("johndoe@gmail.com"));
        console.log(await sanitiseUserEmail("johndoe123@gmail.com"));
        console.log(await sanitiseUserEmail("johndoe@yahoo.gov.sg"));
    })();
}