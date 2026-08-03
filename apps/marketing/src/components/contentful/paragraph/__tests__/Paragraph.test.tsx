import {render, screen} from '@testing-library/react';

import Paragraph from '@/components/contentful/paragraph';

describe('Paragraph Component', () => {
  it('should render out the text', async () => {
    render(
      <Paragraph visualAppearance={'body-two'} isStrong={false}>
        Hello World!
      </Paragraph>,
    );

    expect(screen.getByText('Hello World!')).toBeInTheDocument();
  });

  it('applies italic style when isItalic is true', () => {
    render(
      <Paragraph isItalic removeMarginBottom={false}>
        Italic text
      </Paragraph>,
    );

    expect(screen.getByText('Italic text')).toHaveStyle({fontStyle: 'italic'});
  });

  it('does not apply italic style by default', () => {
    render(<Paragraph removeMarginBottom={false}>Normal text</Paragraph>);

    // Spec 009: Paragraph no longer emits an explicit `font-style: normal`
    // inline style — the variant's default (which is `normal`) flows through.
    expect(screen.getByText('Normal text')).not.toHaveStyle({
      fontStyle: 'italic',
    });
  });

  it('applies inline color for new brand colors', () => {
    render(
      <Paragraph color="purplePrimary" removeMarginBottom={false}>
        Purple text
      </Paragraph>,
    );

    const el = screen.getByText('Purple text');
    expect(el).toHaveStyle({color: 'var(--codeai-purple-primary)'});
    expect(el).not.toHaveClass('paragraph--color-purplePrimary');
  });

  it('applies textTransform when set to a non-none value', () => {
    render(
      <Paragraph textTransform="uppercase" removeMarginBottom={false}>
        Upper text
      </Paragraph>,
    );

    expect(screen.getByText('Upper text')).toHaveStyle({
      textTransform: 'uppercase',
    });
  });

  it('omits textTransform when set to none', () => {
    render(
      <Paragraph textTransform="none" removeMarginBottom={false}>
        Default-case text
      </Paragraph>,
    );

    expect(screen.getByText('Default-case text')).not.toHaveStyle({
      textTransform: 'none',
    });
  });

  it('uses legacy className path for the secondary color', () => {
    render(
      <Paragraph color="secondary" removeMarginBottom={false}>
        Secondary text
      </Paragraph>,
    );

    const el = screen.getByText('Secondary text');
    expect(el).toHaveClass('paragraph--color-secondary');
  });

  it('colorOverride wins over a brand color', () => {
    render(
      <Paragraph
        color="purplePrimary"
        colorOverride="#1F1976"
        removeMarginBottom={false}
      >
        Override over brand
      </Paragraph>,
    );

    expect(screen.getByText('Override over brand')).toHaveStyle({
      color: '#1F1976',
    });
  });

  it('colorOverride wins over a legacy color and drops the legacy className', () => {
    render(
      <Paragraph
        color="secondary"
        colorOverride="#1F1976"
        removeMarginBottom={false}
      >
        Override over legacy
      </Paragraph>,
    );

    const el = screen.getByText('Override over legacy');
    expect(el).toHaveStyle({color: '#1F1976'});
    expect(el).not.toHaveClass('paragraph--color-secondary');
  });

  // Spec 009 US3 — widened visualAppearance enum.
  describe('widened visualAppearance enum (US3)', () => {
    it('text-md and body-two produce visually equivalent output (same MUI variant)', () => {
      render(
        <div>
          <Paragraph visualAppearance="body-two" removeMarginBottom={false}>
            Legacy body-two
          </Paragraph>
          <Paragraph visualAppearance="text-md" removeMarginBottom={false}>
            New text-md
          </Paragraph>
        </div>,
      );
      const legacy = screen.getByText('Legacy body-two');
      const newer = screen.getByText('New text-md');
      expect(legacy.className).toContain('MuiTypography-body2');
      expect(newer.className).toContain('MuiTypography-body2');
    });

    it('text-2xl emits an inline 1.5rem font-size', () => {
      render(
        <Paragraph visualAppearance="text-2xl" removeMarginBottom={false}>
          Big body text
        </Paragraph>,
      );
      expect(screen.getByText('Big body text')).toHaveStyle({
        fontSize: '1.5rem',
        lineHeight: '2rem',
      });
    });

    it('text-4xl emits inline size + line-height + letter-spacing', () => {
      render(
        <Paragraph visualAppearance="text-4xl" removeMarginBottom={false}>
          Giant body text
        </Paragraph>,
      );
      expect(screen.getByText('Giant body text')).toHaveStyle({
        fontSize: '2.25rem',
        lineHeight: '2.75rem',
        letterSpacing: '-0.02em',
      });
    });

    it('text-xs uses the body4 variant (canonical match)', () => {
      render(
        <Paragraph visualAppearance="text-xs" removeMarginBottom={false}>
          Small body text
        </Paragraph>,
      );
      expect(screen.getByText('Small body text').className).toContain(
        'MuiTypography-body4',
      );
    });
  });
});
