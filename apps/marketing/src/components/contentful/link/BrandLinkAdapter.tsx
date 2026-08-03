import React from 'react';

import {LinkProps as DscoLinkProps} from '@code-dot-org/component-library/link';

import Link from './Link';

// DSCO Link → Brand Link. See specs/008-brand-buttons/research.md R12.
const BrandLinkAdapter: React.FC<
  DscoLinkProps & {children?: React.ReactNode}
> = props => {
  const {
    text,
    external,
    openInNewTab,
    children,
    href = '#',
    className,
    target,
    'aria-label': ariaLabel,
  } = props as DscoLinkProps & {
    text?: string;
    children?: React.ReactNode;
    target?: string;
    'aria-label'?: string;
  };

  const isLinkExternal = !!external || !!openInNewTab || target === '_blank';

  return (
    <Link
      href={href}
      isLinkExternal={isLinkExternal}
      ariaLabel={ariaLabel}
      className={typeof className === 'string' ? className : undefined}
      removeMarginBottom={false}
    >
      {children ?? text}
    </Link>
  );
};

export default BrandLinkAdapter;
