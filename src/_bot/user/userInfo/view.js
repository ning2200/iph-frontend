import redis from "../../cache/redis.js";
import { getUserData } from "../../api/user-api.js";
import { requestConfirmationMessage } from "../../config/config.js";
import { decrypt } from "../../utils/encryption.js";

export async function viewUserInfo(bot, msg) {
    const userID = msg.chat.id;

    const userData = JSON.parse(await redis.hGet(`user:${userID}`, 'user_data')) || await getUserData(userID);
    if (!userData) return bot.sendMessage(userID, '⚠️ User data not found!');
    
    const { rank, full_name: userName, unit, phone_number: phoneNumber, email_address: email } = userData.user;
    const userInfoMsg = requestConfirmationMessage(rank, userName, unit, decrypt(phoneNumber), decrypt(email));
    return bot.sendMessage(userID, userInfoMsg, { parse_mode: "HTML" });
}