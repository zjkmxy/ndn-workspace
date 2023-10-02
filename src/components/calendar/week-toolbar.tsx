import { Row, Col, Button, Tooltip } from 'antd';
import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import styles from './styles.module.css';
import moment from 'moment';

export default function WeekToolbar(props: {
  startDate: moment.Moment,
  weekDays: {
    date: number;
    dateStamp: number;
    weekDayName: string;
  }[],
  goToToday: () => void,
  goToPreviousWeek: () => void,
  goToNextWeek: () => void,
}) {
  const formattedDate = moment(props.startDate).format('MMM YYYY');
  return (
    <Row gutter={4} className={styles.toolbar}>
      <Col span={6} offset={3} className={styles['app-title']}>
        <CalendarOutlined className={styles.spacify} />Meeting Calendar
      </Col>
      <Col span={3} offset={6} className={styles['align-right']}>
        <Tooltip placement="topLeft" title={moment().format('dddd, MMM D')}>
          <Button onClick={props.goToToday}>Today</Button>
        </Tooltip>
      </Col>

      <Col span={3} className={styles['week-buttons']}>
        <Button onClick={props.goToPreviousWeek} className={styles.spacify} icon={<LeftOutlined />} />
        <Button onClick={props.goToNextWeek} icon={<RightOutlined />} />
      </Col>

      <Col span={3} className={styles['toolbar-date']}>
        {formattedDate}
      </Col>

    </Row>
  );
}
