'use client';

import {Box, Button} from '@mui/material';

import {
  HOUR_OF_AI_CATALOG_PATH,
  HOUR_OF_CODE_CATALOG_PATH,
} from '@/modules/activityCatalog/hourOfAi/paths';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

/** Sends the reader to the other catalog. */
export default function CatalogCrossLink({
  activityType,
}: {
  activityType: ActivityType;
}) {
  const toHourOfCode = activityType === ActivityType.HOUR_OF_AI;

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: {xs: 2, md: 4},
        py: {xs: 4, md: 6},
        textAlign: 'center',
      }}
    >
      <Button
        href={
          toHourOfCode ? HOUR_OF_CODE_CATALOG_PATH : HOUR_OF_AI_CATALOG_PATH
        }
        variant="contained"
        color="primary"
        sx={{textDecoration: 'none'}}
      >
        {toHourOfCode
          ? 'Legacy Hour of Code Activities'
          : 'Hour of AI Activities'}
      </Button>
    </Box>
  );
}
