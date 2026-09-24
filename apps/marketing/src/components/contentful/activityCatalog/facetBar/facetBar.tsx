'use client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Autocomplete,
  TextField,
} from '@mui/material';
import {FacetResult} from '@orama/orama';
import {ChangeEvent, useState} from 'react';

import {FACET_CONFIG} from '@/components/contentful/activityCatalog/config/facets';
import HourOfAiSearchField from '@/components/contentful/activityCatalog/hourOfAiSearchField';

interface FacetPanelProps {
  isInDrawer?: boolean;
  /** Hour of AI catalog: search as the first item (outside the drawer),
   * theme accordion spacing, facets collapsed unless they have an active
   * filter */
  hourOfAi?: boolean;
  facets: FacetResult | undefined;
  selectedFacets: Record<string, Set<string>>;
  searchTerm: string | undefined;
  onFacetChange: (facet: string, facetValue: string | string[]) => void;
  onSearchTermChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
}
const FacetBar = ({
  facets,
  selectedFacets,
  searchTerm,
  onFacetChange,
  onSearchTermChange,
  isInDrawer = false,
  hourOfAi = false,
}: FacetPanelProps) => {
  // Hour of AI: facets the visitor has opened or closed. The rest follow
  // their active filters, which load from the URL after the first render.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  if (!facets) {
    return null;
  }

  const handleChange = (facet: string, facetValue: string | string[]) => {
    onFacetChange(facet, facetValue);
  };

  const getCheckboxFacets = (facet: string, facetValues: string[]) => {
    return (
      <FormGroup>
        {facetValues.map(facetValue => {
          return (
            <FormControlLabel
              key={facetValue}
              control={
                <Checkbox
                  checked={selectedFacets[facet]?.has(facetValue) || false}
                  onChange={() => handleChange(facet, facetValue)}
                  sx={{color: 'muted.contrastText'}}
                />
              }
              label={<Typography variant="body4">{facetValue}</Typography>}
            />
          );
        })}
      </FormGroup>
    );
  };

  const getDropdownFacets = (facet: string, facetValues: string[]) => {
    return (
      <Autocomplete
        multiple
        options={facetValues}
        value={Array.from(selectedFacets[facet] ?? [])}
        onChange={(_, newValue) => {
          handleChange(facet, newValue);
        }}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            aria-label={FACET_CONFIG[facet]?.label || facet}
            size="small"
          />
        )}
        slotProps={{
          listbox: {
            sx: {
              typography: 'body4',
            },
          },
        }}
      />
    );
  };

  const getFacetComponent = (facet: string, facetValues: string[]) => {
    switch (FACET_CONFIG[facet]?.type) {
      case 'checkbox':
        return getCheckboxFacets(facet, facetValues);
      case 'dropdown':
        return getDropdownFacets(facet, facetValues);
      default:
        return undefined;
    }
  };

  const getDropdowns = () => {
    return Object.entries(facets).map(([facet, facetDetails]) => {
      // Sort using localeCompare with numeric option for mixed strings/numbers
      const facetValues = Object.keys(facetDetails.values).sort((a, b) =>
        a.localeCompare(b, undefined, {numeric: true}),
      );

      const facetConfig = FACET_CONFIG[facet];

      // If there are no facet values, don't render the accordion
      if (facetValues.length === 0) {
        return null;
      }

      return (
        <Accordion
          {...(hourOfAi
            ? {
                expanded:
                  toggled[facet] ?? (selectedFacets[facet]?.size ?? 0) > 0,
                onChange: (_: unknown, isExpanded: boolean) =>
                  setToggled(prev => ({...prev, [facet]: isExpanded})),
              }
            : {defaultExpanded: !facetConfig?.collapsedByDefault})}
          sx={{
            bgcolor: 'card.main',
            color: 'card.contrastText',
            width: '100%',
            ...(hourOfAi && {
              borderColor: 'var(--palette-light-pink)',
              // The same top margin expanded or collapsed; the second
              // selector out-specifies MUI's expanded margin.
              '&:not(:first-of-type), &.Mui-expanded:not(:first-of-type)': {
                marginTop: 'var(--mui-spacing)',
              },
            }),
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{color: 'foreground.main'}} />}
            sx={
              hourOfAi
                ? // The theme's accordion title spacing.
                  {
                    px: 2.5,
                    py: 1.5,
                    '& .MuiTypography-root': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      lineHeight: '148%',
                    },
                  }
                : {padding: 1}
            }
          >
            <Typography variant="subtitle1" sx={{fontWeight: 600}}>
              {facetConfig?.label || facet}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={
              hourOfAi
                ? {borderTopColor: 'var(--palette-light-pink)'}
                : undefined
            }
          >
            {getFacetComponent(facet, facetValues)}
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        // The search field lines up with the top of the column.
        ...(hourOfAi && !isInDrawer && {pt: 0}),
      }}
    >
      {hourOfAi && !isInDrawer && (
        <HourOfAiSearchField value={searchTerm} onChange={onSearchTermChange} />
      )}
      {getDropdowns()}
    </Box>
  );
};

export default FacetBar;
