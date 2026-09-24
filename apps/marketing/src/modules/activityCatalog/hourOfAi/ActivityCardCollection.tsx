import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ActivityCard from '@/components/contentful/activityCard';
import {Activity} from '@/modules/activityCatalog/types/Activity';

// Links arrive as stringified entries; see createDatabase.
const parseLink = (value?: string) => (value ? JSON.parse(value) : undefined);

/** The Hour of AI catalog grid: one Activity Card per search result. */
const ActivityCardCollection: React.FC<{activities: Activity[]}> = ({
  activities,
}) => (
  <Grid container spacing={3}>
    {activities.length > 0 ? (
      activities.map(activity => (
        <Grid
          key={activity.tutorialID}
          size={{xs: 12, sm: 12, md: 6, lg: 4, xl: 3}}
        >
          <ActivityCard
            width="100%"
            titleColor="black"
            showTopics={false}
            showAges={false}
            showActivityType={false}
            showLength={false}
            title={activity.title}
            shortDescription={activity.shortDescription}
            organization={activity.organization.map(String)[0]}
            ages={activity.ages.map(String)}
            topics={activity.topic.map(String)}
            activityType={activity.activityType.map(String)}
            length={activity.length.map(String)}
            image={activity.image}
            tutorialLink={parseLink(activity.primaryLinkRef)}
            teacherLink={parseLink(activity.secondaryLinkRef)}
            tutorialId={activity.tutorialID}
          />
        </Grid>
      ))
    ) : (
      <Typography variant="body2">No activities found</Typography>
    )}
  </Grid>
);

export default ActivityCardCollection;
