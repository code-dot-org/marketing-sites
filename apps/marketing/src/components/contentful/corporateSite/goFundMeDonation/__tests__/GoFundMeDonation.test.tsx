import {cleanup, render, screen, waitFor} from '@testing-library/react';

import {GOFUNDME_SDK_SRC} from '../constants';
import GoFundMeDonation from '../GoFundMeDonation';

const VALID_DIV_ID = 'GnpoO1jdMG-VtRU8aHW20';
const VALID_CLASSY_ID = '739526';

const getSdkScripts = () =>
  Array.from(document.head.querySelectorAll('script')).filter(
    script => script.src === GOFUNDME_SDK_SRC,
  );

describe('GoFundMeDonation', () => {
  afterEach(() => {
    cleanup();
    getSdkScripts().forEach(script => script.remove());
    jest.restoreAllMocks();
  });

  it('renders a placeholder when no entry is bound', () => {
    render(<GoFundMeDonation />);
    expect(
      screen.getByText(/GoFundMe Donation placeholder/),
    ).toBeInTheDocument();
    expect(getSdkScripts()).toHaveLength(0);
  });

  it('renders the target div and injects the SDK script into the head', async () => {
    const {container} = render(
      <GoFundMeDonation
        formDivId={VALID_DIV_ID}
        formClassyId={VALID_CLASSY_ID}
      />,
    );

    const div = container.querySelector(`[id="${VALID_DIV_ID}"]`);
    expect(div).toBeInTheDocument();
    expect(div).toHaveAttribute('classy', VALID_CLASSY_ID);

    await waitFor(() => {
      expect(getSdkScripts()).toHaveLength(1);
    });
    expect(getSdkScripts()[0].async).toBe(true);
  });

  it('injects the SDK script only once for multiple forms on a page', async () => {
    render(
      <>
        <GoFundMeDonation
          formDivId={VALID_DIV_ID}
          formClassyId={VALID_CLASSY_ID}
        />
        <GoFundMeDonation formDivId="another-form" formClassyId="123456" />
      </>,
    );

    await waitFor(() => {
      expect(getSdkScripts()).toHaveLength(1);
    });
  });

  it('keeps the SDK script when a form unmounts', async () => {
    const {unmount} = render(
      <GoFundMeDonation
        formDivId={VALID_DIV_ID}
        formClassyId={VALID_CLASSY_ID}
      />,
    );

    await waitFor(() => {
      expect(getSdkScripts()).toHaveLength(1);
    });
    unmount();
    expect(getSdkScripts()).toHaveLength(1);
  });

  it.each([
    ['script tag in div id', '"><script>alert(1)</script>', VALID_CLASSY_ID],
    ['spaces in div id', 'some id', VALID_CLASSY_ID],
    ['quotes in div id', `${VALID_DIV_ID}"`, VALID_CLASSY_ID],
    ['non-numeric classy id', VALID_DIV_ID, '739526; drop'],
  ])(
    'renders nothing and skips the script for invalid ids (%s)',
    async (_label, formDivId, formClassyId) => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const {container} = render(
        <GoFundMeDonation formDivId={formDivId} formClassyId={formClassyId} />,
      );

      expect(container).toBeEmptyDOMElement();
      await waitFor(() => {
        expect(warn).toHaveBeenCalled();
      });
      expect(getSdkScripts()).toHaveLength(0);
    },
  );

  it('renders a static preview without the SDK in editor mode', () => {
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
    expect(getSdkScripts()).toHaveLength(0);
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
