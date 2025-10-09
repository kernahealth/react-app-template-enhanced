import { render, screen } from '@testing-library/react';
import { About } from './About';

describe('About Page', () => {
  it('renders the About page heading', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /About/i })).toBeInTheDocument();
  });

  it('renders the enhanced features list', () => {
    render(<About />);
    expect(screen.getByText(/Enhanced Features:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/React Router DOM for routing/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/TanStack Query for server state management/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/React Hook Form \+ Zod for type-safe form validation/i)
    ).toBeInTheDocument();
  });

  it('renders the project structure section', () => {
    render(<About />);
    expect(screen.getByText(/Project Structure:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Home, Users, Contact, About/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/React Hook Form with Zod validation/i)
    ).toBeInTheDocument();
  });
});
