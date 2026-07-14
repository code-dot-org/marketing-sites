import Icon from '@mui/material/Icon';
import MuiLink from '@mui/material/Link';
import {styled} from '@mui/material/styles';

import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {CODE_ORG_DISPLAY_FONT_STACK} from '@/themes/code.org/typography/fontStack';
import {SCALE_TEXT, WEIGHTS} from '@/themes/code.org/typography/tokens';

import {HeaderSubmenuColumn, HeaderSubmenuItem} from './types';
import {getExternalLinkProps} from './utils';

export interface SubmenuColumnProps {
  column: HeaderSubmenuColumn;
  /** Called when any link in the column is followed, so the panel closes. */
  onNavigate: () => void;
}

const CODEAI_PURPLE_PRIMARY = 'var(--codeai-purple-primary, #4c42cf)';

// Image columns get more room than text/icon columns, following the design.
const ColumnRoot = styled('div', {
  shouldForwardProp: prop => prop !== 'wide',
})<{wide: boolean}>(({theme, wide}) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  minWidth: 0,
  flex: wide ? '1.6 1 0' : '1 1 0',
}));

// Not a heading element: the panel can appear on any page, so a fixed
// h-level could break axe's heading-order rule.
const ColumnHeading = styled('span')(({theme}) => ({
  fontFamily: CODE_ORG_DISPLAY_FONT_STACK,
  fontWeight: WEIGHTS.medium,
  fontSize: SCALE_TEXT.md.fontSize,
  lineHeight: 1,
  letterSpacing: '-0.02em',
  color: theme.palette.text.primary,
}));

// No list gap: the theme's MuiLink bottom margin spaces the items.
const ItemList = styled('ul', {
  shouldForwardProp: prop => prop !== 'horizontal',
})<{horizontal: boolean}>(({theme, horizontal}) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gridTemplateColumns: horizontal ? 'repeat(2, minmax(0, 1fr))' : 'none',
  columnGap: theme.spacing(2.5),
}));

// `card` stacks the image above the text (Image List Horizontal); the other
// variants lay the visual and text out in a row.
const ItemLink = styled(MuiLink, {
  shouldForwardProp: prop => prop !== 'card',
})<{card: boolean}>(({theme, card}) => ({
  display: 'flex',
  flexDirection: card ? 'column' : 'row',
  alignItems: card ? 'stretch' : 'flex-start',
  gap: theme.spacing(1.5),
  textDecoration: 'none',
  color: theme.palette.text.primary,
  '&:hover .SubmenuItemTitle, &:focus-visible .SubmenuItemTitle': {
    textDecoration: 'underline',
  },
}));

const ItemIcon = styled(Icon)({
  fontSize: '1.25rem',
  marginTop: 2,
  color: 'var(--codeai-purple-mid, #aca8ea)',
  overflow: 'visible',
});

// Image List Vertical rows: thumbnail on the left, text on the right.
const RowImage = styled('img')({
  width: 96,
  height: 64,
  objectFit: 'cover',
  borderRadius: codeaiRadius('md', '10px'),
  flexShrink: 0,
});

// Image List Horizontal cards: full-width image above the text.
const CardImage = styled('img')({
  width: '100%',
  aspectRatio: '296 / 195',
  objectFit: 'cover',
  borderRadius: codeaiRadius('md', '10px'),
});

const TitleRow = styled('span')(({theme}) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ItemTitle = styled('span')({
  fontFamily: CODE_ORG_DISPLAY_FONT_STACK,
  fontWeight: WEIGHTS.medium,
  fontSize: SCALE_TEXT.lg.fontSize,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: CODEAI_PURPLE_PRIMARY,
});

// Card titles keep the shared item-title size but read as CAPS headings.
const CardTitle = styled(ItemTitle)({
  fontWeight: WEIGHTS.bold,
  textTransform: 'uppercase',
});

const Chevron = styled(Icon)({
  fontSize: '0.75rem',
  color: CODEAI_PURPLE_PRIMARY,
  overflow: 'visible',
});

const ItemSubtitle = styled('span')(({theme}) => ({
  ...theme.typography.body4,
  display: 'block',
  color: theme.palette.text.primary,
  marginTop: theme.spacing(0.5),
}));

const SubmenuItemLink = ({
  item,
  columnType,
  onNavigate,
}: {
  item: HeaderSubmenuItem;
  columnType: HeaderSubmenuColumn['type'];
  onNavigate: () => void;
}) => {
  const isCard = columnType === 'Image List Horizontal';
  const Title = isCard ? CardTitle : ItemTitle;

  return (
    <ItemLink
      card={isCard}
      href={item.href}
      onClick={onNavigate}
      {...getExternalLinkProps(item.href)}
    >
      {columnType === 'Icon List' && item.iconName && (
        <ItemIcon baseClassName="fa-solid" className={`fa-${item.iconName}`} />
      )}
      {columnType === 'Image List Vertical' && item.imageUrl && (
        <RowImage src={item.imageUrl} alt="" loading="lazy" />
      )}
      {isCard && item.imageUrl && (
        <CardImage src={item.imageUrl} alt="" loading="lazy" />
      )}
      <span>
        <TitleRow>
          <Title className="SubmenuItemTitle">{item.title}</Title>
          <Chevron baseClassName="fa-solid" className="fa-angle-right" />
        </TitleRow>
        {item.subtitle && <ItemSubtitle>{item.subtitle}</ItemSubtitle>}
      </span>
    </ItemLink>
  );
};

const SubmenuColumn = ({column, onNavigate}: SubmenuColumnProps) => (
  <ColumnRoot
    wide={
      column.type === 'Image List Vertical' ||
      column.type === 'Image List Horizontal'
    }
  >
    {column.heading && <ColumnHeading>{column.heading}</ColumnHeading>}
    <ItemList horizontal={column.type === 'Image List Horizontal'}>
      {column.items.map((item, index) => (
        <li key={`${item.title}-${index}`}>
          <SubmenuItemLink
            item={item}
            columnType={column.type}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ItemList>
  </ColumnRoot>
);

export default SubmenuColumn;
