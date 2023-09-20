const cron = require("node-cron");
const axios = require("axios");
const buffer = require("buffer");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
    ]
});

/**
 * Diabetes Connect Credentials
 */
const DIABETES_CONNECT_USERNAME = process.env.DIABETES_CONNECT_USERNAME;
const DIABETES_CONNECT_PASSWORD = process.env.DIABETES_CONNECT_PASSWORD;

/**
 * Nightscout API
 */
const NIGHTSCOUT_URL = process.env.NIGHTSCOUT_URL;
const NIGHTSCOUT_API_TOKEN = process.env.NIGHTSCOUT_API_TOKEN;

/**
 * Diabetes Connect API Settings (Don't change this unless you know what you are doing)
 */
const API_URL = "portal.diabetesconnect.de/rest-api"
const USER_AGENT = "Diabetes Connect Nightscout Uploader";
const API_HOST = "portal.diabetesconnect.de";
const API_REFERER = "https://portal.diabetesconnect.de/";

let authTicket = {};

const libreLinkUpHttpHeaders = {
    "User-Agent": USER_AGENT,
    "Content-Type": "application/json",
    "Host": API_HOST,
    "Referer": API_REFERER,
}

const nightScoutHttpHeaders = {
    "api-secret": NIGHTSCOUT_API_TOKEN,
    "User-Agent": USER_AGENT,
    "Content-Type": "application/json",
}

logger.info("Started")
cron.schedule("*/5 * * * *", () => {
    main();
});

function main() {
    getEntries();
}

async function getEntries() {

    const url = "https://" + API_URL + "/eintraege/paged.json?take=10&skip=0&page=1&pageSize=10";

    let authenticatedHttpHeaders = libreLinkUpHttpHeaders;
    let encoded_credentials = Buffer.from(DIABETES_CONNECT_USERNAME + ":" + DIABETES_CONNECT_PASSWORD, 'binary').toString('base64')
    authenticatedHttpHeaders["Authorization"] = "Basic " + encoded_credentials;

    try {
        const response = await axios.get(url,
            {
                headers: authenticatedHttpHeaders
            });

        const responseData = response.data;
        let entryData = responseData.data;
        logger.info("Received entries");
        uploadToNightscout(entryData);
    } catch (error) {
        logger.error("Invalid credentials: " + error);
    }
}


async function uploadToNightscout(entryData) {

    let formattedEntries= [];

    entryData.forEach((entry) => {

      let entryDate = getIsoDateFromNumber(entry.datumUtc);
      let entryMahlzeit = null;
      if (entry.mahlzeit) {
          entryMahlzeit = getCarbsFromMahlzeit(entry.mahlzeit)
      }

      if(entry.blutzucker || entry.bolus || entry.mahlzeit) {
          formattedEntries.push({
              "eventType": "Meal Bolus",
              "glucose": entry.blutzucker,
              "glucoseType": "Finger",
              "units": "mg/dl", //TODO!!!
              "carbs": entryMahlzeit, //TODO!!!
              "insulin": entry.bolus,
              "created_at": entryDate,
              "utcOffset": 0
          });
        }

    });
    const url = "https://" + NIGHTSCOUT_URL + "/api/v1/treatments"
    try {
        const response = await axios.post(url,
            formattedEntries,
            {
                headers: nightScoutHttpHeaders
            });

        logger.info("Upload of " + formattedEntries.length + " entries to Nightscout successfull");
    } catch (error) {
        logger.error("Upload to Nightscout failed: " + error);
    }
}

function getIsoDateFromNumber(timeStamp) {
    return new Date(timeStamp).toISOString();
}

function getCarbsFromMahlzeit(mahlzeit) {
    var floatMahlzeit = +(mahlzeit);
    return (floatMahlzeit*5);
}
