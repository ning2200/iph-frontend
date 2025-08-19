// import { fileURLToPath } from "url";

// let loadingMsgMap = new Map();

// export async function loader(bot, userID, taskFn, timeoutMs = 2000) {
//     if (loadingMsgMap.has(userID)) {
//         console.warn(`Loader already active for userID ${userID}`);
//         return;
//     }

//     let taskCompleted = false;
//     const start = Date.now();

//     const loadingTimeout = setTimeout(async () => {
//         if (!taskCompleted) {
//             await sendLoadingMessage(bot, userID);
//         }
//     }, timeoutMs);

//     const taskPromise = executeTask(taskFn);

//     const loadingMessagePromise = new Promise((resolve) => {
//         setTimeout(async () => {
//             if (!taskCompleted) {
//                 const message = await bot.sendMessage(userID, '⏳ Loading, please wait...');
//                 loadingMsgMap.set(userID, message.message_id);
//                 const end = Date.now();
//                 console.log(`Loading message sent after ${end - start} ms`);
//             }
//             resolve();
//         }, timeoutMs);
//     });

//     /*const loadingMessagePromise = (async () => {
//         await new Promise((resolve) => setTimeout(resolve, timeoutMs));
//         if (!taskCompleted) {
//             try {
//                 const message = await bot.sendMessage(userID, '⏳ Loading, please wait...');
//                 loadingMsgMap.set(userID, message.message_id);
//                 const end = Date.now();
//                 console.log(`Loading message sent after ${end - start} ms`);
//             } catch (e) {
//                 console.error("Failed to send loading message: ", e);
//             }
//         }
//     })();*/

//     // const loadingMessagePromise = sendLoadingMessage(bot, userID, timeoutMs, taskCompleted);

//     const [taskResult] = await Promise.all([taskPromise, loadingMessagePromise]);
//     taskCompleted = true;
//     clearTimeout(loadingTimeout);

//     await deleteLoadingMessage(bot, userID);

//     if (!taskResult.success) {
//         throw new Error(taskResult.error || "Task failed.");
//     }

//     return taskResult.data;
// }

// async function sendLoadingMessage(bot, userID, timeoutMs, taskCompleted) {
//     const start = Date.now();
//     await new Promise((resolve) => setTimeout(resolve, timeoutMs));
//     if (taskCompleted) return;

//    try {
//         const message = await bot.sendMessage(userID, '⏳ Loading, please wait...');
//         loadingMsgMap.set(userID, message.message_id);
//         const end = Date.now();
//         console.log(`Loading message sent after ${end - start} ms`);
//     } catch (e) {
//         console.error("Failed to send loading message: ", e);
//     }
// }

// async function deleteLoadingMessage(bot, userID) {
//     const loadingMsgID = loadingMsgMap.get(userID);
//     if (!loadingMsgID) return;

//     try {
//         await bot.deleteMessage(userID, loadingMsgID);
//     } catch (e) {
//         console.error("Error deleting loading message: ", e);
//     } finally {
//         loadingMsgMap.delete(userID);
//     }
// }

// async function executeTask(taskFn) {
//     try {
//         const start = Date.now();
//         const data = await taskFn();
//         const end = Date.now();
//         console.log(`Task resolved after ${end - start} ms`);
//         return { success: true, data };
//     } catch (e) {
//         return { success: false, error: e.message || e.toString() };
//     }
// };

// // find better implementation
// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//     (async () => {
//         const syntheticData = () => new Promise((resolve) => setTimeout(() => resolve('Fetched data'), 2000));
//         const userID = "1649011853"
//         await loader(bot, userID, syntheticData, 10000);
//     })();
// }

// export async function loader(asyncFunction) {

// }

// export default loader;