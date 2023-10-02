import { useState } from 'react';
import moment from 'moment';
import AddEventModal from './add-event-modal';
import { generateWeekViewCoordinates, CalEvent, CalEventUpdate } from '../../utils/utils';
import styles from './styles.module.css';
import { RangeValue } from 'rc-picker/lib/interface';

export default function EventHighlighter(props: {
  event: CalEvent,
  startDate: moment.Moment,
  onEventDelete: (id: string) => void,
  onEventUpdate: (id: string, updatedEvent: CalEventUpdate) => void,
}) {
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [eventNewStart, setEventNewStart] = useState<moment.Moment | null>(null)
  const [eventNewEnd, setEventNewEnd] = useState<moment.Moment | null>(null)

  /**
   * Deletes the event from the event list
  */
  const deleteEvent = () => {
    props.onEventDelete(props.event.id)
    setShowEditEventModal(false)
  }

  /**
   * Updates the event
   * @param {string} title - Updated title of the event
   */
  const updateEvent = (title: string) => {
    props.onEventUpdate(props.event.id, {
      title: title,
      start: eventNewStart,
      end: eventNewEnd,
    })
    setShowEditEventModal(false)
  }

  /**
   * Open the edit event modal and initializes the start and end time
   */
  const openEditEventModal = () => {
    console.log(props.event.title);
    setShowEditEventModal(true)
    setEventNewStart(props.event.start)
    setEventNewEnd(props.event.end)
  };

  /**
   * Set the updated start and end times the state of the event being edited
   * @param {arr: moment, moment} - Array containing start and end date of the event
   */
  const onCurrentEventTimeChange = (dates: RangeValue<moment.Moment>) => {
    // console.log('called');
    if (dates) {
      const [st, ed] = dates
      setEventNewStart(st)
      setEventNewEnd(ed)
    }
  };

  /**
   * Closes modal and does nothing more!
   */
  const closeModal = () => {
    setShowEditEventModal(false)
  };

  return (
    <>
      <AddEventModal
        editMode={true}
        eventTitle={props.event.title}
        visible={showEditEventModal}
        onCancel={deleteEvent}
        onClose={closeModal}
        onSubmit={updateEvent}
        eventStart={eventNewStart}
        eventEnd={eventNewEnd}
        onTimeChange={onCurrentEventTimeChange}
      />
      <div
        onClick={openEditEventModal}
        className={styles['event-highlighter']}
        style={{
          ...generateWeekViewCoordinates(
            props.event,
            props.startDate
          ),
        }}
      >
        {props.event.title} <br />
        <span style={{ fontSize: 10 }}>
          {moment(props.event.start).format('hh:mm a')}
          {' '}
          -
          {' '}
          {moment(props.event.end).format('hh:mm a')}
        </span>
      </div>
    </>
  )
}
