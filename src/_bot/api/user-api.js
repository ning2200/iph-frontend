import axios from "axios";
import { axiosURL, flaskURL } from "./api.js";

export async function uploadTempUserData(userID, userData) { // ✅
    try {
        const response = await axios.post(`${axiosURL}/user/auth/${userID}`, userData);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error uploading user data`);
    }
}

// async function getUserApprovalStatus(userID) { // ✅
//     try {
//         const response = await axios.get(`${axiosURL}/user/auth/approve/${userID}`);
//         return response.data;
//     } catch (e) {
//         console.error(e);
//         throw new Error(`Error getting user approval status`);
//     }
// }

export async function doesUserExist(userID) { // ✅
    try{
        const response = await axios.get(`${axiosURL}/user/data/exists/${userID}`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error checking user existence`);
    }
}

export async function getUserData(userID) { // ✅
    try {
        const response = await axios.get(`${axiosURL}/user/data/${userID}`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error fetching user data`);
    }
}

export async function postUserQuery(ticket, queryData) { // ✅
    try {
        const response = await axios.post(`${axiosURL}/user/query/${ticket}`, queryData);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error posting user query`);
    }
}

export async function postQueryToSheets(userID, ticket, msgID) { // ✅
    try {
        const response = await axios.post(`${flaskURL}/user/query/sheets/${userID}/${ticket}/${msgID}`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error posting user query to sheets`);
    }
}

export async function getQueryHistory(ticket) { // ✅
    try{
        const response = await axios.get(`${axiosURL}/user/query/history/${ticket}`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error(`Error getting query history`);
    }
}

(async () => {
    // console.log();
})();