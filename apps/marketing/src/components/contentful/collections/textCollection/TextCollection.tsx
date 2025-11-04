import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {EntryFields} from 'contentful';
import {useMemo, useId} from 'react';

import {Entry} from '@/types/contentful/Entry';

import {CollectionProps} from '../types';

type ItemFields = {
  shortText: EntryFields.Text;
};

type ItemEntry = Entry<ItemFields>;

export type TextCollectionProps = CollectionProps & {
  /** Collection content w/ fields from Contentful */
  textCollection: ItemEntry[];
};

const styles = {
  container: {
    alignItems: 'flex-start',
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
};

const TextCollection: React.FC<TextCollectionProps> = ({
  textCollection,
  sortOrder,
  className,
}) => {
  if (!textCollection) {
    return (
      <Typography variant="body3" sx={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>📋 Text Collection placeholder.</strong> Please add a "List"
          content type entry in the Content sidebar.
        </em>
      </Typography>
    );
  }

  const textCollectionData = useMemo(() => {
    const data = textCollection.filter(Boolean).map(({fields}) => {
      const {shortText} = fields;

      return {
        id: shortText,
        item: (
          <Box sx={styles.gridItem}>
            {shortText && (
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--text-neutral-primary)',
                  '[data-theme="dark"] &': {
                    color: 'var(--text-neutral-inverse)',
                  },
                }}
              >
                {shortText}
              </Typography>
            )}
          </Box>
        ),
      };
    });

    // Sort alphabetically if sortOrder is 'alphabetical'
    if (sortOrder === 'alphabetical') {
      data.sort((a, b) => a?.id?.localeCompare(b?.id));
    }

    return data;
  }, [textCollection, sortOrder]);

  return (
    <Grid container spacing={7.5} sx={styles.container} className={className}>
      {textCollectionData.map(textCollection => (
        <Grid
          key={`id-${useId().replaceAll(':', '')}`}
          size={{xs: 12, sm: 4, md: 4}}
        >
          {textCollection.item}
        </Grid>
      ))}
    </Grid>
  );
};

export default TextCollection;
