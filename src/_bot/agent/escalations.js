import { updateEscalatedQueryInSheets } from "../api/agent-api.js";
import { 
    agentKeyboard, endChatKeyboard, escalatedAcknowledgementMessage, userEscalatedMessage
 } from "../config/config.js";
import { extractUserAndAgentData, updateQueryStatus } from "./agent.js";

const processingError = '⚠️ Sorry, your response could not be processed. Please try again later.';

export async function agentEscalated(bot, callbackQuery) {
    const { 
        userID, agentID, ticket, msgID, rank, userName, agentName,
    } = await extractUserAndAgentData(callbackQuery);
    
    const escalatedQuerySheets = await updateEscalatedQueryInSheets(ticket);
    if (!escalatedQuerySheets?.success) return bot.sendMessage(agentID, processingError);
    // redis not deleted, user can continue sending message, need way make follow ups proper

    await bot.sendMessage(userID, userEscalatedMessage(rank, userName), { 
        parse_mode: "HTML",
        reply_markup: endChatKeyboard.reply_markup,
    });

    const escalatedText = updateQueryStatus(callbackQuery.message.text, ticket, 'escalated', agentName);
    await bot.editMessageText(escalatedText, { chat_id: agentID, message_id: msgID });

    await bot.editMessageReplyMarkup(filterAgentKeyboard().reply_markup, { 
        chat_id: agentID, message_id: msgID 
    });
    await bot.sendMessage(agentID, escalatedAcknowledgementMessage(agentName, rank, userName, ticket), { 
        parse_mode: "HTML" 
    });

    return true;
}

function filterAgentKeyboard() {
    const filteredButtons = agentKeyboard.reply_markup.inline_keyboard.filter(row => {
        return !row.some(button => button.callback_data === 'reply_complex');
    });

    return {
        reply_markup: {
            inline_keyboard: filteredButtons,
        },
    };
}