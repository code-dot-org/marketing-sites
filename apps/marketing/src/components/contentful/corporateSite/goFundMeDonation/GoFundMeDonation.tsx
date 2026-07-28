'use client';

import Box from '@mui/material/Box';
import React, {useEffect} from 'react';

import {
  FORM_CLASSY_ID_PATTERN,
  FORM_DIV_ID_PATTERN,
  GOFUNDME_SDK_SRC,
} from './constants';

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

    if (!shouldRenderForm) {
      return;
    }

    // The SDK is shared by every form on the page; only inject it once.
    if (document.querySelector(`script[src="${GOFUNDME_SDK_SRC}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = GOFUNDME_SDK_SRC;
    script.async = true;
    script.onerror = () =>
      console.warn('GoFundMe Donation: SDK script failed to load.');
    document.head.appendChild(script);
    // Intentionally no cleanup: another form on the page may still need the
    // SDK, and re-appending the script on remount would re-run it.
  }, [isBound, isValid, shouldRenderForm]);

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

  // The GoFundMe SDK finds this div by its id and hydrates the checkout form
  // into it. `classy` is the vendor's attribute name; the spread keeps TS
  // happy about a non-standard attribute.
  return <div id={formDivId} {...{classy: formClassyId}} />;
};

export default GoFundMeDonation;
