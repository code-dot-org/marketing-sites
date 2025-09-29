'use client';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {Chip, MenuItem, Select} from '@mui/material';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import {FacetResult} from '@orama/orama';
import {ChangeEvent, useState} from 'react';

import {FACET_LABELS} from '@/components/contentful/activityCatalog/config/facets';

interface FacetPanelProps {
  isInDrawer?: boolean;
  facets: FacetResult | undefined;
  selectedFacets: Record<string, Set<string>>;
  searchTerm: string | undefined;
  onFacetChange: (facet: string, facetValue: string) => void;
  onSearchTermChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
}
const FacetBar = ({
  isInDrawer,
  facets,
  selectedFacets,
  searchTerm,
  onFacetChange,
  onClearAll,
  onSearchTermChange,
}: FacetPanelProps) => {
  if (!facets) {
    return null;
  }

  const handleChange = (facet: string, facetValue: string) => {
    onFacetChange(facet, facetValue);
  };

  // NEW: track which facet's dropdown is open
  const [openFacet, setOpenFacet] = useState<string | null>(null);

  const getDropdownMenuItem = (
    selectedFacetValues: Set<string>,
    facet: string,
    facetValue: string,
  ) => {
    const isSelected = selectedFacetValues?.has(facetValue);
    return (
      <MenuItem key={facetValue} value={facetValue}>
        <Chip
          key={facetValue}
          label={facetValue}
          onDelete={
            isSelected ? () => handleChange(facet, facetValue) : undefined
          }
          deleteIcon={
            isSelected ? <CloseRoundedIcon fontSize="small" /> : undefined
          }
          variant={isSelected ? 'filled' : 'outlined'}
          color={isSelected ? 'primary' : 'default'}
        />
      </MenuItem>
    );
  };

  const getDropdowns = () => {
    return Object.entries(facets).map(([facet, facetDetails]) => {
      const facetValues = Object.keys(facetDetails.values);
      const hasSelectedValue =
        selectedFacets[facet] && selectedFacets[facet].size > 0;

      return (
        <FormControl
          key={facet}
          sx={{
            minWidth: 0,
            '&:not(:last-of-type)': {mb: 1.25, mr: 2},
          }}
        >
          <Select
            aria-label={FACET_LABELS[facet]}
            multiple
            onChange={e => handleChange(facet, e.target.value[0])}
            value={[]}
            // NEW: control open/close + close on menu mouse leave
            open={openFacet === facet}
            onOpen={() => setOpenFacet(facet)}
            onClose={() => setOpenFacet(null)}
            MenuProps={{
              disablePortal: true,
              disableScrollLock: true,
              anchorOrigin: {vertical: 'bottom', horizontal: 'left'},
              transformOrigin: {vertical: 'top', horizontal: 'left'},
              PaperProps: {
                onMouseLeave: () => setOpenFacet(null),
                sx: {
                  p: {xs: 1, sm: 2},
                  pb: {xs: 1, sm: 2},
                  boxShadow: 2,
                  paddingBottom: 1,
                  backgroundColor: '#E9FAFF',
                  borderRadius: 0.5,
                  boxSizing: 'border-box',
                },
              },
              MenuListProps: {
                dense: true,
                disablePadding: true,
                sx: {p: 0, m: 0},
              },
            }}
            sx={theme => ({
              width: '100px',
              minWidth: 'fit-content',
              '.MuiSelect-select': {
                minWidth: 'fit-content',
                padding: 1.8,
                fontSize: 18,

                backgroundColor: hasSelectedValue
                  ? theme.palette.primary.main
                  : 'inherit',
                color: hasSelectedValue
                  ? theme.palette.common.white
                  : 'inherit',
              },
              '& .MuiSelect-icon': {
                color: hasSelectedValue
                  ? theme.palette.common.white
                  : theme.palette.action.active,
              },
            })}
            displayEmpty
            renderValue={() => <span>{FACET_LABELS[facet]}</span>}
          >
            {facetValues.map(facetValue => {
              return getDropdownMenuItem(
                selectedFacets[facet],
                facet,
                facetValue,
              );
            })}
          </Select>
        </FormControl>
      );
    });
  };

  return (
    <Grid container spacing={2} flexDirection={isInDrawer ? 'column' : 'row'}>
      <Grid size={isInDrawer ? 12 : 2}>
        <Input
          onChange={onSearchTermChange}
          value={searchTerm}
          placeholder={'Search...'}
        />
      </Grid>
      <Grid size={isInDrawer ? 12 : 10}>
        {getDropdowns()}

        {/* NEW: Removed spacing from button */}
        <Button
          onClick={onClearAll}
          sx={{
            borderRadius: 999,
            py: 3,
            mr: {xs: 0, sm: 'auto'},
            ml: {xs: 0, sm: 0},
          }}
        >
          Clear All
        </Button>
      </Grid>
    </Grid>
  );
};

export default FacetBar;
