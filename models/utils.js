import * as logger from "./logger.js";
import * as chalkThemes from "./chalkThemes.js";

function log(message, ...params) {
    logger.log(chalkThemes.main("(utils) " + message), ...params);
}

export function getUnixTime() {
    return Math.floor(Date.now() / 1000);
}

