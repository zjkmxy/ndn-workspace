import styles from './styles.module.css';
import { isTodaysDate } from '../../utils/utils';
import Grid from '@mui/material/Unstable_Grid2'

export default function TimeSlot(props: {
  dateStamp: number,
  openAddEventModal: (dateStamp: number, time: number) => void,
  time: number,
}) {
  return (
    <Grid
      key={props.dateStamp}
      className={isTodaysDate(props.dateStamp)
        ? `${styles.col} ${styles.slot} ${styles['light-highlighter']}`
        : `${styles.col} ${styles.slot}`}
      xs={3}
      onClick={() => props.openAddEventModal(props.dateStamp, props.time)}
    />
  );
}
