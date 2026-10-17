
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Student {
  id: number;
  registerNumber: string;
  name: string;
  department: string;
  email: string;
  year: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  activePage = 'Dashboard';
  searchText = '';
  selectedDepartment = 'All Departments';
  showStudentForm = false;
  editingId: number | null = null;
  showDeleteConfirm: number | null = null;
  toastMessage = '';

  departments = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

  students: Student[] = [];

  form: Omit<Student, 'id'> = this.emptyForm();

  ngOnInit(): void {
    this.loadStudents();
  }

  private emptyForm(): Omit<Student, 'id'> {
    return {
      registerNumber: '',
      name: '',
      department: 'CSE',
      email: '',
      year: '1st Year',
      status: 'Active'
    };
  }

  private loadStudents(): void {
    try {
      const saved = localStorage.getItem('student-management-records');

      if (saved) {
        this.students = JSON.parse(saved) as Student[];
      } else {
        this.students = [
          {
            id: 1,
            registerNumber: '23CS001',
            name: 'Arun Kumar',
            department: 'CSE',
            email: 'arun.kumar@example.com',
            year: '3rd Year',
            status: 'Active'
          },
          {
            id: 2,
            registerNumber: '23IT014',
            name: 'Priya Sharma',
            department: 'IT',
            email: 'priya.sharma@example.com',
            year: '3rd Year',
            status: 'Active'
          },
          {
            id: 3,
            registerNumber: '24EC022',
            name: 'Rahul Nair',
            department: 'ECE',
            email: 'rahul.nair@example.com',
            year: '2nd Year',
            status: 'Active'
          },
          {
            id: 4,
            registerNumber: '22CS037',
            name: 'Divya Raj',
            department: 'CSE',
            email: 'divya.raj@example.com',
            year: '4th Year',
            status: 'Inactive'
          },
          {
            id: 5,
            registerNumber: '24EE008',
            name: 'Karthik S',
            department: 'EEE',
            email: 'karthik.s@example.com',
            year: '2nd Year',
            status: 'Active'
          }
        ];

        this.saveStudents();
      }
    } catch {
      this.students = [];
      this.notify('Unable to load saved student records.');
    }
  }

  private saveStudents(): void {
    try {
      localStorage.setItem(
        'student-management-records',
        JSON.stringify(this.students)
      );
    } catch {
      this.notify('Unable to save data in browser storage.');
    }
  }

  get filteredStudents(): Student[] {
    const query = this.searchText.trim().toLowerCase();

    return this.students.filter(student => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.registerNumber.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      const matchesDepartment =
        this.selectedDepartment === 'All Departments' ||
        student.department === this.selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }

  get departmentCount(): number {
    return new Set(this.students.map(student => student.department)).size;
  }

  get activeCount(): number {
    return this.students.filter(student => student.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.students.filter(student => student.status === 'Inactive').length;
  }

  get recentStudents(): Student[] {
    return [...this.students].slice(-4).reverse();
  }

  getDepartmentCount(department: string): number {
    return this.students.filter(student => student.department === department).length;
  }

  getDepartmentPercentage(department: string): number {
    if (this.students.length === 0) {
      return 0;
    }

    return Math.round(
      (this.getDepartmentCount(department) / this.students.length) * 100
    );
  }

  navigate(page: string): void {
    this.activePage = page;
    this.searchText = '';
    this.selectedDepartment = 'All Departments';
    this.showStudentForm = false;
  }

  openAddForm(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showStudentForm = true;
  }

  openEditForm(student: Student): void {
    this.editingId = student.id;
    this.form = {
      registerNumber: student.registerNumber,
      name: student.name,
      department: student.department,
      email: student.email,
      year: student.year,
      status: student.status
    };
    this.showStudentForm = true;
  }

  closeForm(): void {
    this.showStudentForm = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  saveStudent(): void {
    const registerNumber = this.form.registerNumber.trim().toUpperCase();
    const name = this.form.name.trim();
    const email = this.form.email.trim().toLowerCase();

    if (!registerNumber || !name || !email) {
      this.notify('Please fill in all required fields.');
      return;
    }

    const duplicate = this.students.some(student =>
      student.registerNumber.toLowerCase() === registerNumber.toLowerCase() &&
      student.id !== this.editingId
    );

    if (duplicate) {
      this.notify('This register number already exists.');
      return;
    }

    const studentData = {
      ...this.form,
      registerNumber,
      name,
      email
    };

    if (this.editingId !== null) {
      this.students = this.students.map(student =>
        student.id === this.editingId
          ? { ...student, ...studentData }
          : student
      );
      this.notify('Student details updated successfully.');
    } else {
      const newId = this.students.length
        ? Math.max(...this.students.map(student => student.id)) + 1
        : 1;

      this.students = [
        ...this.students,
        { id: newId, ...studentData }
      ];

      this.notify('Student added successfully.');
    }

    this.saveStudents();
    this.closeForm();
  }

  confirmDelete(id: number): void {
    this.showDeleteConfirm = id;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = null;
  }

  deleteStudent(): void {
    if (this.showDeleteConfirm === null) {
      return;
    }

    this.students = this.students.filter(
      student => student.id !== this.showDeleteConfirm
    );

    this.showDeleteConfirm = null;
    this.saveStudents();
    this.notify('Student record deleted.');
  }

  exportStudents(): void {
    const headers = [
      'Register Number',
      'Name',
      'Department',
      'Email',
      'Year',
      'Status'
    ];

    const rows = this.filteredStudents.map(student => [
      student.registerNumber,
      student.name,
      student.department,
      student.email,
      student.year,
      student.status
    ]);

    const csv = [headers, ...rows]
      .map(row =>
        row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'student-records.csv';
    link.click();

    URL.revokeObjectURL(url);
    this.notify('Student list exported to CSV.');
  }

  private notify(message: string): void {
    this.toastMessage = message;
  }

  dismissToast(): void {
    this.toastMessage = '';
  }

  trackStudent(_: number, student: Student): number {
    return student.id;
  }
}
