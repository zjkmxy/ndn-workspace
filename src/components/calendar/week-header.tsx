import styles from './styles.module.css'
import { isTodaysDate } from '../../utils/utils'
import Grid from '@mui/material/Unstable_Grid2'

export default function WeekHeader(props: {
  dateStamp: number
  weekDays: {
    date: number
    dateStamp: number
    weekDayName: string
  }[],
}) {
  return (
    <Grid container columns={24}>
      <Grid xs={3}></Grid>
      {props.weekDays.map(day => (
        <Grid
          key={day.dateStamp}
          xs={3}
          className={isTodaysDate(props.dateStamp)
            ? `${styles.col} ${styles['week-days']} ${styles['light-highlighter']}`
            : `${styles.col} ${styles['week-days']}`}
        >
          <p className={styles['week-day-name']}>{day.weekDayName}</p>
          <p className={styles['week-dates']}>{day.date}</p>
        </Grid>
      ))}
    </Grid>
  )
}
