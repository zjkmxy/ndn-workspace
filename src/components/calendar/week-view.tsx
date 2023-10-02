import { useEffect, useState } from 'react';
import moment from 'moment';
import AddEventModal from './add-event-modal';
import WeekToolbar from './week-toolbar';
import WeekHeader from './week-header';
import TimeSlotGroup from './time-slot-group';
import EventHighlighter from './event-highlighter';
import { times, getAllDaysInTheWeek } from '../../utils/utils';
import { CalEvent, Calendar } from '../../utils/models';
import styles from './styles.module.css'
import { RangeValue } from 'rc-picker/lib/interface';

export default function WeekView(props: {
  events: Calendar,
  onNewEvent: (event: { title: string, start: moment.Moment, end: moment.Moment }) => void,
  onEventDelete: (id: string) => void,
  onEventUpdate: (id: string, updatedEvent: CalEvent.Update) => void,
}) {
  const [startDate, setStartDate] = useState(moment())
  const [weekDays, setWeekDays] = useState(getAllDaysInTheWeek())
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [eventStart, setEventStart] = useState<moment.Moment | null>(null)
  const [eventEnd, setEventEnd] = useState<moment.Moment | null>(null)

  useEffect(() => {
    setWeekDays(getAllDaysInTheWeek(startDate))
  }, [startDate])

  /**
   * Sets next week days in the state
  */
  const goToNextWeek = () => setStartDate(moment(startDate).add(7, 'days'))

  /**
   * Sets previous week days in the state
  */
  const goToPreviousWeek = () => setStartDate(moment(startDate).subtract(7, 'days'))

  /**
   * Brings today's date in the view
   */
  const goToToday = () => setStartDate(moment())

  /**
   * Opens the add event modal and initialize the date from the cell
   * @param {timeStamp} dateStamp - DateStamp of the cell the user clicked
   * @param {number} time - Time of the cell the user clicked
  */
  const openAddEventModal = (dateStamp: number, time: number) => {
    const start = moment(dateStamp).set('hour', time);
    const end = start.clone().add(1, 'hour');
    setEventStart(start)
    setEventEnd(end)
    setShowAddEventModal(true)
  }

  /**
   * Closes the add event modal
  */
  const onCloseAddEventModal = () => setShowAddEventModal(false)

  /**
   * Adds the new event and closes the add event modal
   * @param {string} title - Title of the new event
  */
  const onSubmitAddEventModal = (title: string) => {
    if (eventStart && eventEnd) {
      props.onNewEvent({
        title,
        start: eventStart,
        end: eventEnd,
      });
      setShowAddEventModal(false)
    }
  }

  /**
   * Saves the timeStamps of the new event in the state
   * @param {arr: moment, moment} - Array containing start and end date of the new event
  */
  const onCurrentEventTimeChange = (dates: RangeValue<moment.Moment>) => {
    if (dates) {
      setEventStart(dates[0])
      setEventEnd(dates[1])
    }
  }

  return (
    <div className={styles.container}>

      <AddEventModal
        visible={showAddEventModal}
        onCancel={onCloseAddEventModal}
        onClose={onCloseAddEventModal}
        onSubmit={onSubmitAddEventModal}
        eventStart={eventStart}
        eventEnd={eventEnd}
        onTimeChange={onCurrentEventTimeChange}
        editMode={false}
        eventTitle=''
      />

      <WeekToolbar
        goToPreviousWeek={goToPreviousWeek}
        goToNextWeek={goToNextWeek}
        startDate={startDate}
        goToToday={goToToday}
        weekDays={weekDays}
      />

      <WeekHeader weekDays={weekDays} dateStamp={0} />

      {times.map(time => (
        <TimeSlotGroup
          key={time}
          time={time}
          weekDays={weekDays}
          openAddEventModal={openAddEventModal}
        >
          {props.events[time] &&
            props.events[time].map(
              event =>
                CalEvent.startWeek(event) <= moment(startDate).week() &&
                CalEvent.endWeek(event) >= moment(startDate).week() &&
                <EventHighlighter
                  onEventDelete={props.onEventDelete}
                  onEventUpdate={props.onEventUpdate}
                  key={event.title + event.end + event.start}
                  startDate={startDate}
                  event={event}
                />
            )}
        </TimeSlotGroup>
      ))}
    </div>
  )
}
