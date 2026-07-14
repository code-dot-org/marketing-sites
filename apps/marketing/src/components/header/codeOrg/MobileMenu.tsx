import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import {styled} from '@mui/material/styles';
import {Fragment, useState} from 'react';

import {codeaiRadius} from '@/themes/code.org/constants/radius';

import {HAMBURGER_BREAKPOINT, HEADER_HEIGHT} from './config';
import {HeaderContent} from './types';
import {getExternalLinkProps} from './utils';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  content: HeaderContent;
}

// Anchors the dropdown under the bar's end edge; the Collapse inside
// animates the card downward on open, like the studio.code.org menu.
const MenuPositioner = styled('div')(({theme}) => ({
  position: 'absolute',
  top: '100%',
  insetInlineEnd: theme.spacing(1),
  [theme.breakpoints.up(HAMBURGER_BREAKPOINT)]: {
    display: 'none',
  },
}));

// Card sized and styled after the studio.code.org mobile hamburger menu.
// Plain divs throughout — list semantics add nothing to this flat menu.
const MenuCard = styled('nav')(({theme}) => ({
  width: 248,
  maxWidth: 'calc(100vw - 16px)',
  maxHeight: `calc(100vh - ${HEADER_HEIGHT + 16}px)`,
  overflowY: 'auto',
  padding: theme.spacing(0.75),
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: codeaiRadius('sm', '8px'),
  boxShadow:
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}));

// Between the hamburger breakpoint and md, the main menu tabs are still in
// the bar, so the dropdown carries only the secondary menu.
const MainMenuSection = styled('div')(({theme}) => ({
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const menuItemStyles = {
  paddingBlock: 0.5,
  paddingInline: 1.5,
  '& .MuiListItemText-root': {marginBlock: 0},
  '& .MuiListItemText-primary': {fontSize: '0.875rem', fontWeight: 500},
} as const;

// The expanded dropdown's background already sets its items apart; only
// items grouped under a column heading get an indent.
const nestedItemStyles = menuItemStyles;
const columnItemStyles = {...menuItemStyles, paddingInlineStart: 3} as const;

// Non-interactive column heading inside an expanded submenu; visually
// distinct (small, grey) from the tappable links around it.
const NestedHeading = styled('div')(({theme}) => ({
  ...theme.typography.body4,
  color: theme.palette.text.secondary,
  paddingInline: theme.spacing(1.5),
  // Separated from the items above, snug against its own items below.
  paddingBlock: 'var(--mui-spacing) 0',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}));

/**
 * Hamburger dropdown modeled on the studio.code.org mobile menu: the same
 * HeaderContent as the desktop menus, flattened to compact full-width text
 * links (submenu subtitles, images, and promos are desktop-only).
 */
const MobileMenu = ({open, onClose, content}: MobileMenuProps) => {
  // Tracked by index, not label: the same entry can be linked under
  // multiple menu items.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <MenuPositioner>
      <Collapse in={open} timeout={200} unmountOnExit>
        <MenuCard aria-label="Mobile">
          <MainMenuSection>
            {content.mainMenu.map((item, index) =>
              item.submenu ? (
                <Fragment key={`${item.label}-${index}`}>
                  <ListItemButton
                    disableRipple
                    aria-expanded={expandedIndex === index}
                    sx={{
                      ...menuItemStyles,
                      ...(expandedIndex === index && {
                        backgroundColor: 'var(--codeai-gray-1, #f2f2f2)',
                        borderBottom: '1px solid var(--codeai-gray-2, #e4e6e9)',
                      }),
                    }}
                    onClick={() =>
                      setExpandedIndex(current =>
                        current === index ? null : index,
                      )
                    }
                  >
                    <ListItemText primary={item.label} />
                    <Icon
                      baseClassName="fa-solid"
                      className={
                        expandedIndex === index
                          ? 'fa-angle-up'
                          : 'fa-angle-down'
                      }
                      fontSize="small"
                    />
                  </ListItemButton>
                  <Collapse
                    in={expandedIndex === index}
                    timeout="auto"
                    sx={{backgroundColor: 'var(--codeai-gray-1, #f2f2f2)'}}
                  >
                    <ListItemButton
                      disableRipple
                      component="a"
                      href={item.href}
                      sx={nestedItemStyles}
                      onClick={onClose}
                      {...getExternalLinkProps(item.href)}
                    >
                      <ListItemText primary={item.mobileLabel ?? item.label} />
                    </ListItemButton>
                    {/* Image List columns are desktop-only content. */}
                    {item.submenu.columns
                      .filter(column => !column.type.startsWith('Image List'))
                      .map((column, columnIndex) => (
                        <Fragment
                          key={`${column.heading ?? ''}-${columnIndex}`}
                        >
                          {column.heading && (
                            <NestedHeading>{column.heading}</NestedHeading>
                          )}
                          {column.items.map((submenuItem, submenuIndex) => (
                            <ListItemButton
                              disableRipple
                              key={`${submenuItem.title}-${submenuIndex}`}
                              component="a"
                              href={submenuItem.href}
                              sx={
                                column.heading
                                  ? columnItemStyles
                                  : nestedItemStyles
                              }
                              onClick={onClose}
                              {...getExternalLinkProps(submenuItem.href)}
                            >
                              <ListItemText primary={submenuItem.title} />
                            </ListItemButton>
                          ))}
                        </Fragment>
                      ))}
                  </Collapse>
                </Fragment>
              ) : (
                <ListItemButton
                  disableRipple
                  key={`${item.label}-${index}`}
                  component="a"
                  href={item.href}
                  sx={menuItemStyles}
                  onClick={onClose}
                  {...getExternalLinkProps(item.href)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ),
            )}
            {content.secondaryMenu.length > 0 && (
              <Divider sx={{marginBlock: 0.5}} />
            )}
          </MainMenuSection>

          {content.secondaryMenu.map((item, index) => (
            <ListItemButton
              disableRipple
              key={`${item.label}-${index}`}
              component="a"
              href={item.href}
              sx={menuItemStyles}
              onClick={onClose}
              {...getExternalLinkProps(item.href)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </MenuCard>
      </Collapse>
    </MenuPositioner>
  );
};

export default MobileMenu;
