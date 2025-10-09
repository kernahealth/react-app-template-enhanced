import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders the navbar with all links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('React Template')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /About/i })).toBeInTheDocument();
  });

  it('highlights the active link on home page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const usersLink = screen.getByRole('link', { name: /Users/i });

    // Home link should have active styles
    expect(homeLink).toHaveStyle({ color: '#646cff' });
    // Users link should not have active styles
    expect(usersLink).toHaveStyle({ color: '#ffffff' });
  });

  it('highlights the active link on users page', () => {
    render(
      <MemoryRouter initialEntries={['/users']}>
        <Navbar />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const usersLink = screen.getByRole('link', { name: /Users/i });

    // Users link should have active styles
    expect(usersLink).toHaveStyle({ color: '#646cff' });
    // Home link should not have active styles
    expect(homeLink).toHaveStyle({ color: '#ffffff' });
  });

  it('highlights the active link on about page', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Navbar />
      </MemoryRouter>
    );

    const aboutLink = screen.getByRole('link', { name: /About/i });
    const homeLink = screen.getByRole('link', { name: /Home/i });

    // About link should have active styles
    expect(aboutLink).toHaveStyle({ color: '#646cff' });
    // Home link should not have active styles
    expect(homeLink).toHaveStyle({ color: '#ffffff' });
  });
});
