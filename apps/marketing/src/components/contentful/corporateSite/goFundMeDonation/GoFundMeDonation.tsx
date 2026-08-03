'use client';

import Box from '@mui/material/Box';
import React, {useEffect, useRef} from 'react';

import {
  FORM_CLASSY_ID_PATTERN,
  FORM_DIV_ID_PATTERN,
  GOFUNDME_SDK_SRC,
} from './constants';

declare global {
  interface Window {
    // Public API of the GoFundMe embedded checkout SDK; window.eg is set as
    // soon as the script executes.
    eg?: {
      init: () => void;
      destroy: () => void;
      isInitialized: () => boolean;
    };
  }
}

/**
 * Loads the SDK on demand: only pages using this component pay the cost. The
 * SDK scans for form divs only when it initializes, so when it is already on
 * the page (soft navigation, another form) it needs a destroy/init cycle to
 * pick up a freshly mounted div. Call after the target div is in the DOM.
 */
const ensureGoFundMeSdk = () => {
  if (window.eg) {
    if (window.eg.isInitialized()) {
      window.eg.destroy();
    }
    window.eg.init();
    return;
  }

  // Script tag present but not executed yet (e.g. another form appended it a
  // moment ago): its auto-init will find this div too — nothing to do.
  if (document.querySelector(`script[src="${GOFUNDME_SDK_SRC}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.src = GOFUNDME_SDK_SRC;
  script.async = true;
  script.onerror = () =>
    console.warn('GoFundMe Donation: SDK script failed to load.');
  document.head.appendChild(script);
  // Intentionally never removed: other forms may still need the SDK, and
  // re-running the script on remount would double-initialize it.
};

export interface GoFundMeDonationProps {
  formDivId?: string;
  formClassyId?: string;
  isEditorMode?: boolean;
}

const GoFundMeDonation: React.FC<GoFundMeDonationProps> = ({
  formDivId,
  formClassyId,
  isEditorMode = false,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);

  const isBound = Boolean(formDivId && formClassyId);
  const isValid =
    isBound &&
    FORM_DIV_ID_PATTERN.test(formDivId as string) &&
    FORM_CLASSY_ID_PATTERN.test(formClassyId as string);
  const shouldRenderForm = isValid && !isEditorMode;

  useEffect(() => {
    if (isBound && !isValid) {
      console.warn(
        'GoFundMe Donation: bound form ids failed validation and were ignored.',
      );
      return;
    }

    const host = hostRef.current;
    if (!shouldRenderForm || !host) {
      return;
    }

    // The SDK replaces the target div with its own markup, so React must not
    // own it: create it imperatively inside a React-owned host and keep it
    // out of the server render entirely.
    const target = document.createElement('div');
    target.id = formDivId as string;
    target.setAttribute('classy', formClassyId as string);
    host.appendChild(target);

    ensureGoFundMeSdk();

    return () => {
      host.replaceChildren();
    };
  }, [isBound, isValid, shouldRenderForm, formDivId, formClassyId]);

  // Show placeholder text until a content entry is bound
  if (!isBound) {
    return (
      <em>
        <strong>💝 GoFundMe Donation placeholder.</strong> Please bind the Form
        Div ID and Classy Campaign ID from a "GoFundMe Form" content type entry
        in the Content sidebar.
      </em>
    );
  }

  if (!isValid) {
    return isEditorMode ? (
      <em>
        <strong>💝 GoFundMe Donation:</strong> the bound ids are invalid. Form
        Div ID may only contain letters, numbers, hyphens, and underscores;
        Classy Campaign ID must be numeric.
      </em>
    ) : null;
  }

  // The checkout SDK stays out of the Studio canvas; show a static stand-in.
  if (isEditorMode) {
    return (
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'grey.400',
          padding: 2,
          textAlign: 'center',
        }}
      >
        GoFundMe donation form {formClassyId} renders here on the live site.
      </Box>
    );
  }

  return <div ref={hostRef} />;
};

export default GoFundMeDonation;
