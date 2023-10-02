import moment from 'moment';
import { CalEvent, AllEvents, CalEventUpdate } from '../../utils/utils';

const CalendarEventHandler = (function () {
  /**
   * Add event after adding meta data in the event
   * @param {arr} allEvent - Array of all the events
   * @param {Object} newEvent - Event object of the new event
   * @returns {Object} allEvents - A new object reference for all events
  */
  function addEvent(allEvents: AllEvents, newEvent: CalEvent): AllEvents {
    const time = moment(newEvent.start).hours();
    if (allEvents[time]) {
      allEvents[time].push(newEvent);
    } else {
      allEvents[time] = [newEvent];
    }
    return { ...allEvents };
  }

  /**
   * Generate unique id for an event
   * @param {timeStamp} start - Start timestamp of the event
   * @param {timeStamp} end - End timeStamp of the event
   * @params {string} title - Title of the event
   * @returns {string} id - Unique id
  */
  function generateUniqueId(event: { title: string, start: moment.Moment, end: moment.Moment }) {
    return event.start + event.title + event.end;
  }

  /**
   * Deletes event from the list
   * @param {string} eventId - Id of the event to be deleted
   * @param {arr} allEvents - Array of all the events
   * @returns {Object} allEvents - A new object reference for all events
  */
  function deleteEvent(eventId: string, allEvents: AllEvents): AllEvents {
    Object.keys(allEvents).forEach(time => {
      allEvents[time] = allEvents[time].filter(event => event.id !== eventId);
    });
    return { ...allEvents };
  }

  /**
   * Updates an event from the list
   * @param {string} eventId - Id of the event to be deleted
   * @param {Object} updatedEvent - Event objects with the updated data
   * @param {arr} allEvents - Array of all the events
   * @returns {Object} allEvents - A new object reference for all events
  */
  function updateEvent(eventId: string, updatedEvent: CalEventUpdate, allEvents: AllEvents): AllEvents {
    Object.keys(allEvents).forEach(time => {
      allEvents[time] = allEvents[time].map(
        event => (event.id === eventId ? event.update(updatedEvent) : event)
      );
    });
    return { ...allEvents };
  }

  return {
    add: addEvent,
    delete: deleteEvent,
    update: updateEvent,
    generateId: generateUniqueId,
  };
})();

export default CalendarEventHandler;
