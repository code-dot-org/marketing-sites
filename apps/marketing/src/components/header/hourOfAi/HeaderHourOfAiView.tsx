'use client';
import MuiButton from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import {styled} from '@mui/material/styles';
import {KeyboardEvent, useRef, useState} from 'react';

import {Button, LinkButton} from '@code-dot-org/component-library/button';

import {isExternalLink} from '@/components/common/utils';
import {Brand} from '@/config/brand';
import {getStage} from '@/config/stage';
import {brandRadius} from '@/themes/common/radius';
import logoImage from '@public/images/hourofai-logo-horizontal-dark.webp';

import {HeaderContent} from '../codeOrg/types';
import {useAutoCollapse} from '../codeOrg/useAutoCollapse';

import {CALL_TO_ACTION} from './config';

/*
 * Collapse reuses the Code.org header's ghost-row measurement. The compact
 * ghost here drops the main menu (not a secondary menu), so the hook's stages
 * mean: "secondary" = menu in the hamburger, "all" = the call to action too.
 * The media queries below are the SSR/no-JS baseline.
 */
const MENU_BREAKPOINT = 1000; // px
const CTA_BREAKPOINT = 360; // px

const BLACK = 'var(--palette-black)';
const DARK_PURPLE = 'var(--palette-dark-purple)';
const WHITE = 'var(--palette-white)';
// Black (#212121) tint for hover fills; Dark Purple (#1F1976) for dividers.
const HOVER = 'rgba(33, 33, 33, 0.06)';
const DIVIDER = 'rgba(31, 25, 118, 0.15)';

export interface HeaderHourOfAiViewProps {
  content: HeaderContent;
}

const HeaderRoot = styled('header')(({theme}) => ({
  position: 'relative',
  zIndex: theme.zIndex.appBar,
}));

const Bar = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  paddingBlock: 12,
  paddingInline: 32,
  backgroundColor: WHITE,
  // Faint enough to vanish over a colored hero; separates it from white ones.
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
  [theme.breakpoints.down('sm')]: {
    paddingInline: 16,
  },
}));

const LeftGroup = styled('div')({
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
});

const LogoLink = styled('a')({
  display: 'flex',
  flexShrink: 0,
  '&:focus-visible': {
    outline: `2px solid ${DARK_PURPLE}`,
    outlineOffset: '4px',
  },
});

const Logo = styled('img')(({theme}) => ({
  height: 28,
  width: 'auto',
  aspectRatio: `${logoImage.width} / ${logoImage.height}`,
  [theme.breakpoints.down('sm')]: {
    height: 24,
  },
}));

// The extra end margin makes the menu-to-button space 16px (RightGroup's
// 8px gap + 8px); the ghost rows share it so the measurement matches.
const NavRow = styled('nav')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginInlineEnd: 8,
});

const DesktopNav = styled(NavRow)(({theme}) => ({
  [theme.breakpoints.down(MENU_BREAKPOINT)]: {
    display: 'none',
  },
  '[data-collapse="none"] &': {
    display: 'flex',
  },
  '[data-collapse="secondary"] &, [data-collapse="all"] &': {
    display: 'none',
  },
}));

// Same size and weight as the Medium Button beside the menu.
const linkStyles = {
  color: BLACK,
  fontSize: '0.875rem',
  fontWeight: 700,
  lineHeight: '24px',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  minWidth: 0,
  paddingBlock: 8,
  paddingInline: 16,
  borderRadius: brandRadius('sm'),
  '&:hover': {
    backgroundColor: HOVER,
  },
  '&:focus-visible': {
    outline: `2px solid ${BLACK}`,
    outlineOffset: '2px',
  },
} as const;

// Cast restores the polymorphic `component` prop that styled() drops from
// MUI's typings; the ghosts render these as inert spans.
const NavLink = styled(MuiButton)(linkStyles) as typeof MuiButton;

const RightGroup = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
});

