import axios from "axios";
import { axiosURL, flaskURL } from "./api.js";

export async function getUserIDFromTicket(ticket, msgID) { // ✅
    try {
        const response = await axios.get(`${axiosURL}/agent/data/userID/${ticket}/${msgID}`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error fetching user ID`);
    }
}

export async function postAdminReply(userID, agentName) { // ❌
    try {
        const response = await axios.post(`${axiosURL}/agent/reply/${userID}`, {
            agentName,
        });
        return response.data || null;
    } catch (e) {
        console.error(e);
        throw new Error(`Error posting admin reply`);
    }
}

export async function updateEscalatedQueryInSheets(ticket) { // ✅
    try {
        const response = await axios.post(`${flaskURL}/agent/query/escalated/sheets/${ticket}`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error updating escalated query in sheets`);
    }
}

export async function updateRestrictedQuery(ticket, restrictedData) { // ✅
    try {
        const response = await axios.post(`${axiosURL}/agent/query/restricted/${ticket}`, restrictedData);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error updating restricted query`);
    }
}

export async function updateRestrictedQueryInSheets(userID, ticket) { // ✅
    try {
        const response = await axios.post(`${flaskURL}/agent/query/restricted/sheets/${userID}/${ticket}`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error updating restricted query in sheets`);
    }
}

(async () => {
    // console.log();
})();