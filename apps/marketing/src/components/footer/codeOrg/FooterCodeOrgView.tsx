'use client';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import NativeSelect from '@mui/material/NativeSelect';
import {styled} from '@mui/material/styles';
import {MouseEvent} from 'react';

import {SUPPORTED_LOCALES_CONFIG} from '@/config/locale';
import {SECTION_MAX_WIDTH} from '@/themes/code.org/constants';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {CODE_ORG_DISPLAY_FONT_STACK} from '@/themes/code.org/typography/fontStack';
import logoImage from '@public/images/codeai-logo-primary.svg';

import {useFooterLocalization} from '../common/utils';

import {SOCIAL_LINKS} from './config';
import {FooterContent} from './types';

export interface FooterCodeOrgViewProps {
  locale: string;
  content: FooterContent;
}

// Links to this path open the OneTrust cookie dialog instead of navigating.
// A convention is used because link data comes from Contentful entries,
// which can't carry click handlers.
const COOKIES_PATH = '/cookies';

const CODEAI_PURPLE_DARK = 'var(--codeai-purple-dark, #1f1976)';
const CODEAI_PURPLE_LIGHT = 'var(--codeai-purple-light, #e4e2f8)';

// Below this width the brand block and the link nav each go full width and
// stack; above it they share one row and the link columns never wrap.
const STACK_BREAKPOINT = 1000;

const FooterRoot = styled('footer')(({theme}) => ({
  backgroundColor: theme.palette.common.white,
}));

const MainSection = styled('div')(({theme}) => ({
  maxWidth: SECTION_MAX_WIDTH,
  margin: '0 auto',
  paddingBlock: theme.spacing(8),
  paddingInline: theme.spacing(4),
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: theme.spacing(6),
  rowGap: theme.spacing(5),
  [theme.breakpoints.down('sm')]: {
    paddingInline: theme.spacing(2),
  },
}));

const BrandBlock = styled('div')(({theme}) => ({
  width: 360,
  flexShrink: 0,
  [theme.breakpoints.down(STACK_BREAKPOINT)]: {
    width: '100%',
  },
}));

const Tagline = styled('p')(({theme}) => ({
  fontFamily: CODE_ORG_DISPLAY_FONT_STACK,
  fontWeight: 500,
  fontSize: '1rem',
  lineHeight: 1,
  letterSpacing: '-0.02em',
  color: theme.palette.text.primary,
  marginBlock: `${theme.spacing(3)} 0`,
}));

const Mission = styled('p')(({theme}) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: '1rem',
  lineHeight: 1.4,
  color: theme.palette.text.primary,
  marginBlock: `${theme.spacing(1)} 0`,
}));

const LinksNav = styled('nav')(({theme}) => ({
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  columnGap: theme.spacing(4),
  rowGap: theme.spacing(6),
  [theme.breakpoints.down(STACK_BREAKPOINT)]: {
    flexBasis: '100%',
    flexWrap: 'wrap',
    columnGap: theme.spacing(6),
  },
}));

// `listCount` keeps every rendered link list the same width: a group with a
// continuation list grows proportionally, and the lists split it evenly.
const LinkColumn = styled('div', {
  shouldForwardProp: prop => prop !== 'listCount',
})<{listCount: number}>(({theme, listCount}) => ({
  flex: `${listCount} 1 0`,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.down(STACK_BREAKPOINT)]: {
    flex: '0 1 auto',
    minWidth: 96,
  },
}));

// Not a heading element: the footer follows arbitrary page content, so any
// fixed h-level can break axe's heading-order rule (e.g. h1 → h3).
const ColumnHeading = styled('span')({
  fontFamily: CODE_ORG_DISPLAY_FONT_STACK,
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 0.9,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
  color: CODEAI_PURPLE_DARK,
  margin: 0,
});

// Continuation lists (heading-less Contentful columns) sit beside the
// heading's first list, tighter than the gap between headed columns.
const LinkListRow = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'flex-start',
  columnGap: theme.spacing(3),
}));

const LinkList = styled('ul')(({theme}) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down(STACK_BREAKPOINT)]: {
    flex: '0 1 auto',
  },
}));

const FooterNavLink = styled(MuiLink)(({theme}) => ({
  fontFamily: theme.typography.fontFamily,
  // The MuiLink theme override sets 700; inherit the surrounding 400 instead.
  fontWeight: 'inherit',
  fontSize: '1rem',
  lineHeight: 1.4,
  color: theme.palette.text.primary,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
  '&:focus-visible': {
    outline: `1px solid ${theme.palette.text.primary}`,
    outlineOffset: '2px',
  },
}));

const BottomBar = styled('div')({
  backgroundColor: CODEAI_PURPLE_DARK,
});

const BottomContent = styled('div')(({theme}) => ({
  maxWidth: SECTION_MAX_WIDTH,
  margin: '0 auto',
  paddingBlock: theme.spacing(3),
  paddingInline: theme.spacing(4),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  columnGap: theme.spacing(3),
  rowGap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    paddingInline: theme.spacing(2),
  },
}));

