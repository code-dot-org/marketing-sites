import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import CatalogInterstitial from '@/components/contentful/catalogInterstitial';

describe('CatalogInterstitial component', () => {
  it('renders children bare in live mode', () => {
    render(
      <CatalogInterstitial position={2}>
        <div>Banner content</div>
      </CatalogInterstitial>,
    );
    expect(screen.getByText('Banner content')).toBeInTheDocument();
    expect(screen.queryByText(/after section/)).not.toBeInTheDocument();
  });

  it('self-applies the CSS order slotting it after the Nth course', () => {
    const {container, rerender} = render(
      <CatalogInterstitial position={1}>x</CatalogInterstitial>,
    );
    expect(container.firstElementChild).toHaveStyle({order: '15'});

    rerender(<CatalogInterstitial position={3}>x</CatalogInterstitial>);
    expect(container.firstElementChild).toHaveStyle({order: '35'});
  });

  it('defaults the position to 1', () => {
    const {container} = render(<CatalogInterstitial>x</CatalogInterstitial>);
    expect(container.firstElementChild).toHaveStyle({order: '15'});
  });

  it('sanitizes zero, negative, and decimal positions', () => {
    const {container, rerender} = render(
      <CatalogInterstitial position={0}>x</CatalogInterstitial>,
    );
    expect(container.firstElementChild).toHaveStyle({order: '15'});

    rerender(<CatalogInterstitial position={-2}>x</CatalogInterstitial>);
    expect(container.firstElementChild).toHaveStyle({order: '15'});

    rerender(<CatalogInterstitial position={2.4}>x</CatalogInterstitial>);
    expect(container.firstElementChild).toHaveStyle({order: '25'});
  });

  it('shows a position badge and frame in editor mode', () => {
    render(
      <CatalogInterstitial position={2} isEditorMode>
        <div>Banner content</div>
      </CatalogInterstitial>,
    );
    expect(
      screen.getByText('Interstitial — after section 2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Banner content')).toBeInTheDocument();
  });

  it('passes className through', () => {
    const {container} = render(
      <CatalogInterstitial className="custom">x</CatalogInterstitial>,
    );
    expect(container.firstElementChild).toHaveClass('custom');
  });
});
