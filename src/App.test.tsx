import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders hello world', () => {
  render(<App />);
  const linkElement = screen.getByText(/Hello World with Vite/i);
  expect(linkElement).toBeInTheDocument();
});

test('counter works correctly', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /count is 0/i });
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(
    screen.getByRole('button', { name: /count is 1/i })
  ).toBeInTheDocument();
});
