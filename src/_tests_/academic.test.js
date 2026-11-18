import { describe, it, expect } from 'vitest';
import { getPointsForGrade, calculateStudentGPA } from '../utils/academic';

describe('Academic Utilities', () => {
    it('should return correct grade points and default to 0 for unknown grades', () => {
        expect(getPointsForGrade('A')).toBe(4.0)
        expect(getPointsForGrade('B+')).toBe(3.5)
        expect(getPointsForGrade('INVALID')).toBe(0.0)
    })

    it('should calculate GPA correctly for a student', () => {
        const courses = [
            { id: 'CS-101', credits: 4 },
            { id: 'MA-102', credits: 2 },
        ]
        const enrollments = [
            { studentId: 'STU-1', courseId: 'CS-101', grade: 'A', points: 4.0 },
            { studentId: 'STU-1', courseId: 'MA-102', grade: 'B+', points: 3.0 },
        ]
        expect(calculateStudentGPA(enrollments, courses)).toBe(3.67)
    })

    it('should return 0.00 GPA for a student with no enrollments', () => {
        expect(calculateStudentGPA('STU-NONE', [], [])).toBe('0.00')
    })
})