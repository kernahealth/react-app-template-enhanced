import { z } from 'zod';

/**
 * Zod schema for contact form validation
 *
 * This schema defines the validation rules for the contact form.
 * All fields are required with specific constraints:
 * - Name: 2-100 characters
 * - Email: Valid email format
 * - Subject: 3-200 characters
 * - Message: 10-1000 characters
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

/**
 * Type inference from Zod schema
 * This provides full TypeScript type safety for the contact form data
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;
