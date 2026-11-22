import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import * as AuthContext from '../context/AuthContext';

describe('Login Page', () => {
  const mockLoginWithEmail = vi.fn();
  const mockLoginWithSocial = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      loginWithEmail: mockLoginWithEmail,
      loginWithSocial: mockLoginWithSocial,
    });
  });

  it('renders email sign in form and submits credentials', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Institutional Email/i), {
      target: { value: 'admin@inst.edu' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In with Email/i }));

    await waitFor(() => {
      expect(mockLoginWithEmail).toHaveBeenCalledWith('admin@inst.edu', 'password123');
    });
  });

  it('toggles to first-time student password setup mode and validates mismatch', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/First-time student\? Set your password/i));
    fireEvent.change(screen.getByLabelText(/Institutional Email/i), {
      target: { value: 'jorja@inst.edu' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'secret123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Set Password & Sign In/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });
});

