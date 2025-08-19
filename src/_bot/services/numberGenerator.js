import { fileURLToPath } from "url";

const charRanges = [
    [48, 57], // 0-9
    [65, 90], // A-Z
    [97, 122], // a-z
];

const chars = createCharSet();
const usedCodes = new Set();

let code;

// generates unique codes
export function* alphanumericGenerator(prefix, length, count, resetHour, resetMinute) {
    inputValidation(prefix, length, count, resetHour, resetMinute, usedCodes, chars);

    let expiresAt = getNextResetTime(resetHour, resetMinute);

    console.log(`Start codes generation at ${new Date()}`);

    for (let i = 0; i < count; i++) {
        if (Date.now() >= expiresAt.getTime()) {
            clearUsedCodes(usedCodes);
            expiresAt = getNextResetTime(resetHour, resetMinute);
        }
        
        do {
            code = generateRandomCode(chars, length);
        } while (usedCodes.has(code));

        usedCodes.add(code);
        yield `${prefix}-${code}`;
    }
}

function inputValidation(prefix, length, count, hour, minute, usedCodes, chars) {
    if (typeof prefix !== 'string' || !prefix.trim()) {
        throw new Error("Prefix must be a non-empty string");
    }

    if (typeof length !== 'number' || length <= 0) {
        throw new Error("Length must be a positive integer");
    }

    if (typeof count !== 'number' || count <= 0) {
        throw new Error("Count must be a positive integer");
    }

    if (typeof hour !== 'number' || hour < 0 || hour > 23) {
        throw new Error("Hour must be a number between 0 and 23");
    }

    if (typeof minute !== 'number' || minute < 0 || minute > 59) {
        throw new Error("Minute must be a number between 0 and 59");
    }

    if (usedCodes.size >= Math.pow(chars.length, length)) {
        throw new Error("Exhausted all possible unique codes for the given length");
    }
}

function createCharSet() {
    return charRanges.flatMap(([start, end]) => 
        Array.from({ length: end - start + 1 }, (_, i) => String.fromCharCode(start + i))
    ).join('');
}

function getNextResetTime(hour, minute) {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(hour, minute, 0, 0);
    if (now >= resetTime) resetTime.setDate(resetTime.getDate() + 1);
    return resetTime;
}

function generateRandomCode(chars, length) {
    code = '';

    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

function clearUsedCodes(usedCodes) {
    usedCodes.clear();
    console.log(`Cleared used codes at ${new Date()}`);
}

async function testCodeGenerator() {
    const resetTime = getNextResetTime(1, 0);
    console.log(`Next reset time calculated: ${resetTime}`);

    const testGen = alphanumericGenerator('GEN', 5, 100, 17, 0);
    const usedCodes = new Set([...testGen]);
    console.log(`Before clearing used codes: ${Array.from(usedCodes)}`);

    await new Promise((resolve) => {
        setTimeout(() => {
            clearUsedCodes(usedCodes);
            console.log(`After clearing used codes: ${Array.from(usedCodes)}`); 
            resolve();
        }, 5000);
    });
}

// generates queue numbers
let counter = 0;
let previousResetDate = new Date().toDateString();

export function* queueNumber(length) {
    while (true) {
        const currentDate = new Date().toDateString();
        if (currentDate !== previousResetDate) {
            counter = 0;
            previousResetDate = currentDate;
        }
        counter++;
        yield `${String(counter).padStart(length, '0')}`;
    }
}

function testQueueGenerator(durationInSeconds) {
    const queueGen = queueNumber(5);

    console.log(`Current Date: ${new Date().toDateString()}`);
    console.log(`Initial: ${queueGen.next().value}`);
    console.log(`Initial: ${queueGen.next().value}`);

    previousResetDate = new Date(Date.now() + 86400000).toDateString();
    console.log(`Simulated Reset Date: ${previousResetDate}`);
    console.log(`Reset: ${queueGen.next().value}`);

    const startTime = performance.now();
    let count = 0;

    while ((performance.now() - startTime) / 1000 < durationInSeconds) {
        queueGen.next();
        count++;
    }

    console.log(`Generated ${count} numbers in ${durationInSeconds} seconds`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        await testCodeGenerator();
        testQueueGenerator(5);
    })();
}

// can use nanoid/crypto library