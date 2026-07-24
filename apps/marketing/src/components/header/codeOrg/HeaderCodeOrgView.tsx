'use client';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import {styled} from '@mui/material/styles';
import {getCookie} from 'cookies-next/client';
import {KeyboardEvent, useEffect, useRef, useState} from 'react';

import {useLogoTransition} from '@/components/contentful/logoTransitionModal/logoTransitionState';
import {getStage} from '@/config/stage';
import {getStudioUrl} from '@/config/studio';
import {getCookieNameByStage} from '@/cookies/getCookie';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import logoImage from '@public/images/codeai-logo-inverse.svg';

import {HAMBURGER_BREAKPOINT, HEADER_HEIGHT} from './config';
import MobileMenu from './MobileMenu';
import SubmenuPanel from './SubmenuPanel';
import {HeaderContent, HeaderMenuItem, HeaderSubmenu} from './types';
import {getExternalLinkProps} from './utils';

export interface HeaderCodeOrgViewProps {
  content: HeaderContent;
}

const CODEAI_PURPLE_PRIMARY = 'var(--codeai-purple-primary, #4c42cf)';

const HeaderRoot = styled('header')(({theme}) => ({
  position: 'relative',
  zIndex: theme.zIndex.appBar,
}));

const Bar = styled('div')({
  height: HEADER_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  paddingInline: '14px',
  backgroundColor: CODEAI_PURPLE_PRIMARY,
});

const LeftGroup = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  minWidth: 0,
});

// No start padding: the Bar's 14px inline padding alone sets the logo's
// distance from the viewport edge, mirroring studio.code.org.
const LogoLink = styled('a')({
  display: 'flex',
  alignItems: 'center',
  paddingInlineEnd: 12,
  flexShrink: 0,
});

// The desktop menus collapse into the hamburger below the tablet breakpoint.
const DesktopNav = styled('nav')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

// Button box: 20px line box + 6px block padding = 32px tall (the hover/fill
// box). Even height on purpose — it centers in the even 50px bar at integer
// y=9, so edges stay on the pixel grid (an odd height lands on y=x.5 and
// anti-aliases into slivers).
const tabStyles = {
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 600,
  lineHeight: '20px',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  minWidth: 0,
  boxSizing: 'border-box',
  height: '32px',
  paddingBlock: '6px',
  paddingInline: '12px',
  borderRadius: codeaiRadius('sm', '6px'),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Default focus indicators are invisible on the purple bar.
  '&:focus-visible': {
    outline: '2px solid white',
    outlineOffset: '2px',
  },
} as const;

const Tab = styled(Button)(({theme}) => ({
  ...tabStyles,
  gap: theme.spacing(0.75),
  paddingInline: '10px',
}));

const Caret = styled(Icon)({
  fontSize: '0.875rem',
  width: 18,
  textAlign: 'center',
  overflow: 'visible',
});

const RightGroup = styled('nav')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

// The secondary menu is the first to collapse into the hamburger; the main
// menu follows at the md breakpoint.
const SecondaryButton = styled(Button)(({theme}) => ({
  ...tabStyles,
  [theme.breakpoints.down(HAMBURGER_BREAKPOINT)]: {
    display: 'none',
  },
}));

// Follows the studio.code.org sign-in button construction (border + block
// padding + 20px line box) at our 32px height: 1px + 5px + 20px + 5px + 1px.
const SignInButton = styled(Button)({
  ...tabStyles,
  gap: 6,
  border: '1px solid white',
  paddingBlock: '5px',
  color: '#121212',
  backgroundColor: 'white',
  '&:hover': {
    backgroundColor: '#e6e6e6',
  },
});

// Hugs the glyph so the 6px gap and the button's own 12px end padding set the
// spacing; the nav Tabs' caret keeps its fixed slot for dropdown alignment.
const SignInCaret = styled(Caret)({
  width: 'auto',
});

const HamburgerButton = styled(IconButton)(({theme}) => ({
  color: 'white',
  '&:focus-visible': {
    outline: '2px solid white',
    outlineOffset: '2px',
  },
  [theme.breakpoints.up(HAMBURGER_BREAKPOINT)]: {
    display: 'none',
  },
}));

// Three bars that rotate into an X while the menu opens, like the
// studio.code.org hamburger.
const HamburgerLines = styled('span', {
  shouldForwardProp: prop => prop !== 'open',
})<{open: boolean}>(({open}) => ({
  position: 'relative',
  display: 'block',
  width: 18,
  height: 14,
  '& > span': {
    position: 'absolute',
    insetInline: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'currentColor',
    transition: 'transform 200ms ease, opacity 150ms ease, top 200ms ease',
  },
  '& > span:nth-of-type(1)': {
    top: open ? 6 : 0,
    transform: open ? 'rotate(45deg)' : 'none',
  },
  '& > span:nth-of-type(2)': {
    top: 6,
    opacity: open ? 0 : 1,
  },
  '& > span:nth-of-type(3)': {
    top: open ? 6 : 12,
    transform: open ? 'rotate(-45deg)' : 'none',
  },
}));

