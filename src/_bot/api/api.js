import dotenv from 'dotenv';

dotenv.config();

const axiosURL = process.env.AXIOS_SERVER_URL || 'http://localhost:4000';
const flaskURL = process.env.FLASK_SERVER_URL || 'http://localhost:5000';
if (!axiosURL || !flaskURL) throw new Error(`Invalid Backend URLs`);

export { axiosURL, flaskURL }