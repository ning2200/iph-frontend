import redis from "../../cache/redis.js";
import { pendingInfoApprovalMessage } from "../../config/config.js";
import { requestUserConfirmation, saveUserConfirmation } from "./confirmation.js";
import { requestUserConsent, saveUserConsent } from "./consent.js";
import { requestUserEmail, saveUserEmail } from "./email.js";
import { requestUserName, saveUserName } from "./name.js";
import { requestUserPhoneNumber, saveUserPhoneNumber } from "./phone.js";
import { requestUserRank, saveUserRank } from "./rank.js";
import { requestUserUnit, saveUserUnit } from "./unit.js";

export async function userOnboarding(bot, msg) {
    try {
        const userID = msg.chat.id;

        let currentStep = parseInt(await redis.hGet(`user:${userID}`, `onboarding_step`));
        console.log(currentStep)
        if (isNaN(currentStep)) currentStep = 0;
        
        if (currentStep >= onboardingSteps.length) {
            await redis.del(`user:${userID}`);
            await bot.sendMessage(userID, pendingInfoApprovalMessage, { parse_mode: "HTML" });
            return false;
        }
        
        await onboardingSteps[currentStep](bot, msg);
        return true;
    } catch (e) {
        console.error(`Error in user onboarding: ${e}`);
        throw e;
    }
}

// async function getOnboardingStep(userID) {
//     let currentStep = parseInt(await redis.hGet(`user:${userID}`, 'onboarding_step'));

//     if (!currentStep || isNaN(currentStep)) {
//         currentStep = 0;
//         await redis.hSet(`user:${userID}`, 'onboarding_step', currentStep);
//         await redis.expire(`user:${userID}`, 600);
//     }

//     return currentStep;
// }

export async function incrementOnboardingStep(userID, increment = 1) {
    try {
        let currentStep = parseInt(await redis.hGet(`user:${userID}`, `onboarding_step`));
        if (isNaN(currentStep)) currentStep = 0;

        const newStep = currentStep + increment;

        await redis.hSet(`user:${userID}`, 'onboarding_step', newStep);
        await redis.expire(`user:${userID}`, 600);
    } catch (e) {
        console.error(`Error in incrementing onboarding step: ${e}`);
        return null;
    }
}

// before sending message, delete redis then send, to check if increment will mess up

const onboardingSteps = [
    requestUserConsent,
    saveUserConsent,

    requestUserPhoneNumber,
    saveUserPhoneNumber,

    requestUserRank,
    saveUserRank,

    requestUserName,
    saveUserName,

    requestUserUnit,
    saveUserUnit,

    requestUserEmail,
    saveUserEmail,

    requestUserConfirmation,
    saveUserConfirmation,
];