'use client';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FormControl from '@mui/material/FormControl';
import MuiLink from '@mui/material/Link';
import NativeSelect from '@mui/material/NativeSelect';
import {styled} from '@mui/material/styles';
import {MouseEvent} from 'react';

import {SUPPORTED_LOCALES_CONFIG} from '@/config/locale';
import {brandRadius} from '@/themes/common/radius';
import {SECTION_MAX_WIDTH} from '@/themes/hourofai/constants/layout';
import logoImage from '@public/images/hourofai-logo-stacked-light.webp';
import awsLogo from '@public/images/powered-by-aws.webp';

import {FooterContent} from '../codeOrg/types';
import {useFooterLocalization} from '../common/utils';

export interface FooterHourOfAiViewProps {
  locale: string;
  content: FooterContent;
}

// Links to this path open the OneTrust cookie dialog instead of navigating
// (same convention as the Code.org footer).
const COOKIES_PATH = '/cookies';

const BLACK = 'var(--palette-black)';
const WHITE = 'var(--palette-white)';
const DIVIDER = 'rgba(255, 255, 255, 0.2)';

const FooterRoot = styled('footer')({
  backgroundColor: BLACK,
  color: WHITE,
});

const Content = styled('div')(({theme}) => ({
  maxWidth: SECTION_MAX_WIDTH,
  marginInline: 'auto',
  paddingBlock: 40,
  paddingInline: 32,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 32,
  [theme.breakpoints.down('sm')]: {
    paddingInline: 16,
  },
}));

// The link rows center vertically on the logo.
const Start = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: 40,
  rowGap: 24,
  minWidth: 0,
});

const LogoLink = styled('a')({
  display: 'flex',
  flexShrink: 0,
  '&:focus-visible': {
    outline: `2px solid ${WHITE}`,
    outlineOffset: '4px',
  },
});

const Logo = styled('img')({
  height: 75,
  width: 'auto',
  aspectRatio: `${logoImage.width} / ${logoImage.height}`,
});

const LinkRows = styled('nav')({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

// Each Contentful column is one row; a divider follows every link but the
// last, like the csforall.org footer.
const LinkRow = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexWrap: 'wrap',
  rowGap: 8,
  columnGap: 16,
  '& > li': {
    paddingInlineEnd: 16,
    borderInlineEnd: `1px solid ${DIVIDER}`,
  },
  '& > li:last-of-type': {
    paddingInlineEnd: 0,
    borderInlineEnd: 'none',
  },
});

const FooterLink = styled(MuiLink)(({theme}) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: 400,
  fontSize: '0.875rem',
  lineHeight: '20px',
  color: WHITE,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
  '&:focus-visible': {
    outline: `2px solid ${WHITE}`,
    outlineOffset: '2px',
  },
}));

// Stays on the right edge when it wraps under the links; phones stack
// everything at the start.
const End = styled('div')(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 16,
  marginInlineStart: 'auto',
  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    marginInlineStart: 0,
  },
}));

const LanguageSelect = styled(NativeSelect)(({theme}) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: '0.875rem',
  color: WHITE,
  border: `1px solid ${WHITE}`,
  borderRadius: brandRadius('sm'),
  '& .MuiNativeSelect-select': {
    paddingBlock: 4,
    paddingInlineStart: 12,
    paddingInlineEnd: 32,
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
  // Native option lists paint on the OS default (light) surface.
  '& option': {
    color: theme.palette.text.primary,
  },
  '& .MuiSvgIcon-root': {
    color: WHITE,
    right: 'unset',
    insetInlineEnd: 8,
  },
  '&.Mui-focused': {
    outline: `2px solid ${WHITE}`,
    outlineOffset: '2px',
  },
}));

const AwsLogoLink = styled('a')({
  display: 'flex',
  flexShrink: 0,
  '&:focus-visible': {
    outline: `2px solid ${WHITE}`,
    outlineOffset: '2px',
  },
});

// Ends the last link row; styled like the links but not one.
const Copyright = styled('span')(({theme}) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: '0.875rem',
  lineHeight: '20px',
  color: WHITE,
}));

const handleCookiesClick = (event: MouseEvent<HTMLAnchorElement>) => {
  if (window?.OneTrust) {
    event.preventDefault();
    window.OneTrust.ToggleInfoDisplay();
  }
};

/**
 * Hour of AI footer: one black band with the logo, one row of links per
 * Contentful column (column headings aren't shown) ending with the copyright,
 * and the language picker over the Powered by AWS credit at the end.
 */
const FooterHourOfAiView = ({locale, content}: FooterHourOfAiViewProps) => {
  const {handleLanguageChange} = useFooterLocalization();
  // An empty row still carries the copyright when there are no links.
  const linkRows = content.linkColumns.flatMap(column => column.lists);
  const rows = linkRows.length ? linkRows : [[]];

  return (
    <FooterRoot>
      <Content>
        <Start>
          <LogoLink href="/" aria-label="Hour of AI home">
            <Logo
              src={logoImage.src}
              width={logoImage.width}
              height={logoImage.height}
              alt=""
            />
          </LogoLink>
          <LinkRows aria-label="Footer">
            {rows.map((links, rowIndex) => (
              <LinkRow key={rowIndex}>
                {links.map(link => (
                  <li key={`${link.href}-${link.label}`}>
                    <FooterLink
                      href={link.href}
                      aria-label={link.ariaLabel}
                      target={link.isExternal ? '_blank' : undefined}
                      rel={link.isExternal ? 'noopener noreferrer' : undefined}
                      onClick={
                        link.href === COOKIES_PATH
                          ? handleCookiesClick
                          : undefined
                      }
                    >
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
                {rowIndex === rows.length - 1 && (
                  <li>
                    <Copyright>{content.copyright}</Copyright>
                  </li>
                )}
              </LinkRow>
            ))}
          </LinkRows>
        </Start>
        <End>
          <FormControl variant="standard">
            <LanguageSelect
              className="notranslate"
              disableUnderline
              name="language-select"
              IconComponent={KeyboardArrowDownIcon}
              value={locale}
              inputProps={{
                id: 'footer-language-select',
                'aria-label': 'Select language',
              }}
              onChange={e => handleLanguageChange(e.target.value)}
            >
              {SUPPORTED_LOCALES_CONFIG.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.text}
                </option>
              ))}
            </LanguageSelect>
          </FormControl>
          {/* Same credit and link as the Code.org footer. */}
          <AwsLogoLink
            href="https://aws.amazon.com/what-is-cloud-computing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={awsLogo.src}
              alt="Powered by AWS Cloud Computing"
              width={130}
              height={23}
              style={{width: '130px', height: 'auto'}}
            />
          </AwsLogoLink>
        </End>
      </Content>
    </FooterRoot>
  );
};

export default FooterHourOfAiView;
