import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import React, { useState } from 'react'
import AddEvent from './add-event'

export default function AddEventModal(props: {
  visible: boolean,
  editMode: boolean,
  eventTitle: string,
  eventStart: moment.Moment | null,
  eventEnd: moment.Moment | null,
  onTimeChange: (value: [moment.Moment | null, moment.Moment | null]) => void,
  onSubmit: (title: string) => void,
  onClose: React.MouseEventHandler<HTMLElement>,
  onCancel: React.MouseEventHandler<HTMLElement>,

}) {
  const [title, setTitle] = useState(props.eventTitle)

  return (
    <Dialog
      open={props.visible}
    >
      <DialogTitle>
        {props.editMode ? 'Update Event' : 'Add Event'}
      </DialogTitle>
      <DialogContent>
        <AddEvent
          title={title}
          onTitleChange={e => setTitle(e.target.value)}
          start={props.eventStart}
          end={props.eventEnd}
          onTimeChange={props.onTimeChange}
        />
      </DialogContent>
      <DialogActions>
        <Button key="back" type="reset" onClick={props.onCancel}>
          {props.editMode ? 'Delete' : 'Cancel'}
        </Button>
        <Button key="submit" type="submit" onClick={() => props.onSubmit(title)} autoFocus>
          {props.editMode ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
