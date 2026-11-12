import Box from '@mui/material/Box';

import Badge, {type BadgeColor} from '@/components/contentful/badge/Badge';

import {CustomText, Paragraph} from '../brandComponents';
import {codeaiVar} from '../codeaiColors';
import FlexColumns from '../layout/FlexColumns';
import {visuallyHidden} from '../visuallyHidden';

export interface ScaleItem {
  key: string;
  label: string;
  /**
   * One CSS background per segment; `null` leaves the segment empty. The
   * badge carries the meaning, so the segments are decorative.
   */
  segments: (string | null)[];
  /** Level name, e.g. "Developing". `null` shows `emptyLabel`. */
  levelLabel: string | null;
  /** Badge color for the level (light appearance). */
  badge: BadgeColor;
}

export interface ScaleGroup {
  label: string;
  items: ScaleItem[];
}

export interface ScaleProps {
  groups: ScaleGroup[];
  emptyLabel: string;
  size?: 'default' | 'print';
}

/** Grouped items, each with a segmented level bar and a level badge. */
export default function Scale({
  groups,
  emptyLabel,
  size = 'default',
}: ScaleProps) {
  const isPrint = size === 'print';

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: isPrint ? 1 : 4}}>
      {groups.map(group => (
        <Box key={group.label} component="section" aria-label={group.label}>
          <CustomText
            type="overline"
            htmlTag="p"
            color="purplePrimary"
            fontSize={isPrint ? 0.625 : undefined}
            removeMarginBottom={isPrint}
          >
            {group.label}
          </CustomText>
          <FlexColumns
            component="ul"
            columns={isPrint ? 4 : {xs: 1, sm: 2, md: 4}}
            columnGap={isPrint ? 1.5 : 4}
            rowGap={isPrint ? 0.75 : 4}
          >
            {group.items.map(item => {
              const level = item.levelLabel ?? emptyLabel;
              return (
                <Box
                  component="li"
                  key={item.key}
                  sx={{display: 'flex', flexDirection: 'column', gap: 1}}
                >
                  <Paragraph
                    visualAppearance={isPrint ? 'text-xs' : 'text-sm'}
                    isStrong
                    removeMarginBottom
                    sx={{
                      minHeight: isPrint ? undefined : '2.5rem',
                      ...(isPrint && {fontSize: '0.625rem', lineHeight: 1.3}),
                    }}
                  >
                    {item.label}
                    <Box component="span" sx={visuallyHidden}>
                      : {level}
                    </Box>
                  </Paragraph>
                  <Box aria-hidden sx={{display: 'flex', gap: '3px'}}>
                    {item.segments.map((fill, i) => (
                      <Box
                        key={i}
                        sx={{
                          flex: 1,
                          height: isPrint ? 6 : 8,
                          borderRadius: '2px',
                          background: fill ?? codeaiVar('gray2'),
                        }}
                      />
                    ))}
                  </Box>
                  <Box aria-hidden sx={{lineHeight: 1}}>
                    <Badge
                      text={level}
                      color={item.badge}
                      size="small"
                      appearance="light"
                    />
                  </Box>
                </Box>
              );
            })}
          </FlexColumns>
        </Box>
      ))}
    </Box>
  );
}
