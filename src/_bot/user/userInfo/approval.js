import { userApprovalMessage, userRejectionMessage } from "../../config/config.js";
import { servicePrompt } from "../../utils/utils.js";

async function userApproval(bot, userID, approvalStatus) {
    // throw new Error('asefgrehtr')
    if (approvalStatus === 'reject') {
        return bot.sendMessage(userID, userRejectionMessage, { parse_mode: "HTML" });
    }

    await bot.sendMessage(userID, userApprovalMessage, { parse_mode: "HTML" });
    return servicePrompt(bot, userID);
}