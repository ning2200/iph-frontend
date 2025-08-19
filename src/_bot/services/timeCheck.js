import path from "path";
import fs from 'fs';
import { fileURLToPath } from "url";
import { officeHours } from "../config/config.js";
import { loadCSVData } from "../utils/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botFolder = path.resolve(__dirname, '../');
const configFolder = path.join(botFolder, 'config');

const weekendDays = [0, 6];

async function isOfficeHours() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const publicHoliday = await isPublicHoliday();

    if (weekendDays.includes(dayOfWeek) || publicHoliday) {
        console.log(`Weekend/Public Holiday: ${now}`);
        return false;
    }

    const currentMinutes = convertToMinutes(now.getHours(), now.getMinutes());
    const startMinutes = convertToMinutes(officeHours.start.hour, officeHours.start.minute);
    const endMinutes = convertToMinutes(officeHours.end.hour, officeHours.end.minute);

    console.log(`Weekday: ${now}`);
    
    return isWithinTimePeriod(currentMinutes, startMinutes, endMinutes);
}

function isWithinTimePeriod(current, start, end) {
    return current >= start && current < end;
}

function convertToMinutes(hour, minute) {
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        console.error(`Invalid time input: hour = ${hour}, minute = ${minute}`);
        return false;
    }

    return hour * 60 + minute;
}

async function parsePublicHolidayCSV(today, year, csvFile) {
    if (!fs.existsSync(csvFile)) {
        console.warn(`CSV file missing for year ${year}. Ensure the file exists in the config folder.`);
        return false;
    }

    try {
        const csvData = await loadCSVData(csvFile);
        return csvData.some((holiday) => new Date(holiday.date).toISOString().split('T')[0] === today);
    } catch (e) {
        console.error(`Error reading or parsing CSV file: ${e}`);
        return null;
    }
}

async function isPublicHoliday() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const year = now.getFullYear();
    const holidayCSVFile = path.resolve(configFolder, `PublicHolidaysfor${year}.csv`);

    return await parsePublicHolidayCSV(today, year, holidayCSVFile);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        const result = await isOfficeHours();
        console.log(result);
    })();
}

export default isOfficeHours;