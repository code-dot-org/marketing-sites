import {render, screen} from '@testing-library/react';

import {stateGapMapData} from '../data';
import StateGapMapPanel from '../StateGapMapPanel';

const california = stateGapMapData.states.find(state => state.code === 'CA');

describe('StateGapMapPanel', () => {
  it('renders the default instructional state', () => {
    render(<StateGapMapPanel dataset={stateGapMapData} mode="default" />);

    expect(screen.getByText('Select a state')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Hover a state to preview its metrics. Click or tap a state to download the state report and presentation deck.',
      ),
    ).toBeInTheDocument();
  });

  it('shows a neutral unavailable state when metrics are marked unavailable', () => {
    const dataset = {
      ...stateGapMapData,
      states: stateGapMapData.states.map(state =>
        state.code === 'CA'
          ? {
              ...state,
              accessPercent: 0,
              participationPercent: 0,
              dataStatus: 'unavailable',
            }
          : state,
      ),
    };
    const unavailableCalifornia = dataset.states.find(
      state => state.code === 'CA',
    );

    render(
      <StateGapMapPanel
        dataset={dataset}
        mode="preview"
        stateRecord={unavailableCalifornia}
      />,
    );

    expect(screen.getByText('California')).toBeInTheDocument();
    expect(screen.getByText('Data unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Data unavailable for this state in the current dataset.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Access')).not.toBeInTheDocument();
  });

  it('shows hover-preview action guidance when the state is not locked', () => {
    render(
      <StateGapMapPanel
        dataset={stateGapMapData}
        mode="preview"
        stateRecord={california}
      />,
    );

    expect(
      screen.getByText('Click or tap this state to view reports.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: 'Download State Report'}),
    ).not.toBeInTheDocument();
  });

  it('shows download buttons only for valid locked links', () => {
    const dataset = {
      ...stateGapMapData,
      states: stateGapMapData.states.map(state =>
        state.code === 'CA'
          ? {
              ...state,
              reportUrl: 'https://example.com/california-report.pdf',
              presentationUrl: 'https://example.com/california-deck.pdf',
            }
          : state,
      ),
    };
    const linkedCalifornia = dataset.states.find(state => state.code === 'CA');

    render(
      <StateGapMapPanel
        dataset={dataset}
        mode="locked"
        stateRecord={linkedCalifornia}
        onClose={() => {}}
      />,
    );

    expect(
      screen.getByRole('link', {name: 'Download State Report'}),
    ).toHaveAttribute('href', 'https://example.com/california-report.pdf');
    expect(
      screen.getByRole('link', {name: 'Download Presentation Deck'}),
    ).toHaveAttribute('href', 'https://example.com/california-deck.pdf');
  });
});
