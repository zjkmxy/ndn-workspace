import moment from 'moment'
import { CalEvent, Calendar } from '../../utils/models'

/**
 * Add event after adding meta data in the event
 * @param {arr} allEvent - Array of all the events
 * @param {Object} newEvent - Event object of the new event
*/
export function addEvent(allEvents: Calendar, newEvent: CalEvent) {
  const time = moment(newEvent.start).hours()
  if (allEvents[time]) {
    allEvents[time].push(newEvent)
  } else {
    allEvents[time] = [newEvent]
  }
}

/**
 * Generate unique id for an event
 * @param {timeStamp} start - Start timestamp of the event
 * @param {timeStamp} end - End timeStamp of the event
 * @param {string} title - Title of the event
 * @returns {string} id - Unique id
*/
export function generateId(event: { title: string, start: number, end: number }) {
  return event.start.toString() + event.title + event.end.toString()
}

/**
 * Deletes event from the list
 * @param {string} eventId - Id of the event to be deleted
 * @param {arr} allEvents - Array of all the events
*/
export function deleteEvent(eventId: string, allEvents: Calendar) {
  Object.keys(allEvents).forEach(time => {
    let i = 0
    for (i = 0; i < allEvents[time].length; i++) {
      if (allEvents[time][i].id === eventId) {
        break
      }
    }
    if (i < allEvents[time].length) {
      allEvents[time].splice(i, 1)
    }
  })
}

/**
 * Updates an event from the list
 * @param {string} eventId - Id of the event to be deleted
 * @param {Object} updatedEvent - Event objects with the updated data
 * @param {arr} allEvents - Array of all the events
 * @returns {Object} allEvents - A new object reference for all events
*/
export function updateEvent(eventId: string, updatedEvent: CalEvent.Update, allEvents: Calendar) {
  Object.keys(allEvents).forEach(time => {
    allEvents[time].forEach((event, index) => {
      if (event.id === eventId) {
        allEvents[time][index] = CalEvent.update(event, updatedEvent)
      }
    })
  })
}
