import { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, ClipboardList, Award, LogOut, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { calculateStudentGPA, GRADE_POINTS, getPointsForGrade } from '../utils/academic'

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'students' : 'courses');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [studentForm, setStudentForm] = useState({ fullName: '', email: '', program: 'BSc Computer Science', year: 1 });
  const [courseForm, setCourseForm] = useState({ code: '', title: '', credits: 3, instructor: '', capacity: 40 });
  const [enrollForm, setEnrollForm] = useState({ studentId: '', courseId: '', term: 'Fall 2026', grade: 'A' });

  useEffect(() => {
    async function loadAll() {
      const [s, c, e] = await Promise.all([
        api.getAll('students'),
        api.getAll('courses'),
        api.getAll('enrollments'),
      ]);
      setStudents(s);
      setCourses(c);
      setEnrollments(e);
      if (s.length > 0 && c.length > 0) {
        setEnrollForm((prev) => ({ ...prev, studentId: s[0].id, courseId: c[0].id }));
      }
    }
    loadAll();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();

    const maxNum = students.reduce((max, s) => {
        const code = s.regId || s.id || '';
        const num = parseInt(code.replace('STU-', ''), 10);
        return !isNaN(num) && num > max ? num : max;
    }, 0);

    const nextRegId = `STU-${String(maxNum + 1).padStart(3, '0')}`;
    
    const created = await api.create('students', {
        ...studentForm,
      id: nextRegId,
      regId: nextRegId,
      year: Number(studentForm.year),
      status: 'Active',
    });

    await api.create('users', {
        email: studentForm.email,
        password: 'password123',
        name: studentForm.fullName,
        role: 'student',
        regId: nextRegId,
    })
    setStudents([...students, created]);
    setStudentForm({ fullName: '', email: '', program: 'BSc Computer Science', year: 1 });
  };

  const handleDeleteStudent = async (id) => {
    await api.remove('students', id);
    setStudents(students.filter((s) => s.id !== id));
  };

  const hnadleDeleteEnrollment = async (id) => {
    await api.remove('enrollments', id);
    setEnrollments(prev => prev.filter((e) => e.id !== id));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const created = await api.create('courses', {
      id: courseForm.code.toUpperCase(),
      ...courseForm,
      code: courseForm.code.toUpperCase(),
      credits: Number(courseForm.credits),
      capacity: Number(courseForm.capacity),
    });
    setCourses([...courses, created]);
    setCourseForm({ code: '', title: '', credits: 3, instructor: '', capacity: 40 });
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    const alreadyEnrolled = enrollments.some(
        (enr) => enr.studentId === enrollForm.studentId && enr.courseId === enrollForm.courseId
    );
    if (alreadyEnrolled) {
      alert('Student is already enrolled in this course.');
      return;
    }

    if (!enrollForm.studentId || !enrollForm.courseId) return;
    const created = await api.create('enrollments', {
      ...enrollForm,
      points: getPointsForGrade(enrollForm.grade),
    });
    setEnrollments([...enrollments, created]);
  };

  const handleGradeChange = async (enrollmentId, newGrade) => {
    const updated = await api.update('enrollments', enrollmentId, {
      grade: newGrade,
      points: getPointsForGrade(newGrade),
    });
    setEnrollments(enrollments.map((enr) => (enr.id === enrollmentId ? updated : enr)));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg">StudManager </h1>
            <p className="text-xs text-slate-500">Logged in as {user?.name} ({user?.role})</p>
          </div>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg border border-slate-200 hover:border-red-20">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs uppercase font-semibold text-slate-400">Total Students</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{students.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs uppercase font-semibold text-slate-400">Active Courses</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{courses.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs uppercase font-semibold text-slate-400">Course Enrollments</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{enrollments.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'students', label: 'Students', icon: Users, adminOnly: true },
            { id: 'courses', label: 'Courses', icon: BookOpen, adminOnly: false },
            { id: 'enrollments', label: 'Enrollment & Grades', icon: ClipboardList, adminOnly: true },
            { id: 'records', label: 'Academic Transcripts', icon: Award, adminOnly: false },
          ]
          .filter((tab) => !tab.adminOnly || isAdmin)
          .map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {isAdmin && activeTab === 'students' && (
          <div className="space-y-6">
            <form onSubmit={handleAddStudent} className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3">
              <input type="text" required placeholder="Full Name" value={studentForm.fullName} onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input type="email" required placeholder="Student Email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input type="text" required placeholder="Program" value={studentForm.program} onChange={(e) => setStudentForm({ ...studentForm, program: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input type="number" min="1" max="6" required value={studentForm.year} onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <button type="submit" className="inline-flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"><Plus className="w-4 h-4" /> Add Student</button>
            </form>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr><th className="p-3">Reg ID</th><th className="p-3">Name</th><th className="p-3">Program</th><th className="p-3">Year</th><th className="p-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-mono text-xs">{s.regId || s.id}</td>
                      <td className="p-3 font-medium text-slate-900">{s.fullName}<div className="text-xs text-slate-400">{s.email}</div></td>
                      <td className="p-3">{s.program}</td>
                      <td className="p-3">Year {s.year}</td>
                      <td className="p-3"><button onClick={() => handleDeleteStudent(s.id)} aria-label={`Delete ${s.fullName}`} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
    }

        {activeTab === 'courses' && (
          <div className="space-y-6">
            {isAdmin && (
            <form onSubmit={handleAddCourse} className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3">
              <input type="text" required placeholder="Code (e.g. CS-301)" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input type="text" required placeholder="Course Title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input type="text" required placeholder="Instructor" value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input type="number" min="1" max="6" required placeholder="Credits" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <button type="submit" className="inline-flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"><Plus className="w-4 h-4" /> Add Course</button>
            </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{c.code}</span>
                    <h3 className="font-semibold text-slate-900 mt-1">{c.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Instructor: {c.instructor} • {c.credits} Credits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdmin && activeTab === 'enrollments' && (
          <div className="space-y-6">
            <form onSubmit={handleEnroll} className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3">
              <select aria-label="Select Student" value={enrollForm.studentId} onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {students.map((s) => (<option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>))}
              </select>
              <select aria-label="Select Course" value={enrollForm.courseId} onChange={(e) => setEnrollForm({ ...enrollForm, courseId: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {courses.map((c) => (<option key={c.id} value={c.id}>{c.code} - {c.title}</option>))}
              </select>
              <select aria-label="Select Grade" value={enrollForm.grade} onChange={(e) => setEnrollForm({ ...enrollForm, grade: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {Object.keys(GRADE_POINTS).map((g) => (<option key={g} value={g}>Grade: {g}</option>))}
              </select>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium cursor-pointer">Enroll Student</button>
            </form>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr><th className="p-3">Student</th><th className="p-3">Course</th><th className="p-3">Term</th><th className="p-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map((enr) => {
                    const st = students.find((s) => s.id === enr.studentId);
                    const cr = courses.find((c) => c.id === enr.courseId);
                    return (
                      <tr key={enr.id}>
                        <td className="p-3 font-medium">{st ? st.fullName : enr.studentId}</td>
                        <td className="p-3">{cr ? `${cr.code} - ${cr.title}` : enr.courseId}</td>
                        <td className="p-3">{enr.term}</td>
                        <td className="p-3">
                          <select aria-label={`Grade for ${enr.id}`} value={enr.grade} onChange={(e) => handleGradeChange(enr.id, e.target.value)} className="border border-slate-300 rounded px-2 py-1 text-xs">
                            {Object.keys(GRADE_POINTS).map((g) => (<option key={g} value={g}>{g}</option>))}
                          </select>
                        </td>
                        <td className="p-3"><button onClick={() => hnadleDeleteEnrollment(enr.id)} aria-label={`Delete enrollment ${enr.id}`} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        

        {activeTab === 'records' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isAdmin
                ? students
                : students.filter(
                    (s) =>
                        s.email.toLowerCase() === user?.email.toLowerCase() ||
                        s.fullName.toLowerCase() === user?.name.toLowerCase()
                )
            ).map((s) => {
              const gpa = calculateStudentGPA(s.id, enrollments, courses);
              const studentEnrollments = enrollments.filter((e) => e.studentId === s.id);
              return (
                <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{s.fullName}</h3>
                      <p className="text-xs text-slate-500">{s.regId || s.id} • {s.program}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Cumulative GPA</span>
                      <span className="text-xl font-bold text-indigo-600">{gpa}</span>
                    </div>
                  </div>
                  <ul className="text-xs space-y-1 text-slate-600">
                    {studentEnrollments.length === 0 ? (
                      <li className="text-slate-400">No academic records yet.</li>
                    ) : (
                      studentEnrollments.map((enr) => (
                        <li key={enr.id} className="flex justify-between">
                          <span>{enr.courseId} ({enr.term})</span>
                          <span className="font-semibold">{enr.grade} ({enr.points} pts)</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
