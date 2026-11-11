'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';

import {CODEAI} from '../codeaiColors';

export interface MapTooltip {
  title: string;
  detail: string;
}

export interface UsMapInteractiveProps {
  /** A server-rendered UsMap. */
  children: ReactNode;
  tooltips: Record<string, MapTooltip>;
  /** Called with the hovered or focused region code, or null when none is. */
  onActiveChange?: (code: string | null) => void;
}

const regionCode = (target: EventTarget | null) =>
  target instanceof Element
    ? (target.closest('a[data-code]')?.getAttribute('data-code') ?? null)
    : null;

/**
 * Adds hover and focus behaviour to a server-rendered UsMap by event
 * delegation, so the map's path data never ships in the client bundle.
 */
export default function UsMapInteractive({
  children,
  tooltips,
  onActiveChange,
}: UsMapInteractiveProps) {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [position, setPosition] = useState<{x: number; y: number} | null>(null);

  const activeRef = useRef<string | null>(null);

  const activate = useCallback(
    (code: string | null, point: {x: number; y: number} | null) => {
      if (activeRef.current !== code) {
        activeRef.current = code;
        setActive(code);
        onActiveChange?.(code);
      }
      setPosition(point);
    },
    [onActiveChange],
  );

  const relativePoint = (clientX: number, clientY: number) => {
    const box = container.current?.getBoundingClientRect();
    return box ? {x: clientX - box.left, y: clientY - box.top} : null;
  };

  const onPointerMove = (event: PointerEvent) => {
    const code = regionCode(event.target);
    activate(code, code ? relativePoint(event.clientX, event.clientY) : null);
  };

  const onFocus = (event: FocusEvent) => {
    const code = regionCode(event.target);
    if (!code || !(event.target instanceof Element)) {
      return;
    }
    const box = event.target.getBoundingClientRect();
    activate(
      code,
      relativePoint(box.left + box.width / 2, box.top + box.height / 2),
    );
  };

  const tooltip = active ? tooltips[active] : undefined;

  return (
    <Box
      ref={container}
      onPointerMove={onPointerMove}
      onPointerLeave={() => activate(null, null)}
      onFocus={onFocus}
      onBlur={() => activate(null, null)}
      sx={{
        position: 'relative',
        ...(active && {
          [`& a[data-code="${active}"] .region`]: {
            fill: 'var(--region-hover)',
          },
        }),
      }}
    >
      {children}
      {tooltip && position && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, calc(-100% - 12px))',
            pointerEvents: 'none',
            background: CODEAI.blueDark,
            color: CODEAI.white,
            borderRadius: '6px',
            px: 1.25,
            py: 0.75,
            whiteSpace: 'nowrap',
            boxShadow: 3,
            zIndex: 1,
          }}
        >
          <Typography
            component="p"
            sx={{
              color: 'inherit',
              typography: 'body3',
              fontWeight: 700,
            }}
          >
            {tooltip.title}
          </Typography>
          <Typography
            component="p"
            sx={{color: 'inherit', typography: 'body4'}}
          >
            {tooltip.detail}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
