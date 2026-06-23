'use client';

import {Box, Typography} from '@mui/material';

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
          // Spec 009 — px literals replaced with rem; weight 800 (Extra Bold)
          // is not in the 4-weight ladder, dropped to 700 (Bold). Deprecated
          // component, minimal fix per [[feedback_match_architecture_to_code_lifespan]].
          fontSize: {xs: '2.25rem', md: '3.125rem'},
          fontWeight: 700,
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
    </Box>
  );
}
