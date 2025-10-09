import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders the navbar', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText('React Template')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies correct styling to main element', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test content</div>
        </Layout>
      </BrowserRouter>
    );

    const mainElement = screen.getByText('Test content').parentElement;
    expect(mainElement).toHaveStyle({
      paddingTop: '65px',
    });
  });
});
