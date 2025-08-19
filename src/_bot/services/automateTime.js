// transfer to timecheck.js

// dataset availability -> log/external service to notify
// automation timing eg. # Runs at 1:00 AM every Monday 0 1 * * 1 node /path/to/your/script.js

/*const collectionId = "691"
const url = "https://api-production.data.gov.sg/v2/public/api/collections/" + collectionId + "/metadata"

fetch(url)
.then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
})
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error('Error fetching data:', error);
});

async function isPublicHoliday() {
    try {
        const { data } = await axios.get('https://');
        const publicHolidays = data.holidays.map(holiday => holiday.date);
        const today = new Date().toISOString().split('T')[0];
        return publicHolidays.includes(today);
    } catch (error) {
        console.error('Failed to fetch public holidays: ', error);
        return false;
    }
}*/

/*automate csv retrieval
const fs = require('fs');
const https = require('https');
const path = require('path');

const collectionId = "691";
const metadataUrl = `https://api-production.data.gov.sg/v2/public/api/collections/${collectionId}/metadata`;

// The folder where your configs and datasets are stored
const configFolder = path.join(__dirname, 'config');

// The year to filter
const targetYear = new Date().getFullYear();

/**
 * Helper function to fetch data from a URL.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<any>} The parsed JSON data.
 */
/*async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed. Status code: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', (err) => reject(err));
  });
}

/**
 * Downloads a CSV file from a given URL and saves it to the config folder.
 * @param {string} csvUrl - The CSV file URL.
 * @param {string} filename - The name of the file to save.
 * @returns {Promise<void>}
 */
/*async function downloadAndSaveCSV(csvUrl, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(configFolder, filename);

    https.get(csvUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download CSV. Status code: ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`File saved to ${filePath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => reject(err));
      });
    });
  });
}

/**
 * Main function to automate the process.
 */
/*async function main() {
  try {
    // Ensure the config folder exists
    if (!fs.existsSync(configFolder)) {
      fs.mkdirSync(configFolder);
    }

    // Fetch the metadata
    console.log('Fetching metadata...');
    const metadata = await fetchJson(metadataUrl);

    // Find the relevant dataset for the target year
    const dataset = metadata.result.resources.find((resource) =>
      resource.name.includes(targetYear.toString())
    );

    if (!dataset) {
      console.log(`No dataset found for ${targetYear}.`);
      return;
    }

    // Download the dataset CSV file
    console.log(`Downloading dataset for ${targetYear}...`);
    const filename = `public_holidays_${targetYear}.csv`;
    await downloadAndSaveCSV(dataset.download_url, filename);

    console.log('Dataset download complete.');
  } catch (err) {
    console.error('Error during automation:', err);
  }
}

main();*/

/* data caching
let holidayCache = null;

function loadHolidays() {
    if (holidayCache) return holidayCache;

    const year = new Date().getFullYear();
    const csvFile = path.join(configFolder, `public_holidays_${year}.csv`);
    
    if (!fs.existsSync(csvFile)) {
        console.warn(`Public holiday file missing for year ${year}.`);
        holidayCache = [];
        return holidayCache;
    }

    try {
        const csvData = fs.readFileSync(csvFile, 'utf-8');
        holidayCache = csvParse.parse(csvData, { columns: true });
        return holidayCache;
    } catch (err) {
        console.error('Error loading public holidays:', err);
        holidayCache = [];
        return holidayCache;
    }
}

function isPublicHoliday() {
    const today = new Date().toISOString().split('T')[0];
    const holidays = loadHolidays();
    return holidays.some((holiday) => holiday.date === today);
}*/
