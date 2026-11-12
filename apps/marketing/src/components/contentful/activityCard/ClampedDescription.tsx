'use client';

import MuiLink from '@mui/material/Link';
import {styled} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';

const MAX_LINES = 4;
const WHITE = 'var(--palette-white)';

const Root = styled('div')({
  position: 'relative',
  alignSelf: 'stretch',
  paddingBottom: '12px',
});

const Text = styled('p', {
  shouldForwardProp: prop => prop !== 'clamped',
})<{clamped: boolean}>(({clamped}) => ({
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  margin: 0,
  ...(clamped && {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: MAX_LINES,
    overflow: 'hidden',
  }),
}));

// Covers the end of the last visible line, so showing it causes no shift.
const Overlay = styled('span')({
  position: 'absolute',
  insetInlineEnd: 0,
  bottom: '12px',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  paddingInlineStart: '2em',
  background: `linear-gradient(to right, transparent, ${WHITE} 1.5em)`,
  '[dir="rtl"] &': {
    background: `linear-gradient(to left, transparent, ${WHITE} 1.5em)`,
  },
});

const ToggleButton = styled(MuiLink)({
  fontSize: '0.75rem',
  fontWeight: 400,
  lineHeight: 'inherit',
  verticalAlign: 'baseline',
  marginBottom: 0,
  marginInlineStart: '4px',
}) as typeof MuiLink;

const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});

export interface ClampedDescriptionProps {
  text: string;
  /** Activity title, for the toggle's accessible name */
  title: string;
}

/**
 * Description clamped to four lines. "Read more" appears only when the text
 * overflows at the current width; screen readers get the full text either way.
 */
const ClampedDescription: React.FC<ClampedDescriptionProps> = ({
  text,
  title,
}) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const userToggled = useRef(false);
  const [overflowing, setOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Measured after mount and on resize, since overflow depends on width.
  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  // The toggle moves between the overlay and the text end; keep focus on it.
  useEffect(() => {
    if (userToggled.current) {
      toggleRef.current?.focus();
      userToggled.current = false;
    }
  }, [expanded]);

  const toggle = (
    <ToggleButton
      ref={toggleRef}
      component="button"
      type="button"
      data-hierarchy="color"
      aria-expanded={expanded}
      onClick={() => {
        userToggled.current = true;
        setExpanded(value => !value);
      }}
    >
      <span>{expanded ? 'Read less' : 'Read more'}</span>
      <VisuallyHidden> about {title}</VisuallyHidden>
    </ToggleButton>
  );

  return (
    <Root>
      <Text ref={textRef} clamped={!expanded}>
        {text}
        {expanded && toggle}
      </Text>
      {!expanded && overflowing && (
        <Overlay>
          <span aria-hidden="true">…</span>
          {toggle}
        </Overlay>
      )}
    </Root>
  );
};

export default ClampedDescription;
