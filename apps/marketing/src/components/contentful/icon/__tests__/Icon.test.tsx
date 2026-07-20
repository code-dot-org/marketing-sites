import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import {cssVarForBrandColor} from '@/components/common/colors';
import Icon from '@/components/contentful/icon/Icon';
import {SectionBackgroundProvider} from '@/components/contentful/section/SectionBackgroundContext';

describe('Icon component', () => {
  it('renders the icon with solid family by default', () => {
    render(<Icon iconName="lightbulb" />);
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toBeVisible();
    expect(icon).toHaveClass('fa-solid');
    expect(icon).toHaveClass('fa-lightbulb');
    expect(icon).not.toHaveClass('fa-brands');
  });

  it('applies the brands family for known FA brand icon names', () => {
    render(<Icon iconName="github" />);
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toHaveClass('fa-brands');
    expect(icon).toHaveClass('fa-github');
  });

  it('uses default purplePrimary glyph color when no color is provided', () => {
    render(<Icon iconName="lightbulb" />);
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toHaveStyle({color: cssVarForBrandColor('purplePrimary')});
  });

  it('applies a custom color via the brand-color manifest', () => {
    render(<Icon iconName="lightbulb" color="bluePrimary" />);
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toHaveStyle({color: cssVarForBrandColor('bluePrimary')});
  });

  it('defaults the icon size to 24px', () => {
    render(<Icon iconName="lightbulb" />);
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toHaveStyle({fontSize: '24px'});
  });

  it('applies a custom icon size', () => {
    render(<Icon iconName="lightbulb" iconSize={48} />);
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toHaveStyle({fontSize: '48px'});
  });

  // jsdom's CSS parser silently drops `calc(... var(--x) ...)`, so the margin
  // value isn't observable on the DOM node. Assert the inline-block display it
  // rides on renders by default and is gone when the margin is removed.
  it('renders inline-block (margin carrier) by default, plain span when margin removed', () => {
    const {container: withMargin} = render(<Icon iconName="lightbulb" />);
    expect(withMargin.querySelector('span')).toHaveStyle({
      display: 'inline-block',
    });

    const {container: noMargin} = render(
      <Icon iconName="lightbulb" removeMarginBottom />,
    );
    // display still renders; only the (unobservable) margin differs.
    expect(noMargin.querySelector('span')).toHaveStyle({
      display: 'inline-block',
    });
  });

  it('emits no wrapper when backgroundFill is "none"', () => {
    const {container} = render(<Icon iconName="lightbulb" />);
    // Outermost rendered element is the bare <span>; no MUI Box wrapper.
    expect(container.querySelector('.MuiBox-root')).not.toBeInTheDocument();
  });

  it('renders a filled circle wrapper with the default Gray 1 background', () => {
    const {container} = render(
      <Icon iconName="lightbulb" backgroundFill="filled" />,
    );
    const wrapper = container.querySelector('.MuiBox-root') as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({
      width: `${24 * 1.75}px`,
      height: `${24 * 1.75}px`,
      borderRadius: '50%',
      backgroundColor: cssVarForBrandColor('gray1'),
    });
  });

  it('renders a filled rounded-square wrapper', () => {
    const {container} = render(
      <Icon
        iconName="lightbulb"
        backgroundFill="filled"
        backgroundShape="square"
      />,
    );
    const wrapper = container.querySelector('.MuiBox-root') as HTMLElement;
    expect(wrapper).toHaveStyle({borderRadius: '25%'});
  });

  it('applies a brand backgroundColor when filled', () => {
    const {container} = render(
      <Icon
        iconName="lightbulb"
        backgroundFill="filled"
        backgroundColor="bluePrimary"
      />,
    );
    const wrapper = container.querySelector('.MuiBox-root') as HTMLElement;
    expect(wrapper).toHaveStyle({
      backgroundColor: cssVarForBrandColor('bluePrimary'),
    });
  });

  it('renders an outline wrapper with transparent background and 3px stroke', () => {
    const {container} = render(
      <Icon
        iconName="lightbulb"
        backgroundFill="outline"
        backgroundColor="purplePrimary"
      />,
    );
    const wrapper = container.querySelector('.MuiBox-root') as HTMLElement;
    expect(wrapper).toHaveStyle({
      backgroundColor: 'transparent',
      border: `3px solid ${cssVarForBrandColor('purplePrimary')}`,
    });
  });

  it('outline and filled produce identical outer dimensions for the same iconSize/shape', () => {
    const filled = render(
      <Icon iconName="lightbulb" backgroundFill="filled" iconSize={40} />,
    ).container.querySelector('.MuiBox-root') as HTMLElement;
    const filledSize = {
      width: filled.style.width,
      height: filled.style.height,
      borderRadius: filled.style.borderRadius,
    };

    const outline = render(
      <Icon iconName="lightbulb" backgroundFill="outline" iconSize={40} />,
    ).container.querySelectorAll('.MuiBox-root');
    const outlineEl = outline[outline.length - 1] as HTMLElement;

    expect({
      width: outlineEl.style.width,
      height: outlineEl.style.height,
      borderRadius: outlineEl.style.borderRadius,
    }).toEqual(filledSize);
  });

  it('routes the glyph color through the contrast switch when backgroundFill is "none"', () => {
    render(
      <SectionBackgroundProvider value="purplePrimary">
        <Icon iconName="lightbulb" color="purplePrimary" />
      </SectionBackgroundProvider>,
    );
    const icon = screen.getByTestId('font-awesome-v6-icon');
    // purplePrimary glyph on purplePrimary Section flips to white.
    expect(icon).toHaveStyle({color: cssVarForBrandColor('white')});
  });

  it('skips the contrast switch when backgroundFill is "filled"', () => {
    render(
      <SectionBackgroundProvider value="purplePrimary">
        <Icon
          iconName="lightbulb"
          color="purplePrimary"
          backgroundFill="filled"
        />
      </SectionBackgroundProvider>,
    );
    const icon = screen.getByTestId('font-awesome-v6-icon');
    // Author chose purplePrimary on a filled background — must pass through
    // even though the enclosing Section is purplePrimary.
    expect(icon).toHaveStyle({color: cssVarForBrandColor('purplePrimary')});
  });

  it('routes the glyph color through the contrast switch when backgroundFill is "outline"', () => {
    render(
      <SectionBackgroundProvider value="purplePrimary">
        <Icon
          iconName="lightbulb"
          color="purplePrimary"
          backgroundFill="outline"
        />
      </SectionBackgroundProvider>,
    );
    const icon = screen.getByTestId('font-awesome-v6-icon');
    // An outline is just a ring — the Section background still shows behind
    // the glyph, so purplePrimary on purplePrimary flips to white.
    expect(icon).toHaveStyle({color: cssVarForBrandColor('white')});
  });
});
