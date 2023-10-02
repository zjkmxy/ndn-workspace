import { Col } from 'antd';
import styles from './styles.module.css';
import { isTodaysDate } from '../../utils/utils';

export default function TimeSlot(props: {
  dateStamp: number,
  openAddEventModal: (dateStamp: number, time: number) => void,
  time: number,
}) {
  return (
    <Col
      key={props.dateStamp}
      className={isTodaysDate(props.dateStamp)
        ? `${styles.col} ${styles.slot} ${styles['light-highlighter']}`
        : `${styles.col} ${styles.slot}`}
      span={3}
      onClick={() => props.openAddEventModal(props.dateStamp, props.time)}
    />
  );
}
