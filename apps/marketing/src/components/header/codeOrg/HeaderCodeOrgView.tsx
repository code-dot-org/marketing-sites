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
  paddingInline: '8px 12px',
  backgroundColor: CODEAI_PURPLE_PRIMARY,
});

const LeftGroup = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  minWidth: 0,
});

const LogoLink = styled('a')({
  display: 'flex',
  alignItems: 'center',
  paddingInline: 12,
  flexShrink: 0,
});

// The desktop menus collapse into the hamburger below the tablet breakpoint.
const DesktopNav = styled('nav')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const tabStyles = {
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 600,
  lineHeight: 1.5,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  minWidth: 0,
  paddingBlock: '5px',
  paddingInline: '12px',
  borderRadius: codeaiRadius('sm', '6px'),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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

// Narrower end padding: the caret's fixed icon slot already carries space.
const SignInButton = styled(Button)({
  ...tabStyles,
  gap: 6,
  paddingInline: '12px 6px',
  backgroundColor: '#121212',
  '&:hover': {
    backgroundColor: '#3a3a3a',
  },
});

const HamburgerButton = styled(IconButton)(({theme}) => ({
  color: 'white',
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
              <img
                src={logoImage.src}
                alt=""
                width={148}
                height={25}
                data-logo-transition-target
                style={{opacity: active ? 0 : undefined}}
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
              <Caret baseClassName="fa-solid" className="fa-angle-right" />
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