const CallToActionSlot = styled('div')(({theme}) => ({
  display: 'flex',
  [theme.breakpoints.down(CTA_BREAKPOINT)]: {
    display: 'none',
  },
  '[data-collapse="none"] &, [data-collapse="secondary"] &': {
    display: 'flex',
  },
  '[data-collapse="all"] &': {
    display: 'none',
  },
}));

const HamburgerButtonBase = styled(IconButton)({
  width: 48,
  height: 48,
  color: BLACK,
  '&:focus-visible': {
    outline: `2px solid ${BLACK}`,
    outlineOffset: '2px',
  },
}) as typeof IconButton;

const HamburgerButton = styled(HamburgerButtonBase)(({theme}) => ({
  [theme.breakpoints.up(MENU_BREAKPOINT)]: {
    display: 'none',
  },
  '[data-collapse="none"] &': {
    display: 'none',
  },
  '[data-collapse="secondary"] &, [data-collapse="all"] &': {
    display: 'inline-flex',
  },
}));

// Three bars that rotate into an X while the menu opens.
const HamburgerLines = styled('span', {
  shouldForwardProp: prop => prop !== 'open',
})<{open: boolean}>(({open}) => ({
  position: 'relative',
  display: 'block',
  width: 24,
  height: 18,
  '& > span': {
    position: 'absolute',
    insetInline: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'currentColor',
    transition: 'transform 200ms ease, opacity 150ms ease, top 200ms ease',
  },
  '& > span:nth-of-type(1)': {
    top: open ? 8 : 0,
    transform: open ? 'rotate(45deg)' : 'none',
  },
  '& > span:nth-of-type(2)': {
    top: 8,
    opacity: open ? 0 : 1,
  },
  '& > span:nth-of-type(3)': {
    top: open ? 8 : 16,
    transform: open ? 'rotate(-45deg)' : 'none',
  },
}));

const MobilePanelPositioner = styled('div')(({theme}) => ({
  position: 'absolute',
  top: '100%',
  insetInline: 0,
  [theme.breakpoints.up(MENU_BREAKPOINT)]: {
    display: 'none',
  },
  '[data-collapse="none"] &': {
    display: 'none',
  },
  '[data-collapse="secondary"] &, [data-collapse="all"] &': {
    display: 'block',
  },
}));

const MobilePanel = styled('nav')(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
  paddingBlock: '8px 24px',
  paddingInline: 16,
  backgroundColor: WHITE,
  borderBlockStart: `1px solid ${DIVIDER}`,
  [theme.breakpoints.down('sm')]: {
    paddingInline: 0,
  },
}));

const MobileLink = styled(MuiButton)({
  ...linkStyles,
  fontSize: '1.125rem',
  lineHeight: '28px',
}) as typeof MuiButton;

// Only needed once the call to action has left the bar.
const MobileCallToAction = styled('div')(({theme}) => ({
  display: 'none',
  paddingInline: 16,
  paddingBlockStart: 8,
  [theme.breakpoints.down(CTA_BREAKPOINT)]: {
    display: 'flex',
  },
  '[data-collapse="none"] &, [data-collapse="secondary"] &': {
    display: 'none',
  },
  '[data-collapse="all"] &': {
    display: 'flex',
  },
}));

// Clips the ghost rows so their natural width can't extend the page's
// scrollable overflow; visibility:hidden keeps them out of paint,
// hit-testing, focus order and the accessibility tree.
const GhostClip = styled('div')({
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  visibility: 'hidden',
  pointerEvents: 'none',
});

const GhostBar = styled(Bar)({
  position: 'absolute',
  insetBlockStart: 0,
  insetInlineStart: 0,
  width: 'max-content',
});

const getExternalLinkProps = (href: string) =>
  isExternalLink(href, Brand.HOUR_OF_AI, getStage())
    ? {target: '_blank', rel: 'noopener noreferrer'}
    : {};

// Matches a Studio Button at Medium, Dark Purple, Primary, including its
// default angle-right icon.
const callToActionProps = {
  text: CALL_TO_ACTION.text,
  color: 'purple',
  type: 'primary',
  size: 'm',
  iconRight: {iconName: 'angle-right', iconStyle: 'solid'},
} as const;

