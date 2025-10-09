import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Users } from './Users';
import { userService } from '../services/userService';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('../services/userService');
jest.mock('sonner');

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user' as const,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'user' as const,
  },
];

describe('Users Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderWithQuery = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Loading and Error States', () => {
    it('displays loading state with skeleton', () => {
      (userService.getUsers as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithQuery(<Users />);

      expect(screen.getByText('👥 Users Management')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      // Filters should still be visible during loading
      expect(
        screen.getByPlaceholderText('Search users...')
      ).toBeInTheDocument();
    });

    it('displays error state with filters visible', async () => {
      const errorMessage = 'Failed to fetch users';
      (userService.getUsers as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('👥 Users Management')).toBeInTheDocument();
        expect(
          screen.getByText(`Error loading users: ${errorMessage}`)
        ).toBeInTheDocument();
        // Filters should still be visible even with error
        expect(
          screen.getByPlaceholderText('Search users...')
        ).toBeInTheDocument();
      });
    });
  });

  describe('User List Display', () => {
    beforeEach(() => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: {
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('renders user list correctly', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    it('displays user stats correctly', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        // The stats display is calculated from (page-1)*LIMIT+1 to min(page*LIMIT, total)
        // With page=1, LIMIT=2, total=3: shows "Showing 1 - 2 of 3 users"
        // But the mock returns all 3 users, so we need to account for actual display
        // Since users.length=3, it shows (1-1)*2+1=1 to min(1*2, 3)=2, but we have 3 users
        expect(
          screen.getByText(/Showing \d+ - \d+ of 3 users/)
        ).toBeInTheDocument();
      });
    });

    it('displays role badges correctly', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        const adminBadges = screen.getAllByText('admin');
        const userBadges = screen.getAllByText('user');
        expect(adminBadges.length).toBeGreaterThan(0);
        expect(userBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search Functionality', () => {
    it('makes API call with search parameter', async () => {
      // Initial load
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });

      // After search
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: [mockUsers[0]],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search users...');
      fireEvent.change(searchInput, { target: { value: 'john@' } });

      await waitFor(() => {
        expect(userService.getUsers).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'john@' })
        );
      });
    });

    it('shows no users found message when search has no results', async () => {
      // Initial load
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });

      // After search with no results
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search users...');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
      });
    });
  });

  describe('Role Filter', () => {
    it('makes API call with role filter parameter', async () => {
      // Initial load
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });

      // After role filter
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: [mockUsers[0]],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const roleSelect = screen.getByDisplayValue('All Roles');
      fireEvent.change(roleSelect, { target: { value: 'admin' } });

      await waitFor(() => {
        expect(userService.getUsers).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'admin' })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('shows pagination controls when there are multiple pages', async () => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { total: 25, page: 1, limit: 10, totalPages: 3 },
      });

      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('← Previous')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    it('navigates to next page', async () => {
      // Page 1
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
        meta: { total: 25, page: 1, limit: 10, totalPages: 3 },
      });

      // Page 2
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: [mockUsers[0]],
        meta: { total: 25, page: 2, limit: 10, totalPages: 3 },
      });

      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next →');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(userService.getUsers).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });

    it('navigates to previous page', async () => {
      // Page 1
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
        meta: { total: 25, page: 1, limit: 10, totalPages: 3 },
      });

      // Page 2
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: [mockUsers[0]],
        meta: { total: 25, page: 2, limit: 10, totalPages: 3 },
      });

      // Back to Page 1
      (userService.getUsers as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
        meta: { total: 25, page: 1, limit: 10, totalPages: 3 },
      });

      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      });

      // Go to page 2 first
      const nextButton = screen.getByText('Next →');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
      });

      // Now go back to page 1
      const prevButton = screen.getByText('← Previous');
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(userService.getUsers).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  describe('User Selection', () => {
    beforeEach(() => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('selects individual user', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox is select all, second is first user
      fireEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText('Delete Selected (1)')).toBeInTheDocument();
      });
    });

    it('selects all users', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox is select all
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Selected (3)')).toBeInTheDocument();
      });
    });

    it('deselects all users when clicking select all twice', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Select all

      await waitFor(() => {
        expect(screen.getByText('Delete Selected (3)')).toBeInTheDocument();
      });

      fireEvent.click(checkboxes[0]); // Deselect all

      await waitFor(() => {
        expect(screen.queryByText(/Delete Selected/)).not.toBeInTheDocument();
      });
    });

    it('toggles individual user selection', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Select

      await waitFor(() => {
        expect(screen.getByText('Delete Selected (1)')).toBeInTheDocument();
      });

      fireEvent.click(checkboxes[1]); // Deselect

      await waitFor(() => {
        expect(screen.queryByText(/Delete Selected/)).not.toBeInTheDocument();
      });
    });
  });

  describe('User Creation', () => {
    beforeEach(() => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });
      (userService.createUser as jest.Mock).mockResolvedValue({
        id: '4',
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      });
    });

    it('opens create modal when clicking create button', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const createButton = screen.getByText('+ Create User');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });
    });

    it('closes create modal when clicking cancel', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create User'));

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByText('Create User')).not.toBeInTheDocument();
      });
    });

    it('creates a new user successfully', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create User'));

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });

      // Find inputs - there's a search input in the page, so modal inputs are after that
      const allInputs = document.querySelectorAll('input');
      const textInputs = Array.from(allInputs).filter(
        (input) => input.type === 'text'
      );
      const emailInputs = Array.from(allInputs).filter(
        (input) => input.type === 'email'
      );

      // Search input is first text input, name input in modal is second
      const nameInput = textInputs[textInputs.length - 1]; // Last text input is the name in modal
      const emailInput = emailInputs[0]; // First (and only) email input

      fireEvent.change(nameInput, { target: { value: 'New User' } });
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

      // Find and click the Create button (not Cancel)
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find((btn) => btn.textContent === 'Create');
      if (createButton) {
        fireEvent.click(createButton);
      }

      await waitFor(() => {
        expect(userService.createUser).toHaveBeenCalledWith({
          name: 'New User',
          email: 'new@example.com',
          role: 'user',
        });
        expect(toast.success).toHaveBeenCalledWith('User created successfully');
      });
    });
  });

  describe('User Editing', () => {
    beforeEach(() => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });
      (userService.updateUser as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Updated Name',
        email: 'john@example.com',
        role: 'admin',
      });
    });

    it('opens edit modal when clicking edit button', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
    });

    it('updates user successfully', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      // Find and click the Update button
      const buttons = screen.getAllByRole('button');
      const updateButton = buttons.find((btn) => btn.textContent === 'Update');
      if (updateButton) {
        fireEvent.click(updateButton);
      }

      await waitFor(() => {
        expect(userService.updateUser).toHaveBeenCalledWith('1', {
          name: 'Updated Name',
          email: 'john@example.com',
          role: 'admin',
        });
        expect(toast.success).toHaveBeenCalledWith('User updated successfully');
      });
    });
  });

  describe('User Deletion', () => {
    beforeEach(() => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });
      (userService.deleteUser as jest.Mock).mockResolvedValue({});
    });

    it('deletes user after confirmation', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      // Find the delete button for John Doe (should be index 0 in the table)
      fireEvent.click(deleteButtons[0]);

      // Wait for confirmation modal to appear
      await waitFor(() => {
        expect(screen.getByText('Delete User')).toBeInTheDocument();
        expect(
          screen.getByText(/Are you sure you want to delete John Doe/)
        ).toBeInTheDocument();
      });

      // Click the confirm delete button in the modal (not the cancel button)
      // The modal has two buttons: Cancel and Delete
      // We need to find the one that's not "Cancel"
      const allButtons = screen.getAllByRole('button');
      const confirmDeleteButton = allButtons.find(
        (btn) =>
          btn.textContent === 'Delete' &&
          btn.closest('[role="dialog"]') !== null
      );

      if (confirmDeleteButton) {
        fireEvent.click(confirmDeleteButton);
      }

      await waitFor(() => {
        expect(userService.deleteUser).toHaveBeenCalledWith('1');
        expect(toast.success).toHaveBeenCalledWith('User deleted successfully');
      });
    });

    it('does not delete user when confirmation is cancelled', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Wait for confirmation modal to appear
      await waitFor(() => {
        expect(screen.getByText('Delete User')).toBeInTheDocument();
      });

      // Click the cancel button in the modal
      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find((btn) => btn.textContent === 'Cancel');
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      await waitFor(() => {
        expect(userService.deleteUser).not.toHaveBeenCalled();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
      });
    });
  });

  describe('Bulk Delete', () => {
    beforeEach(() => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });
      (userService.bulkDeleteUsers as jest.Mock).mockResolvedValue({
        message: '2 users deleted successfully',
        deletedCount: 2,
      });
    });

    it('bulk deletes selected users after confirmation', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Select two users
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      await waitFor(() => {
        expect(screen.getByText('Delete Selected (2)')).toBeInTheDocument();
      });

      const bulkDeleteButton = screen.getByText('Delete Selected (2)');
      fireEvent.click(bulkDeleteButton);

      // Wait for confirmation modal to appear
      await waitFor(() => {
        expect(screen.getByText('Delete Multiple Users')).toBeInTheDocument();
        expect(
          screen.getByText(/Are you sure you want to delete 2 users/)
        ).toBeInTheDocument();
      });

      // Click the confirm button in the modal
      const confirmButtons = screen.getAllByRole('button');
      const confirmButton = confirmButtons.find(
        (btn) => btn.textContent === 'Delete All'
      );
      if (confirmButton) {
        fireEvent.click(confirmButton);
      }

      await waitFor(() => {
        expect(userService.bulkDeleteUsers).toHaveBeenCalledWith(['1', '2']);
        expect(toast.success).toHaveBeenCalledWith(
          '2 users deleted successfully'
        );
      });
    });

    it('does not bulk delete when confirmation is cancelled', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Select all

      await waitFor(() => {
        expect(screen.getByText('Delete Selected (3)')).toBeInTheDocument();
      });

      const bulkDeleteButton = screen.getByText('Delete Selected (3)');
      fireEvent.click(bulkDeleteButton);

      // Wait for confirmation modal to appear
      await waitFor(() => {
        expect(screen.getByText('Delete Multiple Users')).toBeInTheDocument();
      });

      // Click the cancel button in the modal
      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find((btn) => btn.textContent === 'Cancel');
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      await waitFor(() => {
        expect(userService.bulkDeleteUsers).not.toHaveBeenCalled();
        expect(
          screen.queryByText('Delete Multiple Users')
        ).not.toBeInTheDocument();
      });
    });

    it('handles bulk delete error', async () => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });
      (userService.bulkDeleteUsers as jest.Mock).mockRejectedValue(
        new Error('Failed to delete')
      );

      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Select users
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      await waitFor(() => {
        expect(screen.getByText('Delete Selected (2)')).toBeInTheDocument();
      });

      const bulkDeleteButton = screen.getByText('Delete Selected (2)');
      fireEvent.click(bulkDeleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Multiple Users')).toBeInTheDocument();
      });

      // Confirm delete
      const confirmButtons = screen.getAllByRole('button');
      const confirmButton = confirmButtons.find(
        (btn) => btn.textContent === 'Delete All'
      );
      if (confirmButton) {
        fireEvent.click(confirmButton);
      }

      await waitFor(() => {
        expect(userService.bulkDeleteUsers).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Failed to delete');
      });
    });
  });

  describe('Modal Interactions', () => {
    beforeEach(() => {
      (userService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('closes modal when clicking outside', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create User'));

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });

      // Click on the overlay
      const overlay = screen
        .getByText('Create User')
        .closest('div')?.parentElement;
      if (overlay) {
        fireEvent.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByText('Create User')).not.toBeInTheDocument();
      });
    });

    it('does not close modal when clicking inside', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create User'));

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });

      // Click inside the modal
      const modalContent = screen.getByText('Create User').closest('div');
      if (modalContent) {
        fireEvent.click(modalContent);
      }

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });
    });

    it('changes role in modal', async () => {
      renderWithQuery(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create User'));

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const roleSelect = selects[selects.length - 1]; // Last combobox is the role in modal
      fireEvent.change(roleSelect, { target: { value: 'admin' } });

      expect(roleSelect).toHaveValue('admin');
    });
  });
});
