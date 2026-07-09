'use client';

import {styled} from '@mui/material/styles';
import React from 'react';

import {CODE_ORG_TEXT_FONT_STACK} from '@/themes/code.org/typography/fontStack';

export interface CatalogInterstitialProps {
  /** Appears after this many visible course sections in the Course Catalog */
  position?: number;
  /** Injected by Contentful Studio via enableEditorProperties */
  isEditorMode?: boolean;
  /** Custom classname */
  className?: string;
  /** Content built in Contentful Studio */
  children?: React.ReactNode;
}

const Wrapper = styled('div')({
  width: '100%',
});

const EditorFrame = styled('div')({
  outline: '2px dashed var(--codeai-gray-4, #a0a7ae)',
  outlineOffset: '4px',
});

const EditorBadge = styled('div')({
  display: 'inline-block',
  marginBottom: '8px',
  padding: '2px 8px',
  borderRadius: '4px',
  backgroundColor: 'var(--codeai-gray-1, #f2f2f2)',
  color: 'var(--codeai-gray-6, #5f6872)',
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  fontWeight: 600,
});

/**
 * Wraps arbitrary Studio content dropped inside a Course Catalog. Placement
 * relies on the catalog's flex-column container: the wrapper self-applies a
 * CSS order slotting it after the Nth visible course section (courses use
 * order (i+1)*10, interstitials position*10+5).
 */
const CatalogInterstitial: React.FC<CatalogInterstitialProps> = ({
  position = 1,
  isEditorMode,
  className,
  children,
}) => {
  const safePosition = Math.max(1, Math.round(position ?? 1));

  return (
    <Wrapper className={className} style={{order: safePosition * 10 + 5}}>
      {isEditorMode ? (
        <EditorFrame>
          <EditorBadge>Interstitial — after section {safePosition}</EditorBadge>
          {children}
        </EditorFrame>
      ) : (
        children
      )}
    </Wrapper>
  );
};

export default CatalogInterstitial;
