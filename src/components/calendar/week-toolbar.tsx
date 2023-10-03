// import { Row, Col, Button, Tooltip } from 'antd';
// import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import Stack from '@mui/material/Stack';
import EventIcon from '@mui/icons-material/Event';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import styles from './styles.module.css';
import moment from 'moment';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';

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
    <Stack direction='row' alignItems="center" spacing={4} className={styles.toolbar} justifyContent='space-between'>
      <Stack direction='row' justifyContent='flex-start'>
        <EventIcon className={styles.spacify} />
        <Typography sx={{ align: 'left' }} className={styles['app-title']}>
          Meeting Calendar
        </Typography>
      </Stack>
      <Stack direction='row' alignItems="center" justifyContent='flex-end'>
        <Tooltip placement='top-start' title={moment().format('dddd, MMM D')}>
          <Button onClick={props.goToToday}>Today</Button>
        </Tooltip>
        <Box className={styles['week-buttons']}>
          <IconButton onClick={props.goToPreviousWeek} className={styles.spacify}>
            <ArrowLeftIcon />
          </IconButton>
          <IconButton onClick={props.goToNextWeek}>
            <ArrowRightIcon />
          </IconButton>
        </Box>
        <Typography className={styles['toolbar-date']}>
          {formattedDate}
        </Typography>
      </Stack>
    </Stack>
  );
}
