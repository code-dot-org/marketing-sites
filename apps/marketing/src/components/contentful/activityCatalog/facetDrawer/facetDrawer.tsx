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
      anchor={'right'}
      slotProps={{
        paper: {
          sx: {
            width: {xs: '80%', sm: 500}, // explicit width
            maxWidth: '90vw', // never full screen on tiny devices
            overflow: 'auto',
            p: 3,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,

            border: 1,
            mt: 1,
          },
        },
      }}
    >
      {/* Added Filter text and Icon to drawer top */}
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0, mb: 2}}>
        <FilterAltOutlinedIcon fontSize="medium" color="primary" aria-hidden />
        <Typography component="h2" variant="h6" sx={{m: 1, fontWeight: 700}}>
          Filters
        </Typography>
      </Box>

      <FacetBar {...props} isInDrawer={true} />
      {/* Added Go Button Rather Than Close */}
      <Button
        onClick={onClose}
        sx={theme => ({
          justifySelf: 'center',
          borderRadius: 999,
          height: 46,
          maxWidth: 20,
          color: '#fff',
          ml: 2,
          backgroundColor: theme.palette.secondary.dark,
          '&:hover': {backgroundColor: theme.palette.primary.main},
          textTransform: 'none',
          fontWeight: 600,
        })}
      >
        Go
      </Button>
    </Drawer>
  );
};

export default FacetDrawer;
