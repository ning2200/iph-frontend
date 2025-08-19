import { feedbackKeyboard, feedbackMessage } from "../config/config.js";

export async function requestUserFeedback(bot, userID) {
    return await bot.sendMessage(userID, feedbackMessage, { 
        parse_mode: "HTML",
        reply_markup: feedbackKeyboard.reply_markup,
    });
}


function saveUserFeedback(bot, msg) {
    const userID = msg.chat.id;


}

// "Do you have any other compliments/feedback?"
// "Thank you for your feedback and response! Have a great day!☺️\n\nIf you would like to have a further dedicated phone/virtual consultation session with our friendly iPers Hub Engagement Officers, kindly book an appointment via https://calendly.com/ipershub/engagement. \n\nPress /start to write your next query."
// "Thank you for your feedback and response! Have a great day!☺️\n\nPress /start to write your next query."
// change feedback message
// cancel in feedback keyboard does not remove feedback keyboard