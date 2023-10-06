import { Dialog, Button, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { useState } from 'react'

export default function NewItemModal(props: {
  visible: boolean,
  title: string,
  onSubmit: (name: string) => void,
  onCancel: () => void,
}) {
  const [name, setName] = useState('')

  return (
    <Dialog
      open={props.visible}
    >
      <DialogTitle>
        {props.title}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          required
          label='Name'
          margin='normal'
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          key="back"
          type="reset"
          onClick={props.onCancel}>
          Back
        </Button>
        <Button
          key="submit"
          type="submit"
          onClick={() => props.onSubmit(name)}
          disabled={name === ''}
          autoFocus>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}