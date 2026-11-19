import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../services/api';

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('should fetch all items from API when server responds successfully', async () => {
    const mockStudents = [
        { id: 'STU-001', regId: 'STU-001', fullName: 'Brian Ochieng'},
    ]

    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockStudents,
    })

    const result = await api.getAll('students')

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/students')
    expect(result).toEqual(mockStudents)
})

  it('should fall back to localStorage when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

   await api.create('courses', {
    code: 'CS-201',
    title: 'Data Structures & Algorithms'
   })

   const result = await api.getAll('courses')

    expect(result.some((c) => c.code === 'CS-201')).toBe(true)
  })


  it('should create a new record through POST and return it', async () => {
    const newStudent = {
        regId: 'STU-004',
        fullName: 'Randall Horace',
        email: 'randall@inst.edu',
        program: 'Bsc Computer Science',
        year: 1,
    }

    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'abc123', ...newStudent }),
    })

    const created = await api.create('students', newStudent)

    expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/students',
        expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
    )
    expect(created.regId).toBe('STU-004')
    expect(created.fullName).toBe('Randall Horace')
  })

  it('should delete a record by id through DELETE', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
    })

    await api.remove('students', 'STU-001')

    expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/students/STU-001',
        expect.objectContaining({ method: 'DELETE' })
    )
 })
})