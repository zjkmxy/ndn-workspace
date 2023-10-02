import { useState } from 'react';
import moment from 'moment';
import AddEventModal from './add-event-modal';
import { generateWeekViewCoordinates } from '../../utils/utils';
import { CalEvent } from '../../utils/models';
import styles from './styles.module.css';
import { RangeValue } from 'rc-picker/lib/interface';

export default function EventHighlighter(props: {
  event: CalEvent,
  startDate: moment.Moment,
  onEventDelete: (id: string) => void,
  onEventUpdate: (id: string, updatedEvent: CalEvent.Update) => void,
}) {
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [eventNewStart, setEventNewStart] = useState<number | undefined>(undefined)
  const [eventNewEnd, setEventNewEnd] = useState<number | undefined>(undefined)

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
      start: eventNewStart?.valueOf(),
      end: eventNewEnd?.valueOf(),
    })
    setShowEditEventModal(false)
  }

  /**
   * Open the edit event modal and initializes the start and end time
   */
  const openEditEventModal = () => {
    // console.debug(props.event.title);
    setShowEditEventModal(true)
    setEventNewStart(props.event.start)
    setEventNewEnd(props.event.end)
  };

  /**
   * Set the updated start and end times the state of the event being edited
   * @param {arr: moment, moment} - Array containing start and end date of the event
   */
  const onCurrentEventTimeChange = (dates: RangeValue<moment.Moment>) => {
    // console.debug('called');
    if (dates) {
      const [st, ed] = dates
      setEventNewStart(st?.valueOf())
      setEventNewEnd(ed?.valueOf())
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
        eventStart={eventNewStart ? moment(eventNewStart) : null}
        eventEnd={eventNewEnd ? moment(eventNewEnd) : null}
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
