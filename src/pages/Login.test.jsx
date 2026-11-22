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
})
     it('sets password for a valid student and logs in', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url, options) => {
      if (String(url).includes('/students')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 'STU-006', regId: 'STU-006', fullName: 'Jorja Smith', email: 'jorja@inst.edu' },
            ]),
        });
      }
      if (String(url).includes('/users') && !options?.method) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'U-99', email: 'jorja@inst.edu', role: 'student' }),
      });
    });

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
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Set Password & Sign In/i }));

    await waitFor(() => {
        expect(mockLoginWithEmail).toHaveBeenCalledWith('jorja@inst.edu', 'secret123')
    })
})
it('triggers social login buttons and handles errors', async () => {
    mockLoginWithSocial.mockRejectedValueOnce(new Error('OAuth cancelled'))
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    )
    const githubBtn = screen.getByRole('button', { name: /Github/i })
    fireEvent.click(githubBtn)

    expect(await screen.findByText(/OAuth cancelled/i)).toBeInTheDocument();
  });
});


