'use client';

import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import {styled} from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import React, {useId, useState} from 'react';

import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {HOUR_OF_AI_TEXT_FONT_STACK} from '@/themes/hourofai/typography/fontStack';

export const MAX_STUDENT_COUNT = 60;

const STUDENT_COUNTS = Array.from({length: MAX_STUDENT_COUNT}, (_, i) => i + 1);

export interface UnpluggedStartDialogProps {
  open: boolean;
  /** Activity title, shown in the prompt */
  activityTitle: string;
  /** Called with the picked count, or undefined when skipped */
  onStart: (studentCount?: number) => void;
  /** Dismisses the dialog without starting */
  onClose: () => void;
}

const Body = styled('div')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '24px',
  fontFamily: HOUR_OF_AI_TEXT_FONT_STACK,
  color: 'var(--palette-black)',
});

const Title = styled('h2')({
  fontFamily: HOUR_OF_AI_TEXT_FONT_STACK,
  fontSize: '1.25rem',
  lineHeight: '1.75rem',
  fontWeight: 600,
  margin: 0,
  // Clears the close button.
  paddingInlineEnd: '32px',
});

const Text = styled('p')({
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  margin: 0,
});

const Actions = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: '8px',
});

/**
 * Asks how many students an unplugged activity is for before it opens,
 * since unplugged starts can't be counted by a tracking pixel.
 */
const UnpluggedStartDialog: React.FC<UnpluggedStartDialogProps> = ({
  open,
  activityTitle,
  onStart,
  onClose,
}) => {
  const titleId = useId();
  const [studentCount, setStudentCount] = useState('');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="xs"
      slotProps={{paper: {sx: {borderRadius: '1rem'}}}}
    >
      <Body>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          size="small"
          sx={{position: 'absolute', top: 16, insetInlineEnd: 16}}
        >
          <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
        </IconButton>
        <Title id={titleId}>How many students will do this activity?</Title>
        <Text>
          <strong>{activityTitle}</strong> is available to use without devices.
          Please share the number of students doing this activity unplugged.
        </Text>
        <TextField
          select
          label="Number of students"
          value={studentCount}
          onChange={e => setStudentCount(e.target.value)}
          size="small"
          fullWidth
          slotProps={{select: {native: true}, inputLabel: {shrink: true}}}
        >
          <option value="" disabled>
            Select a number
          </option>
          {STUDENT_COUNTS.map(count => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </TextField>
        <Actions>
          <Button
            text="Skip to activity"
            type="secondary"
            color="purple"
            size="s"
            onClick={() => onStart()}
          />
          <Button
            text="Start activity"
            type="primary"
            color="purple"
            size="s"
            disabled={!studentCount}
            onClick={() => onStart(Number(studentCount))}
          />
        </Actions>
      </Body>
    </Dialog>
  );
};

export default UnpluggedStartDialog;
