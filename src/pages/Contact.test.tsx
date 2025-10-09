import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Contact from './Contact';

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderContact = () => {
  return render(
    <BrowserRouter>
      <Contact />
    </BrowserRouter>
  );
};

describe('Contact Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the contact form with all fields', () => {
      renderContact();

      expect(
        screen.getByRole('heading', { name: /contact us/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send message/i })
      ).toBeInTheDocument();
    });

    it('displays the page description', () => {
      renderContact();

      expect(
        screen.getByText(/have a question or feedback/i)
      ).toBeInTheDocument();
    });

    it('marks required fields with asterisks', () => {
      renderContact();

      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers).toHaveLength(4); // All 4 fields are required
    });
  });

  describe('Form Validation', () => {
    it('shows validation error when name is too short', async () => {
      const user = userEvent.setup();
      renderContact();

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'A');
      await user.tab(); // Trigger onBlur validation

      await waitFor(() => {
        expect(
          screen.getByText(/name must be at least 2 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email', async () => {
      const user = userEvent.setup();
      renderContact();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when subject is too short', async () => {
      const user = userEvent.setup();
      renderContact();

      const subjectInput = screen.getByLabelText(/subject/i);
      await user.type(subjectInput, 'Hi');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/subject must be at least 3 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when message is too short', async () => {
      const user = userEvent.setup();
      renderContact();

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Short');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/message must be at least 10 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('does not show validation errors for valid input', async () => {
      const user = userEvent.setup();
      renderContact();

      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
      await user.type(
        screen.getByLabelText(/message/i),
        'This is a valid message with more than 10 characters'
      );

      await user.tab();

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');
      renderContact();

      // Fill out the form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
      await user.type(
        screen.getByLabelText(/message/i),
        'This is a test message with enough characters'
      );

      // Submit the form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Button should show loading state
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /sending/i })
        ).toBeInTheDocument();
      });

      // Success toast should be shown
      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith(
            'Message sent successfully!',
            expect.objectContaining({
              description: "We'll get back to you as soon as possible.",
            })
          );
        },
        { timeout: 3000 }
      );

      // Form should be reset
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
      });
    });

    it('disables submit button while submitting', async () => {
      const user = userEvent.setup();
      renderContact();

      // Fill out the form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
      await user.type(
        screen.getByLabelText(/message/i),
        'This is a test message'
      );

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('prevents submission with invalid data', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');
      renderContact();

      // Try to submit without filling the form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Toast should not be called
      await waitFor(() => {
        expect(toast.success).not.toHaveBeenCalled();
      });

      // Validation errors should be shown
      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes on form inputs', () => {
      renderContact();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const subjectInput = screen.getByLabelText(/subject/i);
      const messageInput = screen.getByLabelText(/message/i);

      expect(nameInput).toHaveAttribute('id', 'name');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(subjectInput).toHaveAttribute('id', 'subject');
      expect(messageInput).toHaveAttribute('id', 'message');
    });

    it('associates error messages with inputs using aria-describedby', async () => {
      const user = userEvent.setup();
      renderContact();

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('sets aria-busy on submit button during submission', async () => {
      const user = userEvent.setup();
      renderContact();

      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
      await user.type(
        screen.getByLabelText(/message/i),
        'This is a test message'
      );

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveAttribute('aria-busy', 'true');
      });
    });
  });

  describe('User Experience', () => {
    it('validates on blur (mode: onBlur)', async () => {
      const user = userEvent.setup();
      renderContact();

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'A');

      // Error should not appear immediately
      expect(
        screen.queryByText(/name must be at least 2 characters/i)
      ).not.toBeInTheDocument();

      // Error should appear after blur
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/name must be at least 2 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('displays placeholder text in all fields', () => {
      renderContact();

      expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/john@example.com/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/how can we help/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/tell us more about your inquiry/i)
      ).toBeInTheDocument();
    });
  });
});