const CopyrightText = styled('p')(({theme}) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: '0.6875rem',
  lineHeight: 1.4,
  color: CODEAI_PURPLE_LIGHT,
  margin: 0,
  flex: '1 1 320px',
  maxWidth: 500,
}));

const BottomActions = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2.25),
}));

const LanguageSelectWrapper = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const LanguageLabel = styled('label')(({theme}) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: '0.6875rem',
  lineHeight: 1.4,
  color: theme.palette.common.white,
}));

const LanguageSelect = styled(NativeSelect)(({theme}) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: codeaiRadius('md', '5px'),
  fontFamily: theme.typography.fontFamily,
  fontWeight: 700,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  '& .MuiNativeSelect-select': {
    paddingBlock: theme.spacing(1),
    paddingInlineStart: theme.spacing(2),
    paddingInlineEnd: theme.spacing(4),
    borderRadius: codeaiRadius('md', '5px'),
    '&:focus': {
      backgroundColor: 'transparent',
      borderRadius: codeaiRadius('md', '5px'),
    },
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.text.primary,
    right: 'unset',
    insetInlineEnd: theme.spacing(1.5),
  },
}));

const SocialLinks = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2.25),
}));

// The `as typeof IconButton` cast keeps the polymorphic `component`/`href`
// prop typings that styled() otherwise drops.
const SocialIconButton = styled(IconButton)(({theme}) => ({
  color: theme.palette.common.white,
  padding: 0,
  transition: 'opacity 0.2s ease-in-out',
  '& .MuiIcon-root': {
    fontSize: '1.5rem',
    width: 'auto',
  },
  '&:hover': {
    opacity: 0.8,
    backgroundColor: 'transparent',
  },
  '&:focus-visible': {
    outline: `1px solid ${theme.palette.common.white}`,
    outlineOffset: '2px',
  },
})) as typeof IconButton;

const handleCookiesClick = (event: MouseEvent<HTMLAnchorElement>) => {
  if (window?.OneTrust) {
    event.preventDefault();
    // Displays the OneTrust cookie dialog
    window.OneTrust.ToggleInfoDisplay();
  }
};

const FooterCodeOrgView: React.FC<FooterCodeOrgViewProps> = ({
  locale,
  content,
}) => {
  const {handleLanguageChange} = useFooterLocalization();

  return (
    <FooterRoot>
      <MainSection>
        <BrandBlock>
          <img src={logoImage.src} alt="CodeAI" width={173} height={29} />
          <Tagline>{content.tagline}</Tagline>
          <Mission>{content.mission}</Mission>
        </BrandBlock>
        <LinksNav aria-label="Footer">
          {content.linkColumns.map((column, columnIndex) => (
            <LinkColumn
              key={column.heading ?? `column-${columnIndex}`}
              listCount={column.lists.length}
            >
              {column.heading && (
                <ColumnHeading>{column.heading}</ColumnHeading>
              )}
              <LinkListRow>
                {column.lists.map((links, listIndex) => (
                  <LinkList key={listIndex}>
                    {links.map(link => (
                      <li key={`${link.href}-${link.label}`}>
                        <FooterNavLink
                          href={link.href}
                          aria-label={link.ariaLabel}
                          target={link.isExternal ? '_blank' : undefined}
                          rel={
                            link.isExternal ? 'noopener noreferrer' : undefined
                          }
                          onClick={
                            link.href === COOKIES_PATH
                              ? handleCookiesClick
                              : undefined
                          }
                        >
                          {link.label}
                        </FooterNavLink>
                      </li>
                    ))}
                  </LinkList>
                ))}
              </LinkListRow>
            </LinkColumn>
          ))}
        </LinksNav>
      </MainSection>
      <BottomBar>
        <BottomContent>
          <CopyrightText>{content.copyright}</CopyrightText>
          <BottomActions>
            <LanguageSelectWrapper>
              <LanguageLabel htmlFor="footer-language-select">
                Select language
              </LanguageLabel>
              <FormControl variant="standard">
                <LanguageSelect
                  className="notranslate"
                  disableUnderline
                  name="language-select"
                  IconComponent={KeyboardArrowDownIcon}
                  value={locale}
                  inputProps={{id: 'footer-language-select'}}
                  onChange={e => handleLanguageChange(e.target.value)}
                >
                  {SUPPORTED_LOCALES_CONFIG.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.text}
                    </option>
                  ))}
                </LanguageSelect>
              </FormControl>
            </LanguageSelectWrapper>
            <SocialLinks aria-label="Social links">
              {SOCIAL_LINKS.map(({key, label, icon, href}) => (
                <SocialIconButton
                  key={key}
                  aria-label={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  disableRipple
                >
                  {icon}
                </SocialIconButton>
              ))}
            </SocialLinks>
          </BottomActions>
        </BottomContent>
      </BottomBar>
    </FooterRoot>
  );
};

export default FooterCodeOrgView;
