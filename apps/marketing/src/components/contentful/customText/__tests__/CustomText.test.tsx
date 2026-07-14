import {render, screen} from '@testing-library/react';

import CustomText from '../CustomText';

describe('CustomText component', () => {
  it('renders the type default tag (span) and content', () => {
    render(<CustomText type="custom">Hello</CustomText>);
    const el = screen.getByText('Hello');
    expect(el.tagName).toBe('SPAN');
  });

  it('renders Subtitle as a <p> by default', () => {
    render(<CustomText type="subtitle">Sub</CustomText>);
    expect(screen.getByText('Sub').tagName).toBe('P');
  });

  it('honors an htmlTag override', () => {
    render(
      <CustomText type="custom" htmlTag="p">
        Tagged
      </CustomText>,
    );
    expect(screen.getByText('Tagged').tagName).toBe('P');
  });

  it('renders a single leading icon and the text', () => {
    const {container} = render(
      <CustomText type="custom" iconNameLeft="star">
        Labelled
      </CustomText>,
    );
    expect(screen.getByText('Labelled')).toBeInTheDocument();
    expect(container.querySelectorAll('i, svg').length).toBeGreaterThan(0);
  });

  it('renders only one icon when both sides are provided', () => {
    const {container} = render(
      <CustomText type="custom" iconNameLeft="star" iconNameRight="arrow-right">
        Both
      </CustomText>,
    );
    // FontAwesomeV6Icon renders a single <i> glyph element.
    expect(container.querySelectorAll('i').length).toBe(1);
  });
});
