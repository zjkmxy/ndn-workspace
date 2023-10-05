// Adapted from https://github.com/rajatvijay/react-google-calendar-clone
import { useCallback, useEffect, useState } from 'react'
import WeekView from '../components/calendar/week-view'
import * as CalendarEventHandler from '../components/calendar/calendar-event-handler'
import { CalEvent, Calendar } from '../utils/models'
import { rootDoc, setDocChangeHook, unsetDocChangeHook, initEvent } from "../utils/main"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'


export default function SharedCalendar() {
  const [events, setEvents] = useState<Partial<Calendar>>({})

  const loadDocument = useCallback(() => {
    setEvents(rootDoc.calendar)
  }, [])

  useEffect(() => {
    initEvent.then(() => loadDocument())
  }, [loadDocument])

  useEffect(() => {
    setDocChangeHook(docs => {
      setEvents(docs.calendar)
    })
    return () => unsetDocChangeHook()
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
    const [start, end] = [event.start.valueOf(), event.end.valueOf()]
    const newEvent: CalEvent = {
      id: CalendarEventHandler.generateId({ title: event.title, start: start, end: end }),
      title: event.title,
      start: start,
      end: end,
    }
    CalendarEventHandler.addEvent(rootDoc.calendar, newEvent)
  }

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
  const updateEvent = (eventId: string, updatedEvent: CalEvent.Update) => {
    CalendarEventHandler.updateEvent(
      eventId,
      updatedEvent,
      rootDoc.calendar
    )
  }

  /**
   * Deletes an event from the event list in the state
   * @param {String} eventId - Id of the event
  */
  const deleteEvent = (eventId: string) => {
    CalendarEventHandler.deleteEvent(eventId, rootDoc.calendar)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <WeekView
        events={events}
        onNewEvent={addNewEvent}
        onEventUpdate={updateEvent}
        onEventDelete={deleteEvent}
      />
    </LocalizationProvider>
  )
}
