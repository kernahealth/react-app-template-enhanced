import { useState, useEffect, memo, useCallback } from 'react';
import type { User, CreateUserPayload } from '../types/user';
import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBulkDeleteUsers,
} from '../hooks/useUsers';

const LIMIT = 10;

// Filters Component - Memoized to prevent unnecessary re-renders
interface FiltersProps {
  searchInput: string;
  roleFilter: 'all' | 'admin' | 'user';
  selectedCount: number;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: 'all' | 'admin' | 'user') => void;
  onCreateUser: () => void;
  onBulkDelete: () => void;
}

const Filters = memo(
  ({
    searchInput,
    roleFilter,
    selectedCount,
    onSearchChange,
    onRoleFilterChange,
    onCreateUser,
    onBulkDelete,
  }: FiltersProps) => {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search users..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #646cff',
            background: '#1a1a1a',
            color: 'white',
            minWidth: '200px',
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) =>
            onRoleFilterChange(e.target.value as 'all' | 'admin' | 'user')
          }
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #646cff',
            background: '#1a1a1a',
            color: 'white',
          }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <button onClick={onCreateUser}>+ Create User</button>

        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            style={{
              background: '#ff6b6b',
              borderColor: '#ff6b6b',
            }}
          >
            Delete Selected ({selectedCount})
          </button>
        )}
      </div>
    );
  }
);

Filters.displayName = 'Filters';

