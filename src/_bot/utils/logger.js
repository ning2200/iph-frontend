// import winston from 'winston';

// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.printf(({ timestamp, level, message }) => {
//             return `${timestamp} - ${level}: ${message}`;
//         })
//     ),
//     transports: [
//         new winston.transports.Console(),
//         new winston.transports.File({ filename: 'error.log', level: 'error' })
//     ],
//     exceptionHandlers: [
//         new winston.transports.File({ filename: 'exception.log' })
//     ]
// });

// /**
//  * 
//  * @param {string} context 
//  * @param {Error|string} error 
//  * @param {boolean} [request=false]
//  * @returns {object|undefined}
//  */
// export function errorLog(context, error, request = false) {
//     const errorMessage = `${context}: ${error.message || error}`;
//     logger.error(errorMessage, { context, error });

//     if (request) {
//         return { success: false, message: errorMessage };
//     }
// }

// /**
//  * 
//  * @param {Function} fn 
//  * @param {Function} [getUserID=(args) => args[1]?.chat?.id]
//  * @returns {Function}
//  */
// export function errorWrapper(fn, getUserID = (args) => args[1]?.chat?.id, listeners = ['message', 'callback_query', 'contact', 'photo', 'video', 'document']) {
//     return async function wrappedFunction(...args) {
//         const bot = args[0];
//         const userID = getUserID(args);

//         if (!userID) {
//             logger.warn(`userID not found in function ${fn.name}. Skipping message handling.`, { functionName: fn.name });
//             return;
//         }

//         try {
//             await fn(...args);
//         } catch (error) {
//             errorLog(`Error in function ${fn.name}: `, error);
//             await bot?.sendMessage(userID, "⚠️ An error occured while processing your request.");
//         } finally {
//             listeners.forEach(listenerType => {
//                 bot?.removeListener?.(listenerType, args[1]?.listener);
//             })
//         }
//     };
// }

// multiple listeners usage example: const wrappedFunction = errorWrapper(myFunction, getUserID, ['message', 'callback', 'contact']);