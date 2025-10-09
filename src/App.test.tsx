import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

test('renders hello world', () => {
  renderWithRouter(<App />);
  const linkElement = screen.getByText(/Hello World with Vite/i);
  expect(linkElement).toBeInTheDocument();
});

test('counter works correctly', () => {
  renderWithRouter(<App />);

  // Find the increment button
  const incrementButton = screen.getByRole('button', { name: '+' });
  const countDisplay = screen.getByText(/Count is 0/i);

  expect(countDisplay).toBeInTheDocument();

  // Click the increment button
  fireEvent.click(incrementButton);

  // Check that count increased
  expect(screen.getByText(/Count is 1/i)).toBeInTheDocument();
});
