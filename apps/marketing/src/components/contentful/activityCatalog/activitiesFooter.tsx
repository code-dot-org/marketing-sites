'use client';

import {Box, Button} from '@mui/material';

import {Brand} from '@/config/brand';
import {getActivityCatalogPath} from '@/modules/activityCatalog/paths';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

interface ActivitiesFooterProps {
  brand: Brand;
  activityType: ActivityType;
}

export default function ActivitiesFooter({
  brand,
  activityType,
}: ActivitiesFooterProps) {
  const isHourOfAI = activityType === ActivityType.HOUR_OF_AI;

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
      {isHourOfAI ? (
        <Button
          href={getActivityCatalogPath(brand, ActivityType.HOUR_OF_CODE)}
          variant="contained"
          color="primary"
          sx={{textDecoration: 'none'}}
        >
          Legacy Hour of Code Activities
        </Button>
      ) : (
        <Button
          href={getActivityCatalogPath(brand, ActivityType.HOUR_OF_AI)}
          variant="contained"
          color="primary"
          sx={{textDecoration: 'none'}}
        >
          Hour of AI Activities
        </Button>
      )}
    </Box>
  );
}
