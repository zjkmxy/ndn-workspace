import { PropsWithChildren } from 'react';
import TimeSlot from './time-slot';
import styles from './styles.module.css';
import moment from 'moment';
import Grid from '@mui/material/Unstable_Grid2'
import { Typography } from '@mui/material';

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
    <Grid container key={props.time} className={styles.row} columns={24}>
      <Grid className={styles['time-col']} xs={3}>
        <Typography>
          {formattedTime}
        </Typography>
      </Grid>
      {props.weekDays.map(day => (
        <TimeSlot
          key={day.dateStamp}
          dateStamp={day.dateStamp}
          time={props.time}
          openAddEventModal={props.openAddEventModal}
        />
      ))}
      {props.children}
    </Grid>
  );
}

export default TimeSlotGroup;