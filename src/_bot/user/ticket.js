import { alphanumericGenerator, queueNumber } from "../services/numberGenerator.js";
import User from "./userInfo/user.js";
import redis from "../cache/redis.js";
import { getUserData } from "../api/user-api.js";

const queueGen = queueNumber(5);
const iphRefGen = alphanumericGenerator('IPH', 7, 500, 17, 0);
const hnpRefGen = alphanumericGenerator('HNP', 7, 200, 17, 0);

class Ticket extends User {
    constructor(userID, userData, ticketType, queueNum, ticketID) {
        super(userData);
        this.userID = userID;
        this.ticketType = ticketType;
        this.queueNum = queueNum;
        this.ticket = ticketID;
    }

    static async _generateTicket(userID) {
        const chatSession = await redis.hGet(`user:${userID}`, 'chat_session');
        return chatSession.includes('Hub') ? iphRefGen.next().value : hnpRefGen.next().value;
    }

    static async create(userID) {
        const [userDataCache, ticketType, ticketIDCache] = await Promise.all([
            JSON.parse(await redis.hGet(`user:${userID}`, 'user_data')),
            redis.hGet(`user:${userID}`, 'selected_channel'),
            redis.hGet('active_tickets', `${userID}`),
        ]);

        const userData = userDataCache || await getUserData(userID);
        const queueNum = queueGen.next().value;
        const ticketID = ticketIDCache || await this._generateTicket(userID);

        if (!ticketIDCache) await redis.hSet('active_tickets', `${userID}`, ticketID);
        await redis.del(`user:${userID}`);
        
        return new Ticket(userID, userData.user, ticketType, queueNum, ticketID);
    }
}

export default Ticket;