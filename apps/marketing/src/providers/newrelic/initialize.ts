import {getNewRelicConfig} from '@/providers/newrelic/config';

export async function initializeNewRelic() {
  const {BrowserAgent} = await import(
    '@newrelic/browser-agent/loaders/browser-agent'
  );

  // Populate using values in copy-paste JavaScript snippet.
  const options = {
    init: {
      distributed_tracing: {enabled: true},
      privacy: {cookies_enabled: true},
      ajax: {deny_list: ['bam.nr-data.net']},
    },
    ...getNewRelicConfig(),
  };

  // The agent loader code executes immediately on instantiation.
  new BrowserAgent(options);
}
