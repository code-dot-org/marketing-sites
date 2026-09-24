'use client';

import {styled} from '@mui/material/styles';
import React from 'react';

import {LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {externalLinkIconProps} from '@/components/common/constants';
import Badge from '@/components/contentful/badge/Badge';
import {
  CardBadgeColor,
  parseCardBadgeColor,
} from '@/components/contentful/badge/constants';
import NextImage from '@/components/nextImage/NextImage';
import {useStatsigLogger} from '@/providers/statsig/client';
import {EVENT} from '@/providers/statsig/statsigConstants';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {hourOfAiColor} from '@/themes/hourofai/colors/palette';
import {HOUR_OF_AI_TEXT_FONT_STACK} from '@/themes/hourofai/typography/fontStack';
import {LinkEntry} from '@/types/contentful/entries/Link';

import {cardWidthCss} from './cardWidth';
import {formatAges} from './formatAges';

const BLACK = 'var(--palette-black)';
const LIGHT_BLUE = 'var(--palette-light-blue)';

export interface ActivityCardProps {
  /** Activity title */
  title?: string;
  /** Short description of the activity */
  shortDescription?: string;
  /** Organization that made the activity */
  organization?: string;
  /** Age values, e.g. ["6-8", "9-12"], shown merged as "Ages 6-12" */
  ages?: string[];
  /** Topic labels, listed with the details */
  topics?: string[];
  /** Activity type values, e.g. ["Lesson plan"] */
  activityType?: string[];
  /** Length values, e.g. ["One hour"] */
  length?: string[];
  /** Image URL or Contentful asset */
  image?: string;
  /** Link entry for the tutorial ("Start") button */
  tutorialLink?: LinkEntry;
  /** Link entry for the teacher resource ("Teacher notes") button */
  teacherLink?: LinkEntry;
  /** Tutorial ID, used as the analytics card id */
  tutorialId?: string;
  showOrganization?: boolean;
  showAges?: boolean;
  showTopics?: boolean;
  showActivityType?: boolean;
  showLength?: boolean;
  showTutorialLink?: boolean;
  showTeacherLink?: boolean;
  /** Organization badge color */
  organizationBadgeColor?: CardBadgeColor;
  /** Title color, a Hour of AI palette value */
  titleColor?: string;
  /** Card width in px or %; empty or invalid is auto */
  width?: string;
  /** Custom classname */
  className?: string;
}

const CardRoot = styled('article', {
  shouldForwardProp: prop => prop !== 'width',
})<{width: string}>(({width}) => ({
  display: 'flex',
  flexDirection: 'column',
  width,
  maxWidth: '100%',
  boxSizing: 'border-box',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${BLACK}`,
  borderRadius: codeaiRadius('md', '1rem'),
  backgroundColor: 'var(--palette-white)',
}));

// Most activity images are 4:3 screenshots.
const ImageArea = styled('div')({
  position: 'relative',
  aspectRatio: '4 / 3',
  backgroundColor: LIGHT_BLUE,
});

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flexGrow: 1,
  padding: '1.5rem',
  fontFamily: HOUR_OF_AI_TEXT_FONT_STACK,
  color: BLACK,
});

const BadgeRow = styled('div')({
  paddingBottom: '12px',
});

const Title = styled('h4', {
  shouldForwardProp: prop => prop !== 'titleColor',
})<{titleColor: string}>(({titleColor}) => ({
  fontFamily: HOUR_OF_AI_TEXT_FONT_STACK,
  fontSize: '1.325rem',
  lineHeight: '1.75rem',
  fontWeight: 600,
  color: hourOfAiColor(titleColor)?.cssVar ?? BLACK,
  margin: 0,
  paddingBottom: '8px',
}));

const Description = styled('p')({
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  margin: 0,
  paddingBottom: '12px',
});

// Pinned to the card bottom so details and buttons line up across a row.
const BottomBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  marginTop: 'auto',
});

const Details = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: '0 0 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const Detail = styled('li')({
  display: 'flex',
  alignItems: 'baseline',
  gap: '6px',
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  fontWeight: 500,
});

const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});

// Full-width buttons, stacked; specific to Activity Cards.
const ButtonRow = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignSelf: 'stretch',
  '& > a': {
    width: '100%',
  },
});

const present = (values?: string[]) => (values ?? []).filter(Boolean);

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  shortDescription,
  organization,
  ages,
  topics,
  activityType,
  length,
  image,
  tutorialLink,
  teacherLink,
  tutorialId,
  showOrganization = true,
  showAges = true,
  showTopics = true,
  showActivityType = true,
  showLength = true,
  showTutorialLink = true,
  showTeacherLink = true,
  organizationBadgeColor = 'blueLight',
  titleColor = 'purpleDark',
  width,
  className,
}) => {
  const {logEvent} = useStatsigLogger();

  // Show placeholder text until a content entry is bound
  if (!title) {
    return (
      <em>
        <strong>🎯 Activity Card placeholder.</strong> Please bind an "Activity"
        content type entry in the Content sidebar.
      </em>
    );
  }

  const imageUrl = getAbsoluteImageUrl(image);
  const {color: badgeFamily, isLight: badgeIsLight} = parseCardBadgeColor(
    organizationBadgeColor,
  );
  const details = [
    showAges && {
      label: 'Audience',
      icon: 'user-group',
      values: present([formatAges(ages) ?? '']),
    },
    showActivityType && {
      label: 'Activity type',
      icon: 'shapes',
      values: present(activityType),
    },
    showLength && {label: 'Length', icon: 'clock', values: present(length)},
    showTopics && {label: 'Topics', icon: 'tag', values: present(topics)},
  ].filter(
    (d): d is {label: string; icon: string; values: string[]} =>
      !!d && d.values.length > 0,
  );

  // Same events and payload as the CSforAll Card, so reporting carries over.
  const buttons = [
    showTutorialLink && {
      link: tutorialLink,
      type: 'primary' as const,
      eventName: EVENT.CARD_PRIMARY_BUTTON_CLICKED,
    },
    showTeacherLink && {
      link: teacherLink,
      type: 'secondary' as const,
      eventName: EVENT.CARD_SECONDARY_BUTTON_CLICKED,
    },
  ].flatMap(b =>
    b && b.link?.fields?.label && b.link.fields.primaryTarget
      ? [{...b, fields: b.link.fields}]
      : [],
  );

  return (
    <CardRoot className={className} width={cardWidthCss(width)}>
      {imageUrl && (
        <ImageArea>
          <NextImage src={imageUrl} alt="" style={{objectFit: 'cover'}} />
        </ImageArea>
      )}
      <Content>
        <Title titleColor={titleColor}>{title}</Title>
        {showOrganization && organization && (
          <BadgeRow>
            <Badge
              text={organization}
              size="small"
              color={badgeFamily}
              // The pick sets the variant; no contrast switching.
              appearance={badgeIsLight ? 'light' : 'dark'}
            />
          </BadgeRow>
        )}
        {shortDescription && <Description>{shortDescription}</Description>}
        {(details.length > 0 || buttons.length > 0) && (
          <BottomBlock>
            {details.length > 0 && (
              <Details>
                {details.map(({label, icon, values}) => (
                  <Detail key={label}>
                    <FontAwesomeV6Icon
                      iconName={icon}
                      iconStyle="solid"
                      style={{fontSize: '12px', width: '14px'}}
                      aria-hidden="true"
                    />
                    <VisuallyHidden>{label}: </VisuallyHidden>
                    {values.join(', ')}
                  </Detail>
                ))}
              </Details>
            )}
            {buttons.length > 0 && (
              <ButtonRow>
                {buttons.map(({fields, type, eventName}) => (
                  <LinkButton
                    key={type}
                    text={fields.label}
                    type={type}
                    color="purple"
                    size="s"
                    href={fields.primaryTarget}
                    target={fields.isThisAnExternalLink ? '_blank' : '_self'}
                    iconRight={
                      fields.isThisAnExternalLink
                        ? externalLinkIconProps
                        : undefined
                    }
                    ariaLabel={fields.ariaLabel || undefined}
                    analyticsCallback={() => {
                      if (tutorialId) {
                        logEvent(eventName, tutorialId, {
                          cardId: tutorialId,
                          cardTitle: title,
                          buttonText: fields.ariaLabel || '',
                          buttonTarget: fields.primaryTarget || '',
                        });
                      }
                    }}
                  />
                ))}
              </ButtonRow>
            )}
          </BottomBlock>
        )}
      </Content>
    </CardRoot>
  );
};

export default ActivityCard;
