import React from 'react'
import moment from 'moment'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'

export default function AddEvent(props: {
  title: string,
  start: moment.Moment | null,
  end: moment.Moment | null,
  onTitleChange: React.ChangeEventHandler<HTMLInputElement>,
  onTimeChange: (value: [moment.Moment | null, moment.Moment | null]) => void,
}) {
  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <TextField
          fullWidth
          label='Title'
          margin='normal'
          value={props.title}
          onChange={props.onTitleChange}
        />
      </Grid>
      <Grid xs={6}>
        <DateTimePicker
          label='Start time'
          value={moment(props.start)}
          onChange={newVal => props.onTimeChange([newVal, null])}
          slotProps={{ textField: { fullWidth: true } }} />
      </Grid>
      <Grid xs={6}>
        <DateTimePicker
          label='End time'
          value={moment(props.end)}
          onChange={newVal => props.onTimeChange([null, newVal])}
          slotProps={{ textField: { fullWidth: true } }} />
      </Grid>
    </Grid>
  )
}
