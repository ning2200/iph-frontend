import { fileURLToPath } from "url";
import { activeLiveChatMessage, selectedChannelMessage, supportChannelsKeyboard } from "../config/config.js";
import { 
    calculateTTL, generateCallbackTextMap, loadJSONData, modifyBackKeyboard, removeKeyboard 
} from "../utils/utils.js";
import path from "path";
import redis from "../cache/redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botFolder = path.resolve(__dirname, '../');
const faqJSONFile = path.join(botFolder, 'config/faq.json');

let faqJSON = { "FAQ": {} };

await loadFAQJSON();

export const supportChannel = generateCallbackTextMap(supportChannelsKeyboard);

export async function selectedSupportChannel(bot, msg, key) {
    try {
        const userID = msg.chat.id;
        const chatSession = await redis.hGet(`user:${userID}`, `chat_session`);
        if (!chatSession) return;

        if (!supportChannel[key]) {
            return bot.sendMessage(userID, `The channel you selected is invalid: ${key}`);
        }

        const selectedChannel = supportChannel[key];
        const channelFAQ = formatFAQ(key);

        const { 
            selectionMsgID, activeChatMsgID
        } = await sendUserMessage(bot, userID, selectedChannel, channelFAQ);
        await cacheData({ userID, msg, selectionMsgID, activeChatMsgID, selectedChannel });
        modifyBackKeyboard(bot, msg, userID);
        
        console.log("Support Channel Selected");
        return true;
    } catch (e) {
        console.error(`Error in support channel selection: ${e}`);
        await removeKeyboard(bot, msg.chat.id);
        throw e;
    }
}

async function loadFAQJSON() {
    const cachedFAQ = JSON.parse(await redis.get(`faq_json`));
    if (cachedFAQ) return faqJSON = cachedFAQ;

    faqJSON = await loadJSONData(faqJSONFile, 'FAQ');

    const FAQ_CACHE_EXPIRY_HOUR = 17;
    const ttl = calculateTTL(FAQ_CACHE_EXPIRY_HOUR);
    await redis.set(`faq_json`, JSON.stringify(faqJSON), { EX: ttl });
}

function formatFAQ(key) {
    if (!faqJSON || typeof faqJSON !== 'object') {
        console.error("FAQ JSON is not loaded or is malformed");
        return 'FAQ data is currently unavailable.';
    }

    const faqData = faqJSON?.[key];
    const selectedChannel = supportChannel[key] || key;

    if (!Array.isArray(faqData) || faqData.length === 0) {
        return `We don't have FAQs for <b>${selectedChannel}</b> yet!`;
    }

    return faqData.map(({ question, answer }) => `• ${question}\n→ ${answer}`).join('\n\n');
}

async function sendUserMessage(bot, userID, selectedChannel, channelFAQ) {
    const selectedChannelMsg = await bot.sendMessage(
        userID, selectedChannelMessage(selectedChannel, channelFAQ), { parse_mode: "HTML" }
    );
    const activeLiveChatMsg = await bot.sendMessage(userID, activeLiveChatMessage, { parse_mode: "HTML" });
    return { selectionMsgID: selectedChannelMsg.message_id, activeChatMsgID: activeLiveChatMsg.message_id };
}

async function cacheData(sessionData) {
    const { userID, msg, selectionMsgID, activeChatMsgID, selectedChannel } = sessionData;
    if (!selectionMsgID || !activeChatMsgID) return;
    
    const previousMsgsID = [selectionMsgID, activeChatMsgID];

    await redis.hSet(`user:${userID}`, {
        selected_channel: selectedChannel,
        previous_messages: JSON.stringify(previousMsgsID),
        previous_keyboard: JSON.stringify(supportChannelsKeyboard),
        message_id: msg.message_id,
    });
    await redis.expire(`user:${userID}`, 900);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        const testJSONFile = path.join(botFolder, 'tests/faq.test.json');
        faqJSON = await loadJSONData(testJSONFile, 'FAQ');
        console.log(formatFAQ("test"));
        console.log(faqJSON);
    })();
}