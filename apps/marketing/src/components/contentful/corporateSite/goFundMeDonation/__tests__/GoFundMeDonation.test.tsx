import {cleanup, render, screen, waitFor} from '@testing-library/react';

import GoFundMeDonation from '../GoFundMeDonation';

const VALID_DIV_ID = 'GnpoO1jdMG-VtRU8aHW20';
const VALID_CLASSY_ID = '739526';

const mockSdk = () => {
  const sdk = {
    init: jest.fn(),
    destroy: jest.fn(),
    isInitialized: jest.fn(() => true),
  };
  window.eg = sdk;
  return sdk;
};

describe('GoFundMeDonation', () => {
  afterEach(() => {
    cleanup();
    delete window.eg;
    jest.restoreAllMocks();
  });

  it('renders a placeholder when no entry is bound', () => {
    render(<GoFundMeDonation />);
    expect(
      screen.getByText(/GoFundMe Donation placeholder/),
    ).toBeInTheDocument();
  });

  it('mounts the target div inside the host and reinitializes the SDK', async () => {
    const sdk = mockSdk();
    const {container} = render(
      <GoFundMeDonation
        formDivId={VALID_DIV_ID}
        formClassyId={VALID_CLASSY_ID}
      />,
    );

    await waitFor(() => {
      const target = container.querySelector(`[id="${VALID_DIV_ID}"]`);
      expect(target).toBeInTheDocument();
      expect(target).toHaveAttribute('classy', VALID_CLASSY_ID);
    });
    expect(sdk.destroy).toHaveBeenCalled();
    expect(sdk.init).toHaveBeenCalled();
  });

  it('initializes without destroying when the SDK has not initialized yet', async () => {
    const sdk = mockSdk();
    sdk.isInitialized.mockReturnValue(false);
    render(
      <GoFundMeDonation
        formDivId={VALID_DIV_ID}
        formClassyId={VALID_CLASSY_ID}
      />,
    );

    await waitFor(() => {
      expect(sdk.init).toHaveBeenCalled();
    });
    expect(sdk.destroy).not.toHaveBeenCalled();
  });

  it('picks up the SDK when the script loads after mount', async () => {
    jest.useFakeTimers();
    const {container} = render(
      <GoFundMeDonation
        formDivId={VALID_DIV_ID}
        formClassyId={VALID_CLASSY_ID}
      />,
    );
    expect(container.querySelector(`[id="${VALID_DIV_ID}"]`)).toBeTruthy();

    const sdk = mockSdk();
    jest.advanceTimersByTime(300);
    expect(sdk.init).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('removes the target div on unmount', async () => {
    mockSdk();
    const {container, unmount} = render(
      <GoFundMeDonation
        formDivId={VALID_DIV_ID}
        formClassyId={VALID_CLASSY_ID}
      />,
    );
    await waitFor(() => {
      expect(container.querySelector(`[id="${VALID_DIV_ID}"]`)).toBeTruthy();
    });
    unmount();
    expect(document.getElementById(VALID_DIV_ID)).toBeNull();
  });

  it.each([
    ['script tag in div id', '"><script>alert(1)</script>', VALID_CLASSY_ID],
    ['spaces in div id', 'some id', VALID_CLASSY_ID],
    ['quotes in div id', `${VALID_DIV_ID}"`, VALID_CLASSY_ID],
    ['non-numeric classy id', VALID_DIV_ID, '739526; drop'],
  ])(
    'renders nothing and skips SDK init for invalid ids (%s)',
    async (_label, formDivId, formClassyId) => {
      const sdk = mockSdk();
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const {container} = render(
        <GoFundMeDonation formDivId={formDivId} formClassyId={formClassyId} />,
      );

      expect(container).toBeEmptyDOMElement();
      await waitFor(() => {
        expect(warn).toHaveBeenCalled();
      });
      expect(sdk.init).not.toHaveBeenCalled();
    },
  );

  it('renders a static preview without touching the SDK in editor mode', () => {
    const sdk = mockSdk();
    render(
      <GoFundMeDonation
        formDivId={VALID_DIV_ID}
        formClassyId={VALID_CLASSY_ID}
        isEditorMode
      />,
    );

    expect(
      screen.getByText(/renders here on the live site/),
    ).toBeInTheDocument();
    expect(sdk.init).not.toHaveBeenCalled();
  });

  it('explains invalid ids in editor mode instead of rendering nothing', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <GoFundMeDonation
        formDivId="bad id"
        formClassyId={VALID_CLASSY_ID}
        isEditorMode
      />,
    );

    expect(screen.getByText(/the bound ids are invalid/)).toBeInTheDocument();
  });
});
