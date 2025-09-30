'use client';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {Box, Typography} from '@mui/material';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import {ComponentProps} from 'react';

import FacetBar from '@/components/contentful/activityCatalog/facetBar/facetBar';

type FacetDrawerProps = ComponentProps<typeof FacetBar> & {
  isOpen: boolean;
  onClose: () => void;
};

const FacetDrawer = ({isOpen, onClose, ...props}: FacetDrawerProps) => {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      anchor="right"
      slotProps={{
        paper: {
          sx: {
            width: {xs: '80%', sm: 500},
            maxWidth: '90vw',
            // key changes:
            height: 'calc(98vh - 8px)', // fallback for older browsers
            '@supports (height: 1dvh)': {
              height: 'calc(98dvh - 8px)', // modern, accounts for dynamic UI chrome
            },

            mt: 1, // keep your original top offset
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', // scrolling handled by inner content
            p: 0, // pad sections individually
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            border: 1,
          },
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0, p: 3, pb: 2}}>
        <FilterAltOutlinedIcon fontSize="medium" color="primary" aria-hidden />
        <Typography component="h2" variant="h6" sx={{m: 1, fontWeight: 700}}>
          Filters
        </Typography>
      </Box>

      {/* NEW: Scrollable middle section */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          px: 2,
          pb: 2,
        }}
      >
        {/* NEW: Made sure all filters are in only one column on xs */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
            },
            columnGap: 2,
            rowGap: 3,
            '& .MuiFormControl-root': {
              width: '100%',
              m: 0,
              pb: 1,
              boxSizing: 'border-box',
              '&:not(:last-of-type)': {mb: 0, mr: 0},
            },
          }}
        >
          <FacetBar {...props} isInDrawer />
        </Box>
      </Box>

      {/* NEW: Made Footer with line to help */}
      <Box
        sx={{
          px: {xs: 1, sm: 3},
          pt: {xs: 0, sm: 1},
          pb: {
            xs: 'calc(6px + env(safe-area-inset-bottom))',
            sm: 'calc(12px + env(safe-area-inset-bottom))',
          },
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            p: 3,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            background:
              'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.85) 60%, rgba(255,255,255,0))',
            pb: 'calc(12px + env(safe-area-inset-bottom))', // added for iOS safe area
          }}
        >
          <Button
            onClick={onClose}
            sx={theme => ({
              justifySelf: 'center',
              borderRadius: 999,
              height: 46,
              maxWidth: 20,
              color: '#fff',
              ml: 0,
              backgroundColor: theme.palette.secondary.dark,
              '&:hover': {backgroundColor: theme.palette.primary.main},
              textTransform: 'none',
              fontWeight: 600,
            })}
          >
            Go
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FacetDrawer;
