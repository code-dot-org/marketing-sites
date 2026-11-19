import {render} from '@testing-library/react';

import {Brand} from '@/config/brand';
import WebSiteJsonLd from '@/config/jsonLd/WebSiteJsonLd';

describe('WebSiteJsonLd', () => {
  const queryScript = () =>
    document.querySelector('script[type="application/ld+json"]');

  it('renders the CodeAI site name for CODE_DOT_ORG', () => {
    render(<WebSiteJsonLd brand={Brand.CODE_DOT_ORG} />);

    expect(JSON.parse(queryScript()?.textContent ?? '')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CodeAI',
      url: 'https://code.org/',
      publisher: {'@id': 'https://code.org/#organization'},
    });
  });

  it('renders the Hour of AI site name for HOUR_OF_AI', () => {
    render(<WebSiteJsonLd brand={Brand.HOUR_OF_AI} />);

    expect(JSON.parse(queryScript()?.textContent ?? '')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Hour of AI',
      url: 'https://hourofai.org/',
    });
  });

  it('renders nothing for CS_FOR_ALL', () => {
    render(<WebSiteJsonLd brand={Brand.CS_FOR_ALL} />);

    expect(queryScript()).not.toBeInTheDocument();
  });
});
