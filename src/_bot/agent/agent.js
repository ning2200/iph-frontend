import { getUserIDFromTicket } from "../api/agent-api.js";
import { getUserData } from "../api/user-api.js";

export async function extractUserAndAgentData(callbackQuery) {
    const agentID = callbackQuery.message.chat.id;
    let agentName = callbackQuery.from.first_name || callbackQuery.from.username;
    const msgID = callbackQuery.message.message_id;

    if (typeof agentID !== 'number' || typeof msgID !== 'number') {
        throw new Error('Agent ID/Message ID is not a number');
    }

    if (typeof agentName !== 'string' || !agentName.trim()) {
        agentName = 'Unknown Agent';
    } else {
        agentName = agentName.trim().slice(0, 100).replace(/[<>&"'`]/g, '');
    }

    const ticket = extractTicketIDFromQuery(callbackQuery.message.text);
    const userID = (await getUserIDFromTicket(ticket, msgID)).userID;
    const { rank, full_name: userName } = (await getUserData(userID)).user;

    return { userID, agentID, ticket, msgID, rank, userName, agentName };
}

function extractTicketIDFromQuery(text) {
    const plainText = text.replace(/<[^>]+>/g, '');
    const match = plainText.match(/\[([A-Za-z0-9-]+)\]/);
    return match ? match[1] : null;
}

const statusMap = {
    open: '🟢 Open',
    progress: (agentName) => `🟡 In Progress (${agentName})`,
    escalated: (agentName) => `🟣 In Progress - Complex (${agentName})`,
    resolved: '🔴 Resolved',
    reopen: '🔵 Reopened',
};

export function updateQueryStatus(originalText, ticket, statusType, agentName) {
    const statusValue = statusMap[statusType];
    const statusText = typeof statusValue === 'function'
        ? statusValue(agentName || 'Unknown Agent')
        : statusValue;

    const updatedQueryStatus = `<b>[${ticket}]</b> ${statusText}`;
    const lines = originalText.split('\n');

    const updatedMessage = lines.map(line => {
        if (line.startsWith(`[${ticket}]`)) return updatedQueryStatus;
        
        const match = line.match(/^([^:]+):\s*(.*)$/);
        if (match) {
            const [_, title, value] = match;
            return `<b>${title}:</b> ${value}`;
        }

        return line;
    });

    return updatedMessage.join('\n');
}