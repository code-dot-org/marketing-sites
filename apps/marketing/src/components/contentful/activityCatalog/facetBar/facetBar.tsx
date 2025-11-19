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
import {ChangeEvent} from 'react';

import {FACET_CONFIG} from '@/components/contentful/activityCatalog/config/facets';

interface FacetPanelProps {
  isInDrawer?: boolean;
  facets: FacetResult | undefined;
  selectedFacets: Record<string, Set<string>>;
  searchTerm: string | undefined;
  onFacetChange: (facet: string, facetValue: string | string[]) => void;
  onSearchTermChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
}
const FacetBar = ({facets, selectedFacets, onFacetChange}: FacetPanelProps) => {
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
          paper: {
            sx: {
              width: '300px',
            },
          },
          listbox: {
            sx: {
              typography: 'body3',
              '& .MuiAutocomplete-option': {
                display: 'block',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
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
          defaultExpanded={!facetConfig?.collapsedByDefault}
          sx={{
            bgcolor: 'card.main',
            color: 'card.contrastText',
            width: '100%',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{color: 'foreground.main'}} />}
            sx={{padding: 1}}
          >
            <Typography variant="subtitle1" sx={{fontWeight: 600}}>
              {facetConfig?.label || facet}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
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
      }}
    >
      {getDropdowns()}
    </Box>
  );
};

export default FacetBar;
