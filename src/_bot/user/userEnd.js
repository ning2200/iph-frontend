import { fileURLToPath } from "url";

function endLiveChat(bot, msg) {
    const userID = msg.chat.id;
    bot.sendMessage(userID, "🔔 Your chat session has ended.");
    return requestUserFeedback(bot, userID);
}

// 7 day ttl in firestore
// remove entry in pending sheet
// update entry in resolved sheet
// append message in group chat with 'user has closed query'
// change 4 buttons to reopen in group chat
// 7 day ttl for reopen button
// remove ticket from redis
// end message to user
// feedback message

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log("");
}

// use higher order function if user and agent end are similar
// function x() {
//     return async function y() {

//     }
// }