/**
 * Hour of AI header: the logo on the left; a flat main menu and a "Start
 * building" call to action on the right, collapsing into a hamburger panel when the bar runs out of room.
 * Dropdowns aren't supported yet, so an item with a submenu renders as a
 * plain link to its primary target.
 */
const HeaderHourOfAiView = ({content}: HeaderHourOfAiViewProps) => {
  const {collapse, barRef, ghostFullRef, ghostCompactRef} = useAutoCollapse();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const items = [...content.mainMenu, ...content.secondaryMenu];

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
      hamburgerRef.current?.focus();
    }
  };

  const ghostLogo = (
    <LogoLink as="span">
      <Logo src={logoImage.src} alt="" />
    </LogoLink>
  );
  const ghostCallToAction = (
    <Button {...callToActionProps} onClick={() => {}} />
  );

  return (
    <ClickAwayListener onClickAway={() => setIsMenuOpen(false)}>
      <HeaderRoot
        onKeyDown={handleKeyDown}
        data-collapse={collapse ?? undefined}
      >
        <Bar ref={barRef}>
          <LeftGroup>
            <LogoLink href="/" aria-label="Hour of AI home">
              <Logo
                src={logoImage.src}
                width={logoImage.width}
                height={logoImage.height}
                alt=""
              />
            </LogoLink>
          </LeftGroup>

          <RightGroup>
            <DesktopNav aria-label="Main">
              {items.map((item, index) => (
                <NavLink
                  key={`${item.label}-${index}`}
                  href={item.href}
                  disableRipple
                  {...getExternalLinkProps(item.href)}
                >
                  {item.label}
                </NavLink>
              ))}
            </DesktopNav>
            <CallToActionSlot>
              <LinkButton {...callToActionProps} href={CALL_TO_ACTION.href} />
            </CallToActionSlot>
            <HamburgerButton
              ref={hamburgerRef}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              disableRipple
              onClick={() => setIsMenuOpen(current => !current)}
            >
              <HamburgerLines open={isMenuOpen}>
                <span />
                <span />
                <span />
              </HamburgerLines>
            </HamburgerButton>
          </RightGroup>
        </Bar>

        {/* Measuring rows for useAutoCollapse: "full" is everything in the
            bar; "compact" moves the main menu into the hamburger. */}
        <GhostClip aria-hidden="true">
          <GhostBar ref={ghostFullRef}>
            <LeftGroup>{ghostLogo}</LeftGroup>
            <RightGroup>
              <NavRow as="div">
                {items.map((item, index) => (
                  <NavLink
                    key={`${item.label}-${index}`}
                    component="span"
                    disableRipple
                  >
                    {item.label}
                  </NavLink>
                ))}
              </NavRow>
              {ghostCallToAction}
            </RightGroup>
          </GhostBar>
          <GhostBar ref={ghostCompactRef}>
            <LeftGroup>{ghostLogo}</LeftGroup>
            <RightGroup>
              {ghostCallToAction}
              <HamburgerButtonBase component="span" disableRipple>
                <HamburgerLines open={false}>
                  <span />
                  <span />
                  <span />
                </HamburgerLines>
              </HamburgerButtonBase>
            </RightGroup>
          </GhostBar>
        </GhostClip>

        <MobilePanelPositioner>
          <Collapse in={isMenuOpen} timeout={200} unmountOnExit>
            <MobilePanel aria-label="Mobile">
              {items.map((item, index) => (
                <MobileLink
                  key={`${item.label}-${index}`}
                  href={item.href}
                  disableRipple
                  onClick={() => setIsMenuOpen(false)}
                  {...getExternalLinkProps(item.href)}
                >
                  {item.label}
                </MobileLink>
              ))}
              <MobileCallToAction>
                <LinkButton {...callToActionProps} href={CALL_TO_ACTION.href} />
              </MobileCallToAction>
            </MobilePanel>
          </Collapse>
        </MobilePanelPositioner>
      </HeaderRoot>
    </ClickAwayListener>
  );
};

export default HeaderHourOfAiView;
