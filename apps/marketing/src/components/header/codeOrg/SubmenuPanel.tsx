import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import {styled} from '@mui/material/styles';

import {SECTION_MAX_WIDTH} from '@/themes/code.org/constants';
import {codeaiRadius} from '@/themes/code.org/constants/radius';

import {PROMO_BACKGROUNDS} from './config';
import SubmenuColumn from './SubmenuColumn';
import {HeaderMenuItem, HeaderSubmenu} from './types';
import {getExternalLinkProps} from './utils';

const CODEAI_PURPLE_PRIMARY = 'var(--codeai-purple-primary, #4c42cf)';

export interface SubmenuPanelProps {
  /** id referenced by the trigger tab's aria-controls. */
  id: string;
  item: HeaderMenuItem & {submenu: HeaderSubmenu};
  onClose: () => void;
}

const PanelRoot = styled('div')(({theme}) => ({
  position: 'absolute',
  top: '100%',
  insetInline: 0,
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[3],
}));

const PanelContent = styled('div')(({theme}) => ({
  maxWidth: SECTION_MAX_WIDTH,
  margin: '0 auto',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

const PanelHeader = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

// The hover underline targets the label span only, so it never renders
// under the boxed arrow icon.
const PrimaryLink = styled(MuiLink)(({theme}) => ({
  ...theme.typography.h4,
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  lineHeight: 1,
  marginBottom: 'var(--mui-spacing)',
  textDecoration: 'none',
  color: CODEAI_PURPLE_PRIMARY,
  '&:hover .PrimaryLinkLabel, &:focus-visible .PrimaryLinkLabel': {
    textDecoration: 'underline',
  },
}));

// Rounded-square outline around the primary link arrow: a 2px border drawn
// tight around the 20px glyph (icon-only button tokens for radius/glyph).
const PrimaryLinkArrow = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  boxSizing: 'content-box',
  border: '2px solid currentColor',
  borderRadius: codeaiRadius('sm', '8px'),
});

const PanelSubtitle = styled('p')(({theme}) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.palette.text.primary,
}));

// Flex, not grid: columns carry their own width weight (image columns are
// wider than text/icon columns).
const ColumnsGrid = styled('div')(({theme}) => ({
  display: 'flex',
  gap: theme.spacing(5),
}));

// Full-bleed tinted strip across the panel bottom; the content inside stays
// within the standard section width.
const PromoStrip = styled('div', {
  shouldForwardProp: prop => prop !== 'background',
})<{background: string}>(({background}) => ({
  backgroundColor: background,
}));

const PromoContent = styled('div')(({theme}) => ({
  maxWidth: SECTION_MAX_WIDTH,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 4),
}));

const PromoText = styled('span')(({theme}) => ({
  ...theme.typography.body3,
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const PromoLink = styled(MuiLink)(({theme}) => ({
  ...theme.typography.caption,
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: 0,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  color: theme.palette.text.primary,
  '&:hover, &:focus-visible': {
    textDecoration: 'underline',
  },
}));

const SubmenuPanel = ({id, item, onClose}: SubmenuPanelProps) => {
  const {submenu} = item;

  return (
    <PanelRoot id={id}>
      <PanelContent>
        <PanelHeader>
          <div>
            <PrimaryLink
              href={item.href}
              onClick={onClose}
              {...getExternalLinkProps(item.href)}
            >
              <span className="PrimaryLinkLabel">{item.label}</span>
              <PrimaryLinkArrow>
                <Icon
                  baseClassName="fa-solid"
                  className="fa-arrow-right"
                  sx={{fontSize: '0.75rem', overflow: 'visible'}}
                />
              </PrimaryLinkArrow>
            </PrimaryLink>
            {submenu.subtitle && (
              <PanelSubtitle>{submenu.subtitle}</PanelSubtitle>
            )}
          </div>
          <IconButton
            aria-label={`Close ${item.label} menu`}
            onClick={onClose}
            size="small"
            disableRipple
          >
            <Icon baseClassName="fa-solid" className="fa-xmark" />
          </IconButton>
        </PanelHeader>

        <ColumnsGrid>
          {submenu.columns.map((column, index) => (
            <SubmenuColumn
              key={column.heading ?? index}
              column={column}
              onNavigate={onClose}
            />
          ))}
        </ColumnsGrid>
      </PanelContent>

      {submenu.promo && (
        <PromoStrip background={PROMO_BACKGROUNDS[submenu.promo.background]}>
          <PromoContent>
            <PromoText>
              {submenu.promo.content.iconName && (
                <Icon
                  baseClassName="fa-solid"
                  className={`fa-${submenu.promo.content.iconName}`}
                  fontSize="small"
                />
              )}
              {submenu.promo.content.subtitle}
            </PromoText>
            <PromoLink
              href={submenu.promo.content.href}
              onClick={onClose}
              {...getExternalLinkProps(submenu.promo.content.href)}
            >
              {submenu.promo.content.title}
              <Icon
                baseClassName="fa-solid"
                className="fa-arrow-right"
                fontSize="inherit"
              />
            </PromoLink>
          </PromoContent>
        </PromoStrip>
      )}
    </PanelRoot>
  );
};

export default SubmenuPanel;
