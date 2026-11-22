import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

function TestConsumer() {
  const { user, loginWithEmail, loginWithSocial, logout } = useAuth();
  return (
    <div>
      <span>{user ? user.email : 'No User'}</span>
      <button onClick={() => loginWithEmail('admin@inst.edu', 'password123')}>
        Email Login
      </button>
      <button onClick={() => loginWithSocial('github')}>GitHub Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: '1',
            email: 'admin@inst.edu',
            password: 'password123',
            name: 'System Admin',
            role: 'admin',
          },
        ]),
    });
  });

  it('logs in with email, stores session, and logs out', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('No User')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Email Login'));

    expect(await screen.findByText('admin@inst.edu')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByText('No User')).toBeInTheDocument();
    });
  });
});

