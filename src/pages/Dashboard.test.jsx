import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import * as AuthContext from '../context/AuthContext';

describe('Dashboard Page', () => {
  const mockStudents = [
    {
      id: 'STU-001',
      regId: 'STU-001',
      fullName: 'Collins Mark',
      email: 'collins@inst.edu',
      program: 'BSc Computer Science',
      year: 2,
      status: 'Active',
    },
    {
      id: 'STU-002',
      regId: 'STU-002',
      fullName: 'Mike Tyson',
      email: 'mike@inst.edu',
      program: 'BSc Software Engineering',
      year: 1,
      status: 'Active',
    },
  ];

  const mockCourses = [
    {
      id: 'SE-305',
      code: 'SE-305',
      title: 'Web Application Engineering',
      credits: 3,
      instructor: 'Prof. L. Wanjiku',
      capacity: 35,
    },
    {
      id: 'CS-101',
      code: 'CS-101',
      title: 'Intro to Programming',
      credits: 4,
      instructor: 'Dr. K. Kamau',
      capacity: 40,
    },
  ];

  const mockEnrollments = [
    {
      id: 'ENR-1',
      studentId: 'STU-001',
      courseId: 'SE-305',
      grade: 'A',
      score: 88,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockImplementation((url, options) => {
       if (options?.method === 'POST') {
        const body = JSON.parse(options.body || '{}')
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 'NEW-1', ...body }),
        })
    }
    if (String(url).includes('/students')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStudents),
        })
    }
    if (String(url).includes('/courses')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockCourses),
        })
    }
    if (String(url),includes('/enrollments')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockEnrollments),
        })
    }
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    })
})
})
      

  it('renders only assigned courses when logged in as a student', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        name: 'Collins Mark',
        email: 'collins@inst.edu',
        role: 'student',
      },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    await screen.findByText(/Collins Mark/i)

    const coursesTab = await screen.findByText(/^Courses$/i)
    fireEvent.click(coursesTab)

    expect(await screen.findByText(/Collins Mark/i)).toBeInTheDocument()
    expect(screen.queryByText(/Intro to Programming/i)).not.toBeInTheDocument();
  });

  it('renders all courses and allows adding a new student when logged in as admin', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        name: 'System Admin',
        email: 'admin@inst.edu',
        role: 'admin',
      },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const coursesBtn = await screen.findAllByRole('button', { name: /^Courses$/i })
    fireEvent.click(coursesBtn[0])

    expect(await screen.findByText(/Web Application Engineering/i)).toBeInTheDocument();
    expect(await screen.findByText(/Intro to Programming/i)).toBeInTheDocument();

    const nameInput = screen.queryByPlaceholderText(/Full Name/i);
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'Jorja Smith' } });
      const emailInput = screen.getByPlaceholderText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'jorja@inst.edu' } });

      const addButtons = screen.getAllByRole('button', { name: /Add Student/i });
      fireEvent.click(addButtons[addButtons.length - 1]);

      await waitFor(() => {
        expect(api.create).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            fullName: 'Jorja Smith',
            email: 'jorja@inst.edu',
          })
        );
      });
    }
  });

  it('switches to Academic Transcripts tab when clicked', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        name: 'System Admin',
        email: 'admin@inst.edu',
        role: 'admin',
      },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const transcriptsBtn = await screen.findByRole('button', {
      name: /Academic Transcripts/i,
    });
    fireEvent.click(transcriptsBtn);

    expect((await screen.findAllByText(/SE-305/i)).length).toBeGreaterThan(0);
  });
});

