import { PropsWithChildren } from 'react';
import { Row, Col } from 'antd';
import TimeSlot from './time-slot';
import styles from './styles.module.css';
import moment from 'moment';

function TimeSlotGroup(props: PropsWithChildren<{
  time: number,
  weekDays: {
    date: number;
    dateStamp: number;
    weekDayName: string;
  }[],
  openAddEventModal: (dateStamp: number, time: number) => void,
}>) {
  const formattedTime = moment().set('hours', props.time).format('h a');
  return (
    <Row key={props.time} className={styles.row}>
      <Col className={styles['time-col']} span={3}>
        <span className={styles['time-string']}>
          {formattedTime}
        </span>
      </Col>
      {props.weekDays.map(day => (
        <TimeSlot
          key={day.dateStamp}
          dateStamp={day.dateStamp}
          time={props.time}
          openAddEventModal={props.openAddEventModal}
        />
      ))}
      {props.children}
    </Row>
  );
}

export default TimeSlotGroup;