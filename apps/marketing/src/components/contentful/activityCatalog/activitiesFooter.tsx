'use client';

import {Box, Button} from '@mui/material';

import {ActivityType} from '@/modules/activityCatalog/types/Activity';

interface ActivitiesFooterProps {
  activityType: ActivityType;
}

export default function ActivitiesFooter({
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
          href="/activities/hour-of-code"
          variant="contained"
          color="primary"
          sx={{textDecoration: 'none'}}
        >
          Legacy Hour of Code Activities
        </Button>
      ) : (
        <Button
          href="/activities/hour-of-ai"
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
