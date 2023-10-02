import { Row, Col } from 'antd';
import styles from './styles.module.css';
import { isTodaysDate } from '../../utils/utils';

export default function WeekHeader(props: {
  dateStamp: number;
  weekDays: {
    date: number;
    dateStamp: number;
    weekDayName: string;
  }[],
}) {
  return (
    <Row>
      <Col span={3} />
      {props.weekDays.map(day => (
        <Col
          key={day.dateStamp}
          span={3}
          className={isTodaysDate(props.dateStamp)
            ? `${styles.col} ${styles['week-days']} ${styles['light-highlighter']}`
            : `${styles.col} ${styles['week-days']}`}
        >
          <p className={styles['week-day-name']}>{day.weekDayName}</p>
          <p className={styles['week-dates']}>{day.date}</p>
        </Col>
      ))}
    </Row>
  );
}
