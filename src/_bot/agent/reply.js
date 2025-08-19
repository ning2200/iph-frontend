import { postAdminReply } from "../api/agent-api.js";
import { agentResponsePrompt, endChatKeyboard, responseAcknowledgementMessage } from "../config/config.js";
import { extractUserAndAgentData, updateQueryStatus } from "./agent.js";

export async function requestAgentReply(bot, callbackQuery) {
    const { agentID, ticket, agentName } = await extractUserAndAgentData(callbackQuery);
    return bot.sendMessage(agentID, agentResponsePrompt(agentName, ticket), { parse_mode: "HTML" });
}

export async function processAgentReply(bot, callbackQuery) {
    const { 
         userID, agentID, ticket, msgID, rank, userName, agentName,
    } = await extractUserAndAgentData(callbackQuery);
    // const agentReply = msg.text.trim(); // append to dear user template

    // await postAdminReply(userID, agentName); // other data // save to firestore
    // await bot.sendMessage(userID, agentReply, { reply_markup: endChatKeyboard.reply_markup });

    const escalatedText = updateQueryStatus(callbackQuery.message.text, ticket, 'progress', agentName);
    await bot.editMessageText(escalatedText, { chat_id: agentID, message_id: msgID });

    await bot.editMessageReplyMarkup(filterAgentKeyboard().reply_markup, {
        chat_id: agentID, message_id: msgID
    })
    await bot.sendMessage(agentID, responseAcknowledgementMessage()); // message
    
    return true;
}

function filterAgentKeyboard() {
    const filteredButtons = agentKeyboard.reply_markup.inline_keyboard.filter(row => {
        return row.some(button => button.callback_data === 'close'); // test this
    });

    return {
        reply_markup: {
            inline_keyboard: filteredButtons,
        },
    };
}

// on reply to message method?
// block other admins (expect certain id) + timeout
// user query waiting list to avoid cross contamination
// conversation id?
// reply from askhnp template line/hnp: ?