export function Users() {
  const [searchInput, setSearchInput] = useState(''); // User's typed input
  const [search, setSearch] = useState(''); // Debounced search value for API
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Debounce search input - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to page 1 when search changes
      setSelectedIds([]); // Clear selections when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build query parameters for server-side filtering
  const queryParams = {
    search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    page,
    limit: LIMIT,
  };

  // Fetch users using custom hook with server-side filtering
  const { data, isLoading, error } = useGetUsers(queryParams);

  // Create user mutation using custom hook
  const createMutation = useCreateUser({
    onSuccess: () => {
      setIsCreating(false);
    },
  });

  // Update user mutation using custom hook
  const updateMutation = useUpdateUser({
    onSuccess: () => {
      setEditingUser(null);
    },
  });

  // Delete user mutation using custom hook
  const deleteMutation = useDeleteUser({
    onSuccess: () => {
      setDeletingUser(null);
    },
    onError: () => {
      setDeletingUser(null);
    },
  });

  // Bulk delete mutation using custom hook
  const bulkDeleteMutation = useBulkDeleteUsers({
    onSuccess: () => {
      setSelectedIds([]);
      setIsBulkDeleting(false);
    },
    onError: () => {
      setIsBulkDeleting(false);
    },
  });

  // Get users from server-side filtered data
  const users = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: LIMIT, totalPages: 1 };

  // Auto-navigate to last valid page after deletion if current page is out of bounds
  useEffect(() => {
    // Only adjust if we have data, we're beyond the last page, and there are still users
    if (data && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [data, page, meta.totalPages]);

  // Handle search input change (debouncing is handled by useEffect)
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleRoleFilterChange = useCallback(
    (value: 'all' | 'admin' | 'user') => {
      setRoleFilter(value);
      setPage(1);
      setSelectedIds([]);
    },
    []
  );

  // Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkDelete = useCallback(() => {
    setIsBulkDeleting(true);
  }, []);

  const handleCreateUser = useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleDelete = (userId: string, userName: string) => {
    setDeletingUser({ id: userId, name: userName });
  };

  const confirmDelete = () => {
    if (deletingUser) {
      deleteMutation.mutate(deletingUser.id);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>👥 Users Management</h1>

        {/* Filters and Actions */}
        <Filters
          searchInput={searchInput}
          roleFilter={roleFilter}
          selectedCount={selectedIds.length}
          onSearchChange={handleSearchChange}
          onRoleFilterChange={handleRoleFilterChange}
          onCreateUser={handleCreateUser}
          onBulkDelete={handleBulkDelete}
        />

        {/* Stats and Pagination Info */}
        {!error && (
          <p>
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Showing {users.length > 0 ? (page - 1) * LIMIT + 1 : 0} -{' '}
                {Math.min(page * LIMIT, meta.total)} of {meta.total} users
              </>
            )}
          </p>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: '1rem',
              background: '#ff6b6b22',
              border: '1px solid #ff6b6b',
              borderRadius: '4px',
              marginTop: '1rem',
            }}
          >
            <p style={{ color: '#ff6b6b', margin: 0 }}>
              Error loading users: {error.message}
            </p>
          </div>
        )}

        {/* Users Table */}
        {!error && (
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '1rem',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #646cff' }}>
                  <th style={{ padding: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === users.length && users.length > 0
                      }
                      onChange={handleSelectAll}
                      disabled={isLoading}
                    />
                  </th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>
                    Email
                  </th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && users.length === 0
                  ? // Loading skeleton for initial load
                    Array.from({ length: 3 }).map((_, index) => (
                      <tr
                        key={`skeleton-${index}`}
                        style={{ borderBottom: '1px solid #646cff33' }}
                      >
                        <td style={{ padding: '0.5rem' }}>
                          <div
                            style={{
                              width: '1rem',
                              height: '1rem',
                              background: '#646cff33',
                              borderRadius: '2px',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <div
                            style={{
                              width: '120px',
                              height: '1rem',
                              background: '#646cff33',
                              borderRadius: '4px',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <div
                            style={{
                              width: '180px',
                              height: '1rem',
                              background: '#646cff33',
                              borderRadius: '4px',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <div
                            style={{
                              width: '60px',
                              height: '1.5rem',
                              background: '#646cff33',
                              borderRadius: '4px',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.5rem',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <div
                              style={{
                                width: '50px',
                                height: '1.75rem',
                                background: '#646cff33',
                                borderRadius: '4px',
                                animation: 'pulse 1.5s ease-in-out infinite',
                              }}
                            />
                            <div
                              style={{
                                width: '60px',
                                height: '1.75rem',
                                background: '#646cff33',
                                borderRadius: '4px',
                                animation: 'pulse 1.5s ease-in-out infinite',
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  : users.map((user) => (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: '1px solid #646cff33',
                          opacity: isLoading ? 0.5 : 1,
                        }}
                      >
                        <td style={{ padding: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            disabled={isLoading}
                          />
                        </td>
                        <td style={{ padding: '0.5rem' }}>{user.name}</td>
                        <td style={{ padding: '0.5rem' }}>{user.email}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background:
                                user.role === 'admin' ? '#646cff' : '#4a4a4a',
                              fontSize: '0.85rem',
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            textAlign: 'right',
                            display: 'flex',
                            gap: '0.5rem',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <button
                            onClick={() => setEditingUser(user)}
                            style={{ padding: '0.25rem 0.75rem' }}
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: '#ff6b6b',
                              borderColor: '#ff6b6b',
                            }}
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {users.length === 0 && !isLoading && (
              <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                No users found
              </p>
            )}

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '2rem',
                }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  style={{
                    padding: '0.5rem 1rem',
                    opacity: page === 1 || isLoading ? 0.5 : 1,
                    cursor: page === 1 || isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Previous
                </button>

                <span style={{ fontSize: '0.9rem' }}>
                  Page {page} of {meta.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={page === meta.totalPages || isLoading}
                  style={{
                    padding: '0.5rem 1rem',
                    opacity: page === meta.totalPages || isLoading ? 0.5 : 1,
                    cursor:
                      page === meta.totalPages || isLoading
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Create/Edit User Modal */}
      {(isCreating || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setIsCreating(false);
            setEditingUser(null);
          }}
          onSubmit={(userData) => {
            if (editingUser) {
              updateMutation.mutate({
                userId: editingUser.id,
                userData,
              });
            } else {
              createMutation.mutate(userData);
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <ConfirmationModal
          title="Delete User"
          message={`Are you sure you want to delete ${deletingUser.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingUser(null)}
          isLoading={deleteMutation.isPending}
          variant="danger"
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleting && (
        <ConfirmationModal
          title="Delete Multiple Users"
          message={`Are you sure you want to delete ${selectedIds.length} user${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmLabel="Delete All"
          cancelLabel="Cancel"
          onConfirm={confirmBulkDelete}
          onCancel={() => setIsBulkDeleting(false)}
          isLoading={bulkDeleteMutation.isPending}
          variant="danger"
        />
      )}
    </div>
  );
}

// User Modal Component
interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (userData: CreateUserPayload) => void;
  isSubmitting: boolean;
}

function UserModal({ user, onClose, onSubmit, isSubmitting }: UserModalProps) {
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleBackdropClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (e.type === 'click' || (e as React.KeyboardEvent).key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropClick}
      role="button"
      tabIndex={0}
      aria-label="Close modal"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className="card"
        style={{
          background: '#1a1a1a',
          padding: '2rem',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '500px',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2>{user ? 'Edit User' : 'Create User'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="user-name"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                textAlign: 'left',
              }}
            >
              Name
            </label>
            <input
              id="user-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #646cff',
                background: '#2a2a2a',
                color: 'white',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="user-email"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                textAlign: 'left',
              }}
            >
              Email
            </label>
            <input
              id="user-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #646cff',
                background: '#2a2a2a',
                color: 'white',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="user-role"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                textAlign: 'left',
              }}
            >
              Role
            </label>
            <select
              id="user-role"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as 'admin' | 'user',
                })
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #646cff',
                background: '#2a2a2a',
                color: 'white',
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div
            style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}
          >
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirmation Modal Component
interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  variant?: 'danger' | 'warning';
}

function ConfirmationModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading,
  variant = 'warning',
}: ConfirmationModalProps) {
  const handleBackdropClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (e.type === 'click' || (e as React.KeyboardEvent).key === 'Escape') {
      if (!isLoading) {
        onCancel();
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropClick}
      role="button"
      tabIndex={0}
      aria-label="Close modal"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className="card"
        style={{
          background: '#1a1a1a',
          padding: '2rem',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '500px',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '3rem',
              width: '3rem',
              borderRadius: '50%',
              backgroundColor: variant === 'danger' ? '#fee2e2' : '#fef3c7',
              marginBottom: '1rem',
            }}
          >
            <svg
              style={{
                height: '1.5rem',
                width: '1.5rem',
                color: variant === 'danger' ? '#dc2626' : '#f59e0b',
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            {title}
          </h2>

          <p
            style={{
              fontSize: '0.95rem',
              color: '#d1d5db',
              marginBottom: '2rem',
              lineHeight: '1.5',
            }}
          >
            {message}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                backgroundColor: variant === 'danger' ? '#dc2626' : '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Deleting...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
