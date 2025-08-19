import { 
    reopenQueryKeyboard, restrictedAcknowledgementMessage, userRestrictedMessage
} from '../config/config.js';
import path from 'path';
import { getCustomDate } from '../utils/utils.js';
import fs from 'fs';
import { updateRestrictedQuery, updateRestrictedQueryInSheets } from '../api/agent-api.js';
import { requestUserFeedback } from '../user/feedback.js';
import redis from '../cache/redis.js';
import { extractUserAndAgentData, updateQueryStatus } from './agent.js';

const botFolder = path.resolve();
const photoPath = path.join(botFolder, 'config/PersonInCharge.jpg');
const personInChargeJPG = fs.createReadStream(photoPath);
const processingError = '⚠️ Sorry, your response could not be processed. Please try again later.';

export async function restrictedQuery(bot, callbackQuery) {
    const { 
        userID, agentID, ticket, msgID, rank, userName, agentName,
    } = await extractUserAndAgentData(callbackQuery);

    const rawRestrictedData = { userID, agentID, ticket, msgID, rank, userName, agentName };
    const savedRestrictedQuery = await saveRestrictedQuery(rawRestrictedData);
    if (!savedRestrictedQuery) return bot.sendMessage(agentID, processingError);

    await redis.hDel('active_tickets', `${userID}`);
    await redis.del(`user:${userID}`);

    await sendUserMessage(bot, userID, rank, userName);

    const resolvedText = updateQueryStatus(callbackQuery.message.text, ticket, 'resolved');
    await sendAgentMessage(bot, agentID, msgID, resolvedText, agentName, ticket, rank, userName);
    
    return true;
}

async function saveRestrictedQuery(rawRestrictedData) {
    const { userID, agentID, ticket, msgID, rank, userName, agentName } = rawRestrictedData;
    const restrictedData = {
        ticketStatus: 'closed',
        closedAt: getCustomDate(),
        msgID: msgID + 1,
        reply: userRestrictedMessage(rank, userName).replace(/<\/?[^>]+(>|$)/g, ''),
        userID: agentID,
        userName: agentName,
        role: 'agent',
    };

    const restrictedQuery = await updateRestrictedQuery(ticket, restrictedData);
    const restrictedQuerySheets = await updateRestrictedQueryInSheets(userID, ticket);

    if (!restrictedQuery?.success || !restrictedQuerySheets?.success) return false;

    // start 7 day timer
    
    return true;
}

async function sendUserMessage(bot, userID, rank, userName) {
    await bot.sendPhoto(userID, personInChargeJPG, {
        caption: userRestrictedMessage(rank, userName),
        parse_mode: "HTML",
        reply_markup: {
            remove_keyboard: true,
        },
    });

    await requestUserFeedback(bot, userID);
}

async function sendAgentMessage(bot, agentID, msgID, resolvedText, agentName, ticket, rank, userName) {
    await bot.editMessageText(resolvedText, { 
        chat_id: agentID,
        message_id: msgID, 
        parse_mode: "HTML",
    });

    await bot.editMessageReplyMarkup(reopenQueryKeyboard.reply_markup, { 
        chat_id: agentID, 
        message_id: msgID,
    });

    await bot.sendMessage(agentID, restrictedAcknowledgementMessage(agentName, ticket, rank, userName), { 
        parse_mode: "HTML",
    });
}

if (process.argv[1] === import.meta.url) {
    console.log(fs.existsSync(personInChargeJPG));
}