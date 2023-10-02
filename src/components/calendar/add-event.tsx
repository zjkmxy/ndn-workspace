import React from 'react';
import {Input, DatePicker} from 'antd';
import moment from 'moment';
import styles from './styles.module.css'
import momentGenerateConfig from 'rc-picker/lib/generate/moment';
import {RangeValue} from 'rc-picker/lib/interface';


const {RangePicker} = DatePicker.generatePicker<moment.Moment>(momentGenerateConfig);

export default function AddEvent (props: {
  title: string,
  start: moment.Moment | null,
  end: moment.Moment | null,
  onTitleChange: React.ChangeEventHandler<HTMLInputElement>,
  onTimeChange: (value: RangeValue<moment.Moment>) => void,
}) {
  return (
    <>
      <Input
        type="text"
        placeholder="Add Title"
        value={props.title}
        className={styles['input-styles']}
        size="large"
        autoFocus={true}
        onChange={props.onTitleChange}
      />
      <RangePicker
        style={{width: '100%'}}
        value={[moment (props.start), moment (props.end)]}
        onChange={props.onTimeChange}
        showTime={{
          format: 'HH:mm',
          hourStep: 1,
          minuteStep: 30,
          defaultValue: [moment (props.start), moment (props.end)],
        }}
        format="MMM Do, YYYY hh:mm a"
      />
    </>
  );
}
