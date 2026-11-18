export const GRADE_POINTS = {
  A: 4.0,
  'A-': 3.7,
  'B+': 3.5,
  B: 3.0,
  'C+': 2.5,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

export function getPointsForGrade(grade) {
  return GRADE_POINTS[grade] ?? 0.0;
}

export function calculateStudentGPA(studentId, enrollments, courses) {
  const studentRecords = enrollments.filter((e) => e.studentId === studentId);
  if (studentRecords.length === 0) return '0.00';

  let totalWeightedPoints = 0;
  let totalCredits = 0;

  for (const record of studentRecords) {
    const course = courses.find((c) => c.id === record.courseId);
    const credits = course ? Number(course.credits) : 3;
    const points = record.points !== undefined ? Number(record.points) : getPointsForGrade(record.grade);

    totalWeightedPoints += points * credits;
    totalCredits += credits;
  }

  return totalCredits === 0 ? '0.00' : (totalWeightedPoints / totalCredits).toFixed(2);
}

