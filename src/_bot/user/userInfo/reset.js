import redis from "../../cache/redis.js";
import { doesUserExist } from "../../api/user-api.js";
import { resetAccountKeyboard, resetAccountMessage } from "../../config/config.js";

export function requestResetUserAccount(bot, msg) {
    const userID = msg.chat.id;
    return bot.sendMessage(userID, resetAccountMessage, { 
        parse_mode: "HTML",
        reply_markup: resetAccountKeyboard.reply_markup,
    });
}

async function resetUserAccount(bot, msg) {
    const userID = msg.chat.id;

    const { userExists, authExists } = await doesUserExist(userID);
    if (!userExists && !authExists) return bot.sendMessage(userID, '⚠️ User data not found!');

    // remove from firestore
    // if remove fails, "account removal was unsuccessful"

    await redis.hDel(`active_tickets`, `${userID}`);
    await redis.del(`user:${userID}`);

    return bot.sendMessage(userID, "Account successfully removed!"); // sad to see you leave...
}

// resetting during open ticket, how will it impact user and group 