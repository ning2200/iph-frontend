import { fileURLToPath } from "url";
import { agentKeyboard, endChatKeyboard, queryAcknowledgementMessage, queryMessage } from "../config/config.js";
import { getCustomDate, removeKeyboard } from "../utils/utils.js";
import Ticket from "./ticket.js";
import { decrypt } from "../utils/encryption.js";
import { getQueryHistory, postQueryToSheets, postUserQuery } from "../api/user-api.js";

const queryRegex = /^[a-zA-Z0-9]/;
const invalidQuery = `⚠️ Please provide a more detailed query in complete sentences. If you are using bullet points, kindly number them for clarity.`;
const processingError = `⚠️ Sorry, we couldn't process your query. Please try again later.`;

export async function onUserQuery(bot, msg, agentID) {
    const userID = msg.chat.id;
    let userQuery = msg.text?.trim();
    
    await removeKeyboard(bot, userID);
    // if (!queryRegex.test(userQuery) || userQuery.length < 10) return bot.sendMessage(userID, invalidQuery);
    
    const ticket = await Ticket.create(userID);
    const { formattedQueryMsg, formattedAcknowledgementMsg } = formatMessages(ticket, userQuery);

    const agentMsg = await bot.sendMessage(agentID, formattedQueryMsg, {
        parse_mode: "HTML",
        reply_markup: agentKeyboard.reply_markup,
    });

    const rawQueryData = { userID, ticket, msgID: agentMsg.message_id, userQuery };
    const savedUserQuery = await saveUserQuery(rawQueryData);
    if (!savedUserQuery) return await bot.sendMessage(userID, processingError);

    // const queryHistory = await getQueryHistory(ticket);
    // if (queryHistory?.messages?.length > 0) userQuery = formatQuery(queryHistory.messages);
    // if (queryHistory.lastMsgID) await bot.deleteMessage(agentID, queryHistory.lastMsgID);

    await bot.sendMessage(userID, formattedAcknowledgementMsg, {
        parse_mode: "HTML",
        reply_markup: endChatKeyboard.reply_markup,
    });

    console.log("Processed User Query");
    return true;
}

async function saveUserQuery(rawQueryData) {
    try {
        const { userID, ticket, msgID, userQuery } = rawQueryData;
        if (typeof userID !== 'number' || typeof msgID !== 'number') {
            throw new Error('User ID/Message ID is not a number');
        }

        const queryData = { 
            ticketStatus: 'open',
            ticketType: ticket.ticketType,
            ticketDate: getCustomDate(),
            msgID: msgID,
            content: userQuery,
            userID: userID,
            userName: null,
            role: 'user',
            attachment: null,
        };

        const saveQuery = await postUserQuery(ticket.ticket, queryData);
        // access success key?
        // called whenever user query, ensure only called once to prevent overwriting
        const saveQuerySheets = true // await postQueryToSheets(userID, ticket.ticket, msgID);
        
        if (!saveQuery?.success && !saveQuerySheets) return false;
        return true;
    } catch {
        return false;
    }
}

// function formatQuery(query) {
//     let formattedQuery = query
//         .map(msg => {
//             const role = msg.role === 'user' ? 'User: ' : 'Agent: ';
//             return `${role} ${msg.content}`;
//         })
//         .join('\n\n');

//     return formattedQuery;
// }

function formatMessages(userTicket, userQuery) {
    const { rank, userName, unit, phoneNumber, email, ticketType, queueNum, ticket } = userTicket;
    return {
        formattedQueryMsg: queryMessage(
            rank, userName, unit, decrypt(phoneNumber), decrypt(email), ticketType,
            userQuery, getCustomDate(), ticket,
        ),
        formattedAcknowledgementMsg: queryAcknowledgementMessage(ticket, queueNum),
    };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {

    });
}

// overwrites/no appending
// previous message not deleted
// active chat but outside office hours?
// test commands in active chat
// test username, attachment
// time of query changes in message
// end live chat recognised as command in active chat
// simulate cache overflow
// block commands in active chat
// messages during active and non active live chat
// userdata, chat session, previous messages, selected channel in redis (hash deleted first, change later)
// check let
// determine promise.all
// change query structure? [Ticket]? status replace new query title?
// ticket type null while long active ticket because deleted already (get channel from firestore?)
// is deleting user from redis in ticket the right way (keep user data, delete temp?)