const searchInputs = document.querySelectorAll('[id^="search"]');
const filterSelects = document.querySelectorAll('[id^="filter"]');

document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
    initializeSearch();
    initializeFilters();
    loadStoredData();
});

function initializeForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    const formId = event.target.id;
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    switch(formId) {
        case 'addStudentForm':
            handleAddStudent(data);
            break;
        case 'addTeacherForm':
            handleAddTeacher(data);
            break;
        case 'addCourseForm':
            handleAddCourse(data);
            break;
    }
    
    const modal = bootstrap.Modal.getInstance(event.target.closest('.modal'));
    if (modal) {
        event.target.reset();
        modal.hide();
    }
}

function initializeSearch() {
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(handleSearch, 300));
    });
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const searchContext = event.target.id.replace('search', '').toLowerCase();
    let container;
    switch(searchContext) {
        case 'student':
            container = document.getElementById('studentTableBody');
            break;
        case 'teacher':
            container = document.getElementById('teacherTableBody');
            break;
        case 'course':
            container = document.getElementById('courseGrid');
            break;
    }
    if (container) {
        filterContent(container, searchTerm);
    }
}

function initializeFilters() {
    filterSelects.forEach(select => {
        select.addEventListener('change', handleFilter);
    });
}

function handleFilter(event) {
    const filterValue = event.target.value;
    const filterContext = event.target.id.replace('filter', '').toLowerCase();
    applyFilters(filterContext, filterValue);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function filterContent(container, searchTerm) {
    const items = container.children;
    Array.from(items).forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function applyFilters(context, value) {
    console.log(`Applying ${value} filter to ${context}`);
}

function getStoredData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setStoredData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function handleAddStudent(data) {
    const studentId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const tableBody = document.getElementById('studentTableBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${studentId}</td>
        <td>${data.fullName}</td>
        <td>${data.grade}</td>
        <td>${data.email}</td>
        <td>${data.phone}</td>
        <td>
            <button class="btn btn-sm btn-info me-2" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" title="Delete" onclick="deleteStudent('${studentId}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tableBody.appendChild(row);
    showNotification('Student added successfully');
}

function handleAddTeacher(data) {
    const teacherId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const teacherData = { id: teacherId, ...data };
    const teachers = getStoredData('teachers');
    teachers.push(teacherData);
    setStoredData('teachers', teachers);
    const tableBody = document.getElementById('teacherTableBody');
    const row = createTeacherRow(teacherData);
    tableBody.appendChild(row);
    showNotification('Teacher added successfully');
}

function createTeacherRow(data) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${data.id}</td>
        <td>${data.fullName}</td>
        <td>${data.department}</td>
        <td>${data.email}</td>
        <td>${data.phone}</td>
        <td>
            <button class="btn btn-sm btn-info me-2" title="Edit" onclick="editTeacher('${data.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" title="Delete" onclick="deleteTeacher('${data.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    return row;
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        let teachers = getStoredData('teachers');
        teachers = teachers.filter(teacher => teacher.id !== id);
        setStoredData('teachers', teachers);
        const row = document.querySelector(`tr:has(button[onclick="deleteTeacher('${id}')"])`);
        if (row) {
            row.remove();
            showNotification('Teacher deleted successfully');
        }
    }
}

function handleAddCourse(data) {
    const courseId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const courseData = { id: courseId, ...data };
    const courses = getStoredData('courses');
    courses.push(courseData);
    setStoredData('courses', courses);
    const courseGrid = document.getElementById('courseGrid');
    const card = createCourseCard(courseData);
    courseGrid.appendChild(card);
    showNotification('Course added successfully');
}

function createCourseCard(data) {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">${data.courseName}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Grade ${data.gradeLevel} | ${data.department}</h6>
                <p class="card-text">${data.description}</p>
                <div class="mb-3">
                    <small class="text-muted">
                        <i class="fas fa-user-tie me-2"></i>${data.instructor}
                    </small>
                </div>
                <div class="mb-3">
                    <span class="badge bg-primary me-2">${data.credits} Credits</span>
                    <span class="badge bg-success">0 Students</span>
                </div>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-sm btn-info" title="Edit" onclick="editCourse('${data.id}')">
                        <i class="fas fa-edit me-1"></i>Edit
                    </button>
                    <button class="btn btn-sm btn-danger" title="Delete" onclick="deleteCourse('${data.id}')">
                        <i class="fas fa-trash me-1"></i>Delete
                    </button>
                </div>
            </div>
        </div>
    `;
    return card;
}

function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        let courses = getStoredData('courses');
        courses = courses.filter(course => course.id !== id);
        setStoredData('courses', courses);
        const card = document.querySelector(`.card:has(button[onclick="deleteCourse('${id}')"])`).closest('.col-md-4');
        if (card) {
            card.remove();
            showNotification('Course deleted successfully');
        }
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function loadStoredData() {
    const students = getStoredData('students');
    const studentTableBody = document.getElementById('studentTableBody');
    if (studentTableBody) {
        studentTableBody.innerHTML = '';
        students.forEach(student => {
            const row = createStudentRow(student);
            studentTableBody.appendChild(row);
        });
    }
    const teachers = getStoredData('teachers');
    const teacherTableBody = document.getElementById('teacherTableBody');
    if (teacherTableBody) {
        teacherTableBody.innerHTML = '';
        teachers.forEach(teacher => {
            const row = createTeacherRow(teacher);
            teacherTableBody.appendChild(row);
        });
    }
    const courses = getStoredData('courses');
    const courseGrid = document.getElementById('courseGrid');
    if (courseGrid) {
        courseGrid.innerHTML = '';
        courses.forEach(course => {
            const card = createCourseCard(course);
            courseGrid.appendChild(card);
        });
    }
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        let students = getStoredData('students');
        students = students.filter(student => student.id !== id);
        setStoredData('students', students);
        const row = document.querySelector(`tr:has(button[onclick="deleteStudent('${id}')"])`);
        if (row) {
            row.remove();
            showNotification('Student deleted successfully');
        }
    }
}
