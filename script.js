document.addEventListener('DOMContentLoaded', function () {
    let employees = [];
    let attendanceRecords = [];
    let workFromHomeCount = 0;
    let inOfficeCount = 0;
    let todayAttendance = 0;

    // Handle Section Switching for Sidebar Options
    document.querySelectorAll('.nav-list li a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default anchor behavior
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Show the selected section and hide others
    function showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }

    // Initialize the dashboard by showing the overview section
    showSection('overview');

    // Add employee form submission event
    document.getElementById('employeeForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const empName = document.getElementById('empName').value;
        const empID = document.getElementById('empID').value;
        const workingMode = document.getElementById('WokingMode').value;

        // Check for duplicate employee ID
        const existingEmployee = employees.find(emp => emp.id === empID);
        if (existingEmployee) {
            alert("Employee ID already exists. Please use a unique ID.");
            return; // Prevent adding the employee
        }

        // Add the employee if the ID is unique
        employees.push({ name: empName, id: empID, workingMode });

        // Update counts based on working mode
        if (workingMode === 'Work From Home') {
            workFromHomeCount++;
        } else if (workingMode === 'In-Office') {
            inOfficeCount++;
        }

        // Reset form
        document.getElementById('employeeForm').reset();

        // Update employee list and dashboard counts
        updateEmployeeList();
        updateDashboardCounts();
    });

    // Function to update the employee list display
    function updateEmployeeList() {
        const employeeList = document.getElementById('employeeList');
        const attendanceEmployee = document.getElementById('attendanceEmployee');

        // Clear existing employee list display
        employeeList.innerHTML = '';
        attendanceEmployee.innerHTML = '<option value="">Select Employee</option>'; // Reset dropdown

        employees.forEach(emp => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${emp.name}</td><td>${emp.id}</td><td>${emp.workingMode}</td>`;
            employeeList.appendChild(row);

            // Populate the attendance dropdown
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = emp.name;
            attendanceEmployee.appendChild(option);
        });

        // Update work-from-home and in-office sections
        updateWorkFromHomeSection();
        updateInOfficeSection();
    }

    // Function to update the dashboard counts
    function updateDashboardCounts() {
        document.getElementById('totalEmployees').textContent = employees.length;
        document.getElementById('workFromHomeCount').textContent = workFromHomeCount;
        document.getElementById('inOfficeCount').textContent = inOfficeCount;
        document.getElementById('todayAttendance').textContent = todayAttendance;
    }

    // Function to mark attendance
    document.getElementById('attendanceForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const employeeID = document.getElementById('attendanceEmployee').value;
        const inTime = document.getElementById('inTime').value;
        const outTime = document.getElementById('outTime').value;
        const date = new Date().toLocaleDateString();

        if (!employeeID) {
            alert("Please select an employee to mark attendance.");
            return;
        }

        // Check if the employee already has an in-time recorded
        const existingRecord = attendanceRecords.find(record => record.employeeID === employeeID && record.date === date);
        if (!existingRecord) {
            // If no record exists, create a new one with in-time
            attendanceRecords.push({ employeeID, inTime, outTime: null, date });
            todayAttendance++; // Increment today's attendance
        } else {
            // If a record exists, update the out-time
            existingRecord.outTime = outTime; // Update out-time
        }

        document.getElementById('attendanceForm').reset();
        updateAttendanceList();
        updateDashboardCounts();
    });

    // Function to update the attendance list display
    function updateAttendanceList() {
        const attendanceList = document.getElementById('attendanceList');
        attendanceList.innerHTML = '';

        attendanceRecords.forEach(record => {
            const emp = employees.find(emp => emp.id === record.employeeID);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${emp ? emp.name : 'Unknown'}</td>
                <td>${record.employeeID}</td>
                <td>${record.inTime}</td>
                <td>${record.outTime || 'Not recorded yet'}</td>
                <td>${record.date}</td>
            `;
            attendanceList.appendChild(row);
        });
    }

    // Handle auto-fill in-time and out-time when selecting an employee
    document.getElementById('attendanceEmployee').addEventListener('change', function () {
        const selectedEmployeeID = this.value;
        const record = attendanceRecords.find(r => r.employeeID === selectedEmployeeID);
        if (record) {
            document.getElementById('inTime').value = record.inTime || '';
            document.getElementById('outTime').value = record.outTime || '';
        } else {
            document.getElementById('inTime').value = '';
            document.getElementById('outTime').value = '';
        }
    });

    // Function to update the work-from-home section
    function updateWorkFromHomeSection() {
        const workFromHomeList = document.getElementById('workFromHomeDetailsTable');
        const workFromHomeEmployees = employees.filter(emp => emp.workingMode === 'Work From Home');
        workFromHomeList.innerHTML = workFromHomeEmployees.map(emp => `
            <tr>
                <td>${emp.name}</td>
                <td>${emp.id}</td>
                <td>${emp.workingMode}</td>
            </tr>
        `).join('');
    }

    // Function to update the in-office section
    function updateInOfficeSection() {
        const inOfficeList = document.getElementById('inOfficeDetailsTable');
        const inOfficeEmployees = employees.filter(emp => emp.workingMode === 'In-Office');
        inOfficeList.innerHTML = inOfficeEmployees.map(emp => `
            <tr>
                <td>${emp.name}</td>
                <td>${emp.id}</td>
                <td>${emp.workingMode}</td>
            </tr>
        `).join('');
    }

    // Function to generate the report
    function generateReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const lineHeight = 8;
        const margin = 10;
        const date = new Date();
        const formattedDate = date.toLocaleDateString();
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });

        doc.setFontSize(12);
        doc.text('Employee Records and Attendance Report', margin, margin);
        doc.text(`Date: ${formattedDate}`, margin, margin + lineHeight);
        doc.text(`Day: ${day}`, margin, margin + lineHeight * 2);

        let yPosition = margin + 30;

        // Employee Summary Table
        doc.text('Employee Summary:', margin, yPosition);
        yPosition += lineHeight;

        doc.autoTable({
            startY: yPosition,
            head: [['#', 'Name', 'ID', 'Working Mode']],
            body: employees.map((emp, index) => [
                index + 1,
                emp.name,
                emp.id,
                emp.workingMode
            ]),
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            columnStyles: { 0: { halign: 'center' }, 3: { halign: 'center' } },
            margin: { top: 10 },
        });

        // Move the yPosition to the next section
        yPosition = doc.lastAutoTable.finalY + 10;

        // Attendance Summary Table
        doc.text('Overall Details:', margin, yPosition);
        yPosition += lineHeight;

        // Attendance counts
        doc.autoTable({
            startY: yPosition,
            head: [['Total Employees', 'Work From Home', 'In Office', 'Today\'s Attendance']],
            body: [[
                employees.length,
                workFromHomeCount,
                inOfficeCount,
                todayAttendance
            ]],
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            columnStyles: { 0: { halign: 'center' }, 3: { halign: 'center' } },
            margin: { top: 10 },
        });

        // Move the yPosition to the next section
        yPosition = doc.lastAutoTable.finalY + 10;

        // Detailed Attendance Records Table
        doc.text('Attendance Records:', margin, yPosition);
        yPosition += lineHeight;

        doc.autoTable({
            startY: yPosition,
            head: [['Employee Name', 'Employee ID', 'In Time', 'Out Time', 'Date']],
            body: attendanceRecords.map(record => {
                const emp = employees.find(emp => emp.id === record.employeeID);
                return [
                    emp ? emp.name : 'Unknown',
                    record.employeeID,
                    record.inTime,
                    record.outTime || 'Not recorded yet',
                    record.date
                ];
            }),
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            columnStyles: { 0: { halign: 'center' }, 3: { halign: 'center' } },
            margin: { top: 10 },
        });

        doc.save('Employee_Attendance_Report.pdf');
    }

    // Report Button Event Listener
    document.getElementById('reportButton').addEventListener('click', generateReport);
});