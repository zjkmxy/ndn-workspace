// Adapted from https://github.com/rajatvijay/react-google-calendar-clone
import {useEffect, useState} from 'react';
import WeekView from '../components/calendar/week-view';
import CalendarEventHandler from '../components/calendar/calendar-event-handler';
import { CalEvent, CalEventUpdate } from '../utils/utils';

export default function SharedCalendar () {
  const [events, setEvents] = useState<{ [time: number]: CalEvent[] }>({})

  useEffect(() => {
    // Load and save events
  }, [])

  /**
   * Add new event in the event list in the state
   * @param {Object} event - Event object
   * {
   *  start: {timeStamp} - Time stamp for the start of the event,
   *  title: {string} - Title fo the new event,
   *  end: {timeStamp} - Time stamp for the end of the event,
   * }
  */
  const addNewEvent = (event: { title: string, start: moment.Moment, end: moment.Moment }) => {
    const newEvent = new CalEvent(
      CalendarEventHandler.generateId (event),
      event.title,
      event.start,
      event.end
    )
    setEvents(CalendarEventHandler.add (events, newEvent))
  };

  /**
   * Updates an already existing event in the state event list
   * @param {string} event eventID id of the event
   * @param {Object} updatedEvent updated details of the event
   * {
   *  start: {timeStamp} - Time stamp for the start of the event,
   *  title: {string} - Title fo the new event,
   *  end: {timeStamp} - Time stamp for the end of the event,
   * }
  */
  const updateEvent = (eventId:string, updatedEvent: CalEventUpdate) => {
    setEvents(CalendarEventHandler.update(
      eventId,
      updatedEvent,
      events
    ))
  };

  /**
   * Deletes an event from the event list in the state
   * @param {String} eventId - Id of the event
  */
  const deleteEvent = (eventId:string) => {
    setEvents(CalendarEventHandler.delete (eventId, events))
  };

  return (
    <WeekView
      events={events}
      onNewEvent={addNewEvent}
      onEventUpdate={updateEvent}
      onEventDelete={deleteEvent}
    />
  );
}
