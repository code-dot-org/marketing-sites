'use client';

import {Box, Button, Stack, Typography} from '@mui/material';

import {ActivityType} from '@/modules/activityCatalog/types/Activity';

interface ActivitiesHeroProps {
  activityType: ActivityType;
}

export default function ActivitiesHero({activityType}: ActivitiesHeroProps) {
  const activityName =
    activityType === ActivityType.HOUR_OF_CODE ? 'Hour of Code' : 'Hour of AI';

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: {xs: 2, md: 4},
        pt: {xs: 4, md: 8},
        pb: {xs: 2, md: 3},
        textAlign: 'center',
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontSize: {xs: 36, md: 50},
          fontWeight: 800,
          letterSpacing: 0.2,
          mb: 1.5,
        }}
      >
        Explore {activityName} Activities
      </Typography>

      <Typography component="p" variant="body2">
        Dive into the {activityName} activities below! As you explore, preview
        each activity to find the ones that best match your learners' needs.
      </Typography>

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{mt: {xs: 3.5, md: 3.5}, flexWrap: 'wrap', rowGap: 3}}
      >
        <Button
          href="/activities/hour-of-ai"
          variant={activityType === 'hour-of-ai' ? 'contained' : 'outlined'}
          color="primary"
          sx={{textDecoration: 'none'}}
        >
          Hour of AI Activities
        </Button>

        <Button
          href="/activities/hour-of-code"
          variant={activityType === 'hour-of-code' ? 'contained' : 'outlined'}
          color="primary"
          sx={{textDecoration: 'none'}}
        >
          Legacy Hour of Code Activities
        </Button>
      </Stack>
    </Box>
  );
}
