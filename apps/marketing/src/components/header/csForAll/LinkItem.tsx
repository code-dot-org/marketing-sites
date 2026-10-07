import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import {isExternalLink} from '@/components/common/utils';
import {Brand} from '@/config/brand';

import {LinkItemProps} from './common/types';

const LinkItem = ({
  brand = Brand.CS_FOR_ALL,
  label,
  href = '',
  typography = 'body3',
  isInternal = false,
  ...linkProps
}: LinkItemProps) => {
  const isExternal = !isInternal && isExternalLink(href, brand, 'production');

  return (
    <Typography
      variant={typography}
      component={Link}
      href={href}
      sx={{textDecoration: 'none'}}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...linkProps}
    >
      {label}
    </Typography>
  );
};

export default LinkItem;
