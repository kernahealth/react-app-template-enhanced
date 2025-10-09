import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  contactFormSchema,
  type ContactFormData,
} from '../schemas/contactSchema';

/**
 * Contact Page Component
 *
 * Features a contact form with comprehensive validation using react-hook-form and Zod.
 * Demonstrates best practices for form handling including:
 * - Type-safe validation with Zod
 * - Accessible form inputs with proper labels and ARIA attributes
 * - Error messages displayed inline
 * - Loading states during submission
 * - Success/error feedback with toast notifications
 */
export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  /**
   * Form submission handler
   * In a real application, this would send data to an API endpoint
   */
  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, this would be sent to a server
      // Example: await apiClient.post('/contact', data);

      // For demonstration, log the validated form data
      // eslint-disable-next-line no-console
      console.log('Contact form submitted:', data);

      // Show success message
      toast.success('Message sent successfully!', {
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form after successful submission
      reset();
    } catch {
      toast.error('Failed to send message', {
        description: 'Please try again later.',
      });
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>
          Have a question or feedback? Fill out the form below and we&apos;ll
          get back to you as soon as possible.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="contact-form"
        noValidate
      >
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            placeholder="John Doe"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
          {errors.name && (
            <p id="name-error" className="form-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            placeholder="john@example.com"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="form-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Subject Field */}
        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Subject <span className="required">*</span>
          </label>
          <input
            id="subject"
            type="text"
            className={`form-input ${errors.subject ? 'form-input-error' : ''}`}
            placeholder="How can we help?"
            aria-invalid={errors.subject ? 'true' : 'false'}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            {...register('subject')}
          />
          {errors.subject && (
            <p id="subject-error" className="form-error" role="alert">
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Message <span className="required">*</span>
          </label>
          <textarea
            id="message"
            rows={6}
            className={`form-input form-textarea ${errors.message ? 'form-input-error' : ''}`}
            placeholder="Tell us more about your inquiry..."
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : undefined}
            {...register('message')}
          />
          {errors.message && (
            <p id="message-error" className="form-error" role="alert">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>

      <style>{`
        .contact-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .contact-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #ffffffde;
        }

        .contact-header p {
          font-size: 1rem;
          color: #ffffffde;
          line-height: 1.6;
        }

        .contact-form {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          text-align: left;
        }

        .required {
          color: #e53e3e;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          color: #2d3748;
          background-color: #fff;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .form-input:focus {
          outline: none;
          border-color: #646cff;
          box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-input-error {
          border-color: #e53e3e;
        }

        .form-input-error:focus {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }

        .form-error {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #e53e3e;
          text-align: left;
        }

        .form-actions {
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }

        .btn-primary {
          width: 100%;
          color: white;
          background-color: #646cff;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #535bf2;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.3);
        }

        @media (max-width: 640px) {
          .contact-page {
            padding: 1rem;
          }

          .contact-form {
            padding: 1.5rem;
          }

          .contact-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