const hasSubmenu = (
  item: HeaderMenuItem,
): item is HeaderMenuItem & {submenu: HeaderSubmenu} => Boolean(item.submenu);

const panelId = (index: number) => `header-submenu-${index}`;

const HeaderCodeOrgView = ({content}: HeaderCodeOrgViewProps) => {
  const {active} = useLogoTransition();
  // Items are tracked by index, not label: authors can link the same
  // siteHeaderItem entry under multiple tabs.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Cookie is read after mount: SSR always renders the signed-out button,
  // then the client swaps it once the session cookie is visible.
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    setIsSignedIn(!!getCookie(getCookieNameByStage('_shortName', getStage())));
  }, []);
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const closeAll = () => {
    setOpenIndex(null);
    setIsMenuOpen(false);
  };
  const closeAndRefocus = () => {
    if (openIndex !== null) tabRefs.current.get(openIndex)?.focus();
    if (isMenuOpen) hamburgerRef.current?.focus();
    closeAll();
  };

  const openCandidate =
    openIndex !== null ? content.mainMenu[openIndex] : undefined;
  const openItem =
    openCandidate && hasSubmenu(openCandidate) ? openCandidate : undefined;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && (openIndex !== null || isMenuOpen)) {
      closeAndRefocus();
    }
  };

  return (
    <ClickAwayListener onClickAway={closeAll}>
      <HeaderRoot onKeyDown={handleKeyDown}>
        <Bar>
          <LeftGroup>
            <LogoLink href="/" aria-label="CodeAI home">
              {/* The logo transition overlay FLIPs onto this img and expects
                  it hidden while the transition is active. */}
              {/* Sized to match the studio.code.org logo exactly; the SVG's
                  viewBox shares the same 591.15/100 ratio. */}
              <img
                src={logoImage.src}
                alt=""
                width={130}
                height={22}
                data-logo-transition-target
                style={{
                  height: '22px',
                  width: 'auto',
                  aspectRatio: '591.15 / 100',
                  opacity: active ? 0 : undefined,
                }}
              />
            </LogoLink>
            <DesktopNav aria-label="Main">
              {content.mainMenu.map((item, index) =>
                hasSubmenu(item) ? (
                  <Tab
                    key={`${item.label}-${index}`}
                    ref={element => {
                      if (element) tabRefs.current.set(index, element);
                      else tabRefs.current.delete(index);
                    }}
                    aria-expanded={openIndex === index}
                    aria-controls={panelId(index)}
                    aria-haspopup="true"
                    disableRipple
                    onClick={() =>
                      setOpenIndex(current =>
                        current === index ? null : index,
                      )
                    }
                  >
                    {item.label}
                    <Caret
                      baseClassName="fa-solid"
                      className={
                        openIndex === index ? 'fa-angle-up' : 'fa-angle-down'
                      }
                    />
                  </Tab>
                ) : (
                  <Tab
                    key={`${item.label}-${index}`}
                    href={item.href}
                    disableRipple
                    {...getExternalLinkProps(item.href)}
                  >
                    {item.label}
                  </Tab>
                ),
              )}
            </DesktopNav>
          </LeftGroup>

          <RightGroup aria-label="Secondary">
            {content.secondaryMenu.map((item, index) => (
              <SecondaryButton
                key={`${item.label}-${index}`}
                href={item.href}
                disableRipple
                {...getExternalLinkProps(item.href)}
              >
                {item.label}
              </SecondaryButton>
            ))}
            <SignInButton
              href={getStudioUrl(isSignedIn ? '/home' : '/users/sign_in')}
              disableRipple
            >
              {isSignedIn ? 'Go to Dashboard' : 'Sign in'}
              <SignInCaret
                baseClassName="fa-solid"
                className="fa-angle-right"
              />
            </SignInButton>
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

        {openItem && openIndex !== null && (
          <SubmenuPanel
            id={panelId(openIndex)}
            item={openItem}
            onClose={closeAndRefocus}
          />
        )}

        <MobileMenu
          open={isMenuOpen}
          content={content}
          onClose={() => setIsMenuOpen(false)}
        />
      </HeaderRoot>
    </ClickAwayListener>
  );
};

export default HeaderCodeOrgView;
