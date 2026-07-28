'use client';

import Box from '@mui/material/Box';
import React, {useEffect, useRef} from 'react';

import {FORM_CLASSY_ID_PATTERN, FORM_DIV_ID_PATTERN} from './constants';

declare global {
  interface Window {
    // Public API of the GoFundMe embedded checkout SDK, loaded site-wide by
    // providers/gofundme/GoFundMeLoader.
    eg?: {
      init: () => void;
      destroy: () => void;
      isInitialized: () => boolean;
    };
  }
}

const SDK_POLL_INTERVAL_MS = 100;
const SDK_POLL_TIMEOUT_MS = 15000;

/**
 * The SDK scans for form divs only when it initializes, so a div mounted
 * after page load (hydration, soft navigation) needs a destroy/init cycle to
 * be picked up. Polls because the site-wide script is async and may not have
 * loaded yet. Returns a cancel function.
 */
const reinitGoFundMeSdk = (): (() => void) => {
  let elapsed = 0;
  const tryReinit = () => {
    if (!window.eg) {
      return false;
    }
    if (window.eg.isInitialized()) {
      window.eg.destroy();
    }
    window.eg.init();
    return true;
  };

  if (tryReinit()) {
    return () => {};
  }
  const interval = setInterval(() => {
    elapsed += SDK_POLL_INTERVAL_MS;
    if (tryReinit() || elapsed >= SDK_POLL_TIMEOUT_MS) {
      clearInterval(interval);
    }
  }, SDK_POLL_INTERVAL_MS);
  return () => clearInterval(interval);
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

    const cancelReinit = reinitGoFundMeSdk();

    return () => {
      cancelReinit();
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
