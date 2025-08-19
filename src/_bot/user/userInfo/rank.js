import { fileURLToPath } from "url";
import path from "path";
import { calculateTTL, loadJSONData } from "../../utils/utils.js";
import { requestRankMessage } from "../../config/config.js";
import { incrementOnboardingStep, userOnboarding } from "./onboarding.js";
import redis from "../../cache/redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botFolder = path.resolve(__dirname, '../..');
const rankJSONFile = path.join(botFolder, 'config/ranks.json');

let rankJSON;

await loadRankJSON();

export async function requestUserRank(bot, msg, shouldIncrement = true) {
    const userID = msg.chat.id;
    await bot.sendMessage(userID, requestRankMessage, { parse_mode: "HTML" });
    if (shouldIncrement) return incrementOnboardingStep(userID);
}

export async function saveUserRank(bot, msg) {
    const userID = msg.chat.id;
    let sanitisedRank = sanitiseUserRank(msg.text);

    if (!sanitisedRank) {
        await bot.sendMessage(userID, "⚠️ Invalid Rank! Please try again.");
        return requestUserRank(bot, msg, false);
    }

    if (sanitisedRank === 'NIL') sanitisedRank = '';

    await redis.hSet(`user:${userID}`, 'rank', sanitisedRank);
    await redis.expire(`user:${userID}`, 600);

    await bot.sendMessage(userID, "✅ Rank received!");
    console.log("User Rank Saved");

    await incrementOnboardingStep(userID);
    return userOnboarding(bot, msg);
}

async function loadRankJSON() {
    const cachedRanks = JSON.parse(await redis.get(`ranks_json`));
    if (cachedRanks) return rankJSON = cachedRanks;

    const ranks = await loadJSONData(rankJSONFile, 'RANKS');
    if (!ranks || !Array.isArray(ranks)) throw new Error("Array of ranks not found");

    rankJSON = { "RANKS": ranks };

    const RANKS_CACHE_EXPIRY_HOUR = 17;
    const ttl = calculateTTL(RANKS_CACHE_EXPIRY_HOUR);
    await redis.set(`ranks_json`, JSON.stringify(rankJSON), { EX: ttl });
}

function sanitiseUserRank(rank) {
    if (typeof rank !== 'string') return null;
    const sanitisedRank = rank.trim().toUpperCase();
    return rankJSON.RANKS.includes(sanitisedRank) ? sanitisedRank : null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        const testJSONFile = path.join(botFolder, 'tests/ranks.test.json');
        rankJSON = { "RANKS": await loadJSONData(testJSONFile, 'RANKS') };
        console.log(rankJSON);
        console.log(sanitiseUserRank("TEST RANK"));
        console.log(sanitiseUserRank("test"));
    })()
}