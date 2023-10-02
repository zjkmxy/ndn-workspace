import {Modal, Button} from 'antd';
import React, {useState} from 'react';
import AddEvent from './add-event';
import {RangeValue} from 'rc-picker/lib/interface';

export default function AddEventModal (props : {
  visible: boolean,
  editMode: boolean,
  eventTitle: string,
  eventStart: moment.Moment | null,
  eventEnd: moment.Moment | null,
  onTimeChange: (value: RangeValue<moment.Moment>) => void,
  onSubmit: (title: string) => void,
  onClose: React.MouseEventHandler<HTMLElement>,
  onCancel: React.MouseEventHandler<HTMLElement>,

}) {
  const [title, setTitle] = useState(props.eventTitle)

  return (
    <Modal
      open={props.visible}
      onOk={() => props.onSubmit(title)}
      onCancel={props.onClose}
      footer={[
        <Button key="back" onClick={props.onCancel}>
          {props.editMode ? 'Delete' : 'Cancel'}
        </Button>,
        <Button key="submit" type="primary" onClick={() => props.onSubmit(title)}>
          {props.editMode ? 'Update Event' : 'Add Event'}
        </Button>,
      ]}
    >
      <AddEvent
        title={title}
        onTitleChange={e => setTitle(e.target.value)}
        start={props.eventStart}
        end={props.eventEnd}
        onTimeChange={props.onTimeChange}
      />
    </Modal>
  );
}
