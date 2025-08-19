/* 
// debouncing and throttling: prevent bot from being overwhelmed by users spamming commands
// set or map to track user interaction times
// rate limit

const interactionMap = new Map();

bot.on('message', (msg) => {
    const now = Date.now();
    const lastInteraction = interactionMap.get(msg.chat.id) || 0;

    if (now - lastInteraction < 1000) { // 1-second cooldown
        return bot.sendMessage(msg.chat.id, 'Slow down! 🕒');
    }

    interactionMap.set(msg.chat.id, now);

    // Handle the message
});*/

/*
const rateLimits = new Map(); // Store user activity timestamps
const RATE_LIMIT_TIME = 5000; // 5 seconds (time in milliseconds)

bot.on('message', async (msg) => {
    const userId = msg.from.id;
    const currentTime = Date.now();

    // Check if the user is already in the rate limit map
    if (rateLimits.has(userId)) {
        const lastMessageTime = rateLimits.get(userId);
        const timeSinceLastMessage = currentTime - lastMessageTime;

        if (timeSinceLastMessage < RATE_LIMIT_TIME) {
            // User is sending messages too quickly
            return bot.sendMessage(msg.chat.id, "You're sending messages too quickly. Please wait a moment.");
        }
    }

    // Update the user's last message timestamp
    rateLimits.set(userId, currentTime);

    // Normal message processing
    const text = msg.text?.trim();
    if (text) {
        bot.sendMessage("<your_group_chat_id>", `Message from @${msg.from.username || msg.from.first_name}: ${text}`);
        bot.sendMessage(msg.chat.id, "Your message has been sent to the group chat!");
    }
});
*/

/* cooldown.js
const userCooldowns = new Map();

/**
 * Check if the user is on cooldown.
 * @param {string} userID - Unique user identifier.
 * @param {number} cooldownTime - Cooldown duration in milliseconds.
 * @returns {boolean} - Returns true if user is on cooldown, false otherwise.
 */
/*export function isOnCooldown(userID, cooldownTime = 2000) {
    const now = Date.now();

    if (userCooldowns.has(userID)) {
        const lastMessageTime = userCooldowns.get(userID);
        if (now - lastMessageTime < cooldownTime) return true;
    }

    userCooldowns.set(userID, now);
    return false;
}*/
