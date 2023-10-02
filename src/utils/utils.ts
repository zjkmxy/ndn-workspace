import QrScanner from "qr-scanner";
import moment from 'moment';
import { CalEvent } from "./models";

export function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0) || 0);
}

export function bytesToBase64(bytes: Uint8Array) {
  const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join("");
  return btoa(binString);
}

export async function scanQrCode(file: File) {
  try {
    const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
    const wire = base64ToBytes(result.data);
    return wire;
  } catch (error) {
    console.error(`Unable to parse QRCode due to error: ${error}`);
    return undefined;
  }
}

// Caldendar

/**
   * Generate all days in a week
   * @param {moment} currentDate - Any date in the week
   * @returns {array} days - All days in the week with date, dateStamp and weekDayName
  */
export const getAllDaysInTheWeek = (currentDate = moment()) => {
  const weekStart = currentDate.clone().startOf('week');

  const days = Array.from(Array(7))
    .map((day, index) => index)
    .map(day =>
      moment(weekStart).add(day, 'days').set('minutes', 0).set('seconds', 0)
    )
    .map(momentObj => ({
      date: momentObj.date(),
      dateStamp: +momentObj,
      weekDayName: momentObj.format('ddd'),
    }));

  return days;
};

// All the hours in the day
export const times = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
];

/**
   * Generated coordinated for the highlight
   * @param {Object} event - Event object
   * {
   *  start: Time stamp for the start of the event :timeStamp,
   *  title: Title fo the new event :String,
   *  end: Time stamp for the end of the event :timeStamp,
   * }
   * @param {moment.MomentInput} startDate - Timestamp of any date in the current week
   * @returns {Object} coordinates - Coordinates object with
   * {
   *  top - CSS top of the element,
   *  left - CSS left of the element,
   *  width - CSS width of the element,
   *  height - CSS height of the element
   * }
  */
export const generateWeekViewCoordinates = (event: CalEvent, startDate: moment.MomentInput) => {
  const start = moment(event.start);
  const end = moment(event.end);
  const duration = moment.duration(end.diff(start));
  const weekStart = moment(startDate);

  // Calculating Top
  const top = start.minutes() === 30 ? '50%' : '0%';

  // Calculating height
  const timeFactor = duration.hours() + duration.minutes() / 60;
  const height = timeFactor * 100;

  let left = 0, width = 0;
  if (weekStart.week() === start.week()) {
    const weekDay = start.weekday();
    left = (weekDay + 1) * 12.5;
  }

  if (
    weekStart.week() === start.week() &&
    weekStart.week() === end.week()
  ) {
    const daysDiff = duration.days();
    width = (daysDiff + 1) * 12.5 - 2;
  }

  if (weekStart.week() > start.week() && weekStart.week() === end.week()) {
    const daysDiff = moment
      .duration(
        end.diff(
          weekStart
            .startOf('week')
            .set('hours', start.hours())
            .set('minutes', start.minutes())
        )
      )
      .days();
    width = (daysDiff + 1) * 12.5 - 2;
  }

  if (weekStart.week() > start.week()) {
    left = 12.5;
  }

  if (weekStart.week() < end.week()) {
    width = 100 - left;
  }

  return {
    top: top + '%',
    left: left + '%',
    height: height + '%',
    width: width + '%',
  };
};

/**
 * Checks if the dateStamp represents todays date
 * @param {moment.MomentInput} dateStamp - Date Stamp to check
 * @return {boolean}
 */
export const isTodaysDate = (dateStamp: moment.MomentInput) => {
  const today = moment();
  dateStamp = moment(dateStamp);
  return (
    moment.duration(dateStamp.diff(today)).days() === 0 &&
    today.day() === dateStamp.day()
  );
};