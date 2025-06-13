const { toZonedTime } = require('date-fns-tz');
const { format, addSeconds } = require('date-fns');

const TZ = "America/Guayaquil";

const getTimeZone = (oldDate) => {
    oldDate = oldDate || new Date(Date.now());
    return toZonedTime(oldDate, TZ);
};

const getDateFormat = (date, formatText) => {
    formatText = formatText || 'yyyy-MM-dd HH:mm:ss';
    return format(date || getTimeZone(), formatText);
};

const excelDateToJSDate = (excelDate) => {
    if (!excelDate) {
        return "";
    }
    if (typeof excelDate === "string") {
        return excelDate;
    }

    const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
    return getDateFormat(getTimeZone(date), 'yyyy-MM-dd');
};

const addSecondsToTime = (time, seconds) => {
    const date = getTimeZone();
    const [hours, minutes] = time.split(':');
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    date.setSeconds(0);
    const newDate = addSeconds(date, seconds);
    return getDateFormat(newDate, 'HH:mm');
};

/**
 * Permite convertir los segundos a su formato en hora (hh:mm hrs.)
 * @param {int} seconds
 * @returns {String} - Hora en formato (hh:mm hrs.)
 */
const showTime = (seconds) => {
    const hour = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minute = Math.floor((seconds / 60) % 60).toString().padStart(2, '0');
    return hour + ':' + minute + ' hrs.';
};

/**
 * Permite convertir los metros a su formato de kilometros o metros (15.5 km., 15.5 mts.)
 * @param {int} meters
 * @returns {String} - Distancia en kilometros o metros (15.5 km., 15.5 mts.)
 */
const showDistance = (meters, showMeters) => {
    if (meters === 0 && showMeters) return "0 m.";
    if (meters === 0 && !showMeters) return "0.0 km.";

    let metersText = "";
    metersText = (meters / 1000).toFixed(3) + ' km.';
    if (meters <= 999 && showMeters) {
        metersText = meters + ' m.';
    }

    return metersText;
};

module.exports = {
    getTimeZone,
    getDateFormat,
    excelDateToJSDate,
    addSecondsToTime,
    showTime,
    showDistance
};