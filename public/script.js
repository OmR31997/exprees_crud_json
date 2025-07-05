let error = {};

const formDataToObject = (formData) => {
    const obj = {};
    for (const [key, value] of formData.entries()) {
        obj[key] = value;
    }
    return obj;
}


/* API Sections */
const registerAPI = async (studentData) => {
    showLoader()
    try {
        const response = await fetch('/api/students/create', {
            method: 'POST',
            body: studentData // Correct way for FormData
            // Note: DON'T set Content-Type manually — fetch sets it correctly for FormData
        });

        const isText = response.headers.get('content-type')?.includes("text/plain");

        const text = await response.text(); // Not JSON here

        if (!response.ok) {
            if (!isText) {
                const errorData = await response.json();
                const errorMessage = errorData.errors.map(error => `• ${error.msg}`).join();
                throw new Error(errorMessage + "*");
            }
            else {
                const plainText = await response.text();
                Swal.fire('Rejected', plainText, 'error');
                return;
            }
        }

        Swal.fire('Submitted', text, 'success'); // plain message;
    } catch (error) {
        Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
        console.error('Server Error:', error);
    }
    hideLoader();
}

const updateAPI = async (studentId, studentData) => {
    showLoader(); 
    try {
        const response = await fetch(`/api/students/${studentId}`, {
            method: 'PUT',
            body: studentData
        });

        const result = await response.json();
        const students = result.updatedStudents;
        if (response.ok) {
            const studentRecord = document.getElementById('student-record');
            studentRecord.innerHTML = students.map((student, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${student.name}</td>
          <td>${new Date(student.dobDate).toLocaleDateString('en-GB')}</td>
          <td>${student.email}</td>
          <td>${student.course}</td>
          <td>${student.mno}</td>
          <td>${student.address}</td>
          <td>
            <button class="btn btn-primary view-profile-btn" data-profilepic="${student.profilePic}" data-bs-toggle="modal" data-bs-target="#viewProfilePic">View</button>
            <button class="btn btn-primary view-sign-btn" data-signature="${student.signature}" data-bs-toggle="modal" data-bs-target="#viewSignPic">View</button>
            <button class="btn btn-primary view-sheet-btn" data-sheet="${student.sheetCopy}" data-bs-toggle="modal" data-bs-target="#viewSheet">View</button>
          </td>
          <td>
            <button class="btn btn-warning"
              data-id="${student.id}"
              data-name="${student.name}"
              data-dob="${student.dobDate}"
              data-email="${student.email}"
              data-course="${student.course}"
              data-mno="${student.mno}"
              data-address="${student.address}"
              data-profilepic="${student.profilePic}"
              data-signature="${student.signature}"
              data-sheetcopy="${student.sheetCopy}">✏️</button>
            <button class="btn btn-danger" data-id="${student.id}">X</button>
          </td>
          <td><div class="rounded-circle bg-success d-inline-block" style="width: 10px; height: 10px;"></div></td>
        </tr>`).join('');

            Swal.fire('Process Status', result.message, 'success');
        } else {
            Swal.fire('Rejected', result.error || 'Something went wrong', 'error');
        }
    } catch (error) {
        Swal.fire('Rejected', error.message || 'Network error', 'error');
    }
    hideLoader();
};

const deleteStudentAPI = async (studentId, secretKey) => {
    showLoader(); 
    try {
        const response = await fetch(`/api/students/${studentId}/${secretKey}`, { method: 'DELETE' });
        const result = await response.json();
        const students = result.updatedStudents;
        if (response.ok) {
            const studentRecord = document.getElementById('student-record');
            studentRecord.innerHTML = students.map((student, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${student.name}</td>
          <td>${new Date(student.dobDate).toLocaleDateString('en-GB')}</td>
          <td>${student.email}</td>
          <td>${student.course}</td>
          <td>${student.mno}</td>
          <td>${student.address}</td>
          <td>
            <button class="btn btn-primary view-profile-btn" data-profilepic="${student.profilePic}" data-bs-toggle="modal" data-bs-target="#viewProfilePic">View</button>
            <button class="btn btn-primary view-sign-btn" data-signature="${student.signature}" data-bs-toggle="modal" data-bs-target="#viewSignPic">View</button>
            <button class="btn btn-primary view-sheet-btn" data-sheet="${student.sheetCopy}" data-bs-toggle="modal" data-bs-target="#viewSheet">View</button>
          </td>
          <td>
            <button class="btn btn-warning"
              data-id="${student.id}"
              data-name="${student.name}"
              data-dob="${student.dobDate}"
              data-email="${student.email}"
              data-course="${student.course}"
              data-mno="${student.mno}"
              data-address="${student.address}"
              data-profilepic="${student.profilePic}"
              data-signature="${student.signature}"
              data-sheetcopy="${student.sheetCopy}">✏️</button>
            <button class="btn btn-danger" data-id="${student.id}">X</button>
          </td>
          <td><div class="rounded-circle bg-success d-inline-block" style="width: 10px; height: 10px;"></div></td>
        </tr>`).join('');

            Swal.fire('Process Status', result.message, 'success');
        } else {
            Swal.fire('Rejected', result.error || 'Something went wrong', 'error');
        }
    } catch (error) {
        Swal.fire('Rejected', error.message || 'Network error', 'error');
    }
    hideLoader();
}

const showKeyPopup = async (studentId, studentData) => {
    const { value: secretKey } = await Swal.fire({
        title: 'Enter 6-digit Secret Key',
        html: `
            <div style="display: flex; justify-content: center; gap:0.5rem;">
            ${[1, 2, 3, 4, 5, 6].map(index =>
            `<input id="secretKey${index}" type="text" maxlength="1" style="width: 2rem; font-size: 2rem; text-align: center;" />`
        ).join('')}
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        focusConfirm: false,
        preConfirm: () => {
            const secretKey = [...Array(6)].map((_, i) => {
                return document.getElementById(`secretKey${i + 1}`).value;
            }).join('');

            if (!/^\d{6}/.test(secretKey)) {
                Swal.showValidationMessage('Please enter all 6 digits (numbers only)')
            }
            return secretKey;
        },
        didOpen: () => {
            document.getElementById('secretKey1').focus();
            for (let i = 1; i <= 6; i++) {
                const input = document.getElementById(`secretKey${i}`);

                input.addEventListener('input', (e) => {
                    if (e.target.value.length === 1 && i < 6) {
                        document.getElementById(`secretKey${i + 1}`).focus();
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && input.value === '' && i > 1) {
                        document.getElementById(`secretKey${i - 1}`).focus();
                    }
                });
            }
        }
    });

    if (secretKey && !studentId) {
        studentData.append('secretKey', secretKey)
        await registerAPI(studentData);
    }

    if (secretKey && studentId) {
        await deleteStudentAPI(studentId, secretKey);
    }
};

// document.getElementById('showsecretKeyBtn').addEventListener('click', showsecretKeyPopup);

const showPage = (id) => {
    showLoader();
    document.querySelectorAll('.page').forEach(div => {
        div.style.display = 'none';
    });

    const sectionPage = document.getElementById(id);
    if (sectionPage) {
        sectionPage.style.display = 'block';
        history.pushState({ page: id }, "", `/${id === 'home' ? '' : id}`);
    }
    hideLoader();
}


// Initial page load: show section based on URL
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.slice(1) || 'home';
    showPage(currentPath);
});

// Handle browser back/forward navigation
window.onpopstate = (event) => {
    const page = event.state?.page || 'home';
    showPage(page);
}

// Date of birth picker logic
const dobPicker = document.getElementById('dobPicker');
const dobInput = document.getElementById('dobInput');

// Show date picker when text input is clicked
dobInput.addEventListener('click', () => {
    dobPicker.showPicker(); // For better native behavior (modern browsers)
});

// When date is selected, format and show it
dobPicker.addEventListener('change', (e) => {
    const date = new Date(e.target.value);

    if (!isNaN(date)) {
        dobInput.value = date.toLocaleDateString('en-GB');
    }

});

document.getElementById('profilePic').addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        const preview = document.getElementById('picPreview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

document.getElementById('signature').addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        const preview = document.getElementById('signPreview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

document.getElementById('sheetCopy').addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        const preview = document.getElementById('sheetPreview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    let hasError = false;

    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const course = formData.get('course').trim();
    const mno = formData.get('mno').trim();
    const dob = formData.get('dobDate').trim();
    const address = formData.get('address').trim();

    // Helper function
    const invalid = (id) => document.getElementById(id).classList.add('is-invalid');
    const valid = (id) => document.getElementById(id).classList.remove('is-invalid');
    const sanitize = (text) => text.replace(/<[^>]*>?/gm, '').toLowerCase();

    // Validate Name
    if (!name || !/^[a-zA-Z\s]+$/.test(name) || /script|alert|console/.test(sanitize(name))) {
        invalid('name');
        hasError = true;
    } else valid('name');

    // Validate Email
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || /script|alert|console/.test(sanitize(email))) {
        invalid('email');
        hasError = true;
    } else valid('email');

    // Validate Course
    if (!course || !/^[a-zA-Z\s]+$/.test(course) || /script|alert|console/.test(sanitize(course))) {
        invalid('course');
        hasError = true;
    } else valid('course');

    // Validate Mobile Number
    if (!/^\d{10}$/.test(mno)) {
        invalid('mno');
        hasError = true;
    } else valid('mno');

    // Validate DOB
    if (!dob) {
        invalid('dobInput');
        hasError = true;
    } else valid('dobInput');

    // Validate Address
    if (!address || /script|alert|console/.test(sanitize(address))) {
        invalid('address');
        hasError = true;
    } else valid('address');

    // File Validation
    const fileFields = ['profilePic', 'signature', 'sheetCopy'];
    fileFields.forEach(id => {
        const input = document.getElementById(id);
        if (!input.files.length) {
            input.classList.add('is-invalid');
            hasError = true;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    if (hasError) return;

    showKeyPopup(null, formData); // Safe to submit now
});

document.querySelectorAll('#registerForm input, #registerForm textarea').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('is-invalid'));
});

document.getElementById('mno').addEventListener('input', (e) => {
    // Allow only digits
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
});

document.getElementById('update-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    let hasError = false;

    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const course = formData.get('course').trim();
    const mno = formData.get('mno').trim();
    const dob = formData.get('dobDate').trim();
    const address = formData.get('address').trim();

    // Helper Functions
    const invalid = (id) => document.getElementById(id).classList.add('is-invalid');
    const valid = (id) => document.getElementById(id).classList.remove('is-invalid');
    const sanitize = (text) => text.replace(/<[^>]*>?/gm, '').toLowerCase();

    // Validate Name
    if (!name || !/^[a-zA-Z\s]+$/.test(name) || /script|alert|console/.test(sanitize(name))) {
        invalid('updateName');
        hasError = true;
    } else valid('updateName');

    // Validate Email
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || /script|alert|console/.test(sanitize(email))) {
        invalid('updateEmail');
        hasError = true;
    } else valid('updateEmail');

    // Validate Course
    if (!course || !/^[a-zA-Z\s]+$/.test(course) || /script|alert|console/.test(sanitize(course))) {
        invalid('updateCourse');
        hasError = true;
    } else valid('updateCourse');

    // Validate Mobile Number
    if (!/^\d{10}$/.test(mno)) {
        invalid('updateMno');
        hasError = true;
    } else valid('updateMno');

    // Validate DOB
    if (!dob) {
        invalid('updateDOB');
        hasError = true;
    } else valid('updateDOB');

    // Validate Address
    if (!address || /script|alert|console/.test(sanitize(address))) {
        invalid('updateAddress');
        hasError = true;
    } else valid('updateAddress');

    const studentId = document.getElementById('updateModal').getAttribute('data-student-id');

    await updateAPI(studentId, formData)

    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('updateModal'));
    modalInstance.hide(); // ✅ Close modal first
});

document.querySelectorAll('#update-student-form input, #update-student-form textarea').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('is-invalid'));
});

document.getElementById('updateMno').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
});


document.getElementById('marksheetForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name').trim();
    const rollNo = formData.get('rollNo').trim();

    const subjectIds = ['math', 'science', 'english', 'history', 'computer', 'nativeLanguage'];
    let hasError = false;

    // Name & RollNo Validation
    if (!name) {
        document.getElementById('studentName').classList.add('is-invalid');
        document.getElementById('error-name').innerText = '* Name is required';
        hasError = true;
    } else {
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            document.getElementById('studentName').classList.add('is-invalid');
            document.getElementById('error-name').innerText = '* Name must be letters only';
            hasError = true;
        }
        else {
            document.getElementById('studentName').classList.remove('is-invalid');
            document.getElementById('error-name').innerText = '';
        }
    }

    if (!rollNo) {
        document.getElementById('rollNumber').classList.add('is-invalid');
        document.getElementById('error-rollNo').innerText = '* Roll No is required';
        hasError = true;
    } else {
        document.getElementById('rollNumber').classList.remove('is-invalid');
    }

    // Subject Validation
    let total = 0, count = 0;
    let resultText = `Name: ${name}\nMarks:\n`;

    subjectIds.forEach(id => {
        const input = document.getElementById(id);
        const value = input.value.trim();

        if (value === '' || isNaN(value) || value < 0 || value > 100) {
            input.classList.add('is-invalid');
            hasError = true;
        } else {
            input.classList.remove('is-invalid');
            resultText += `${id.charAt(0).toUpperCase() + id.slice(1)}: ${value} \t`;
            total += parseInt(value);
            count++;
        }
    });

    // Optional Field
    const additional = document.getElementById('additionalLanguage');
    const addVal = additional.value.trim();
    if (addVal !== '' && !isNaN(addVal) && addVal >= 0 && addVal <= 100) {
        resultText += `AdditionalLanguage: ${addVal}`;
        total += parseInt(addVal);
        count++;
        additional.classList.remove('is-invalid');
    } else if (addVal !== '') {
        additional.classList.add('is-invalid');
        hasError = true;
    } else {
        additional.classList.remove('is-invalid');
    }

    if (hasError) return; // Stop if any error

    // If all valid, show summary
    formData.append('total', total);
    const percentage = count > 0 ? (total / count).toFixed(2) : '0';
    formData.append('percentage', percentage);
    resultText += `\nTotal Marks: ${total}\nPercentage: ${percentage} %`;

    const markSummary = document.getElementById('marksSummary');
    markSummary.innerText = resultText;
    markSummary.innerHTML += '<br />';

    const button = document.createElement('button');
    button.textContent = 'Save';
    button.className = 'btn btn-success mt-2';
    markSummary.appendChild(button);

    document.getElementById('marksheetResult').classList.remove('d-none');
    document.getElementById('marksheetResult')?.classList.replace('alert-danger', 'alert-success');
    button.addEventListener('click', async () => {
        try {
            const resultData = formDataToObject(formData);
            const response = await fetch(`/api/students/result/${rollNo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result: resultData })
            });

            const result = await response.text();

            if (response.ok) {
                markSummary.innerHTML = result;
                markSummary.classList.remove('d-none');
            }
            else {
                markSummary.innerHTML = result;
                markSummary.classList.remove('d-none');
                document.getElementById('marksheetResult')?.classList.replace('alert-success', 'alert-danger');
            }
        }
        catch (error) {
            console.log(error);
        }
    })
});

document.querySelectorAll('#marksheetForm input[type="text"]').forEach(input => {
    // Remove red border on input
    input.addEventListener('input', (e) => {
        input.classList.remove('is-invalid');

        // Allow only numbers 0–100
        if (!['name', 'rollNo'].includes(e.target.name)) {
            const val = e.target.value;
            if (val && (!/^\d{1,3}$/.test(val) || val < 0 || val > 100)) {
                input.value = ''; // Clear invalid
            }
        }
    });
});


document.getElementById('roll-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();

    try {
        const response = await fetch(`/api/students/single`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email })
        });

        const result = await response.text();

        const resultDiv = document.getElementById('roll-result');
        if (response.ok) {
            resultDiv.textContent = `Your Roll No is: ${result}`;
            resultDiv.classList.remove('d-none');
            resultDiv.classList.replace('alert-danger', 'alert-success');
        }
        else {
            resultDiv.textContent = `❌ ${result}`;
            resultDiv.classList.remove('d-none');
            resultDiv.classList.replace('alert-success', 'alert-danger');
        }
    } catch (error) {
        resultDiv.textContent = '❌ Network error';
        resultDiv.classList.remove('d-none');
        resultDiv.classList.replace('alert-success', 'alert-danger');
    }
});

document.getElementById('student-record').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-warning')) {
        const button = e.target;

        const studentId = button.getAttribute('data-id');
        const studentName = button.getAttribute('data-name');
        const studentDob = button.getAttribute('data-dob');
        const studentEmail = button.getAttribute('data-email');
        const studentCourse = button.getAttribute('data-course');
        const studentMNO = button.getAttribute('data-mno');
        const studentAddress = button.getAttribute('data-address');
        const studentProfilePic = button.getAttribute('data-profilepic');
        const studentSignature = button.getAttribute('data-signature');
        const studentSheetCopy = button.getAttribute('data-sheetcopy');

        // Fill modal
        document.getElementById('updateName').value = studentName;
        document.getElementById('updateEmail').value = studentEmail;
        document.getElementById('updateDOB').value = new Date(studentDob).toLocaleDateString('en-GB')
        document.getElementById('updateCourse').value = studentCourse;
        document.getElementById('updateMno').value = studentMNO;
        document.getElementById('updateAddress').value = studentAddress;
        document.getElementById('updDobPicker').value = studentDob;

        document.getElementById('updatePreviewImage').src = `/uploads/${studentProfilePic}`;
        document.getElementById('updatePreviewSignature').src = `/uploads/${studentSignature}`;
        document.getElementById('updatePreviewSheet').src = `/uploads/${studentSheetCopy}`;

        document.getElementById('updatePreviewImage').style.display = 'block';
        document.getElementById('updatePreviewSignature').style.display = 'block';
        document.getElementById('updatePreviewSheet').style.display = 'block';

        // Date of birth picker logic
        const dobPicker = document.getElementById('updDobPicker');
        const dobInput = document.getElementById('updateDOB');

        // Show date picker when text input is clicked
        dobInput.addEventListener('click', () => {
            dobPicker.showPicker(); // For better native behavior (modern browsers)
        });

        // When date is selected, format and show it
        dobPicker.addEventListener('change', (e) => {
            const date = new Date(e.target.value);

            if (!isNaN(date)) {
                dobInput.value = date.toLocaleDateString('en-GB');
            }

        });
        document.getElementById('updateModal').dataset.studentId = studentId;

        const modal = new bootstrap.Modal(document.getElementById('updateModal'));
        modal.show();
    }
});

document.getElementById('student-record').addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-danger')) {
        const button = e.target;
        const studentId = button.getAttribute('data-id');

        showKeyPopup(studentId, null)
    }
})

document.getElementById('resultForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rollNo = formData.get('rollNo');
    alert(rollNo)
    try {
        const response = await fetch(`/api/students/result/${rollNo}`);
        const student = await response.json();
        console.log(student);
        const viewResult = document.getElementById('view-result');
        viewResult.innerHTML = `
        <div class="container border p-4 my-4 shadow rounded" style="max-width: 800px; font-family: 'Segoe UI', sans-serif;">
            <div class="text-center mb-4">
              <h4 class="fw-bold text-uppercase">Student Marksheet</h4>
              <small class="text-muted">Session: 2025–26</small>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong>Name:</strong> ${student.name}<br />
                <strong>Roll No:</strong> ${student?.result?.rollNo}<br />
                <strong>Course:</strong> ${student.course}<br />
                <strong>DOB:</strong> ${student.dobDate}<br />
                <strong>Email:</strong> ${student.email}<br />
                <strong>Mobile:</strong> ${student.mno}<br />
                <strong>Address:</strong> ${student.address}
              </div>
              <div class="text-end">
                <img src="/uploads/${student.profilePic}" alt="Profile" class="img-thumbnail mb-1" style="width: 100px;" />
                <br />
                <img src="/uploads/${student.signature}" alt="Signature" style="width: 100px; height: 40px;" />
              </div>
            </div>

            <hr />

            <h5 class="text-center mb-3 text-decoration-underline">Subject-wise Marks</h5>

            <table class="table table-bordered text-center">
              <thead class="table-light">
                <tr>
                  <th>Subject</th>
                  <th>Marks (out of 100)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Mathematics</td><td>${student?.result?.math}</td></tr>
                <tr><td>Science</td><td>${student?.result?.science}</td></tr>
                <tr><td>English</td><td>${student?.result?.english}</td></tr>
                <tr><td>History</td><td>${student?.result?.history}</td></tr>
                <tr><td>Computer</td><td>${student?.result?.computer}</td></tr>
                <tr><td>Native Language</td><td>${student?.result?.nativeLanguage}</td></tr>
                <tr><td>Additional Language</td><td>${student?.result?.additionalLanguage}</td></tr>
              </tbody>
              <tfoot class="table-light">
                <tr><th>Total</th><th>${student?.result?.total}</th></tr>
                <tr><th>Percentage</th><th>${student?.result?.percentage}%</th></tr>
              </tfoot>
            </table>

            <div class="mt-4 text-end">
              <small>Authorized Signatory</small><br />
              <img src="https://st.depositphotos.com/2274151/4898/v/450/depositphotos_48981169-stock-illustration-authorized-grungy-stamp-isolated-on.jpg" alt="Signature" style="width: 100px; height: 40px;" />
            </div>
        </div>
        <div class="text-center">
            <button id="printMarksheet" class="btn btn-primary mt-3">🖨️ Print Marksheet</button>
        </div>
        `

        document.getElementById('printMarksheet').addEventListener('click', () => {
            const printContents = document.getElementById('view-result').innerHTML;
            const originalContents = document.body.innerHTML;

            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            location.reload(); // to restore JS events
        })
    } catch (error) {
        console.log(error);
    }
});

window.addEventListener('load', async () => {
    const studentRecord = document.getElementById('student-record');

    let students;
    try {
        const response = await fetch('/api/students');
        students = await response.json();

        studentRecord.innerHTML = students.map((student, index) => `<tr>
    <td>${index + 1}</td>
    <td>${student.name}</td>
    <td>${new Date(student.dobDate).toLocaleDateString('en-GB')}</td>
    <td>${student.email}</td>
    <td>${student.course}</td>
    <td>${student.mno}</td>
    <td>${student.address}</td>
    <td>
        <button type="button" class="btn btn-primary view-profile-btn" data-profilepic="${student.profilePic}" data-bs-toggle="modal" data-bs-target="#viewProfilePic">View</button>
        <button type="button" class="btn btn-primary view-sign-btn" data-signature="${student.signature}" data-bs-toggle="modal" data-bs-target="#viewSignPic">View</button> 
        <button type="button" class="btn btn-primary view-sheet-btn" data-sheet="${student.sheetCopy}" data-bs-toggle="modal" data-bs-target="#viewSheet">View</button>
    </td>
    <td>
        <button type="button" class="btn btn-warning" 
            data-profilePic="${student.profilePic}"
            data-signature="${student.signature}"
            data-sheetcopy="${student.sheetCopy}"
            data-id="${student.id}" 
            data-name="${student.name}"
            data-dob="${student.dobDate}"
            data-email="${student.email}"
            data-course="${student.course}"
            data-mno="${student.mno}"
            data-address="${student.address}">✏️</button> 
        <button type="button" class="btn btn-danger" data-id="${student.id}">X</button>
    </td>
    <td><div class="rounded-circle bg-success d-inline-block" style="width: 10px; height: 10px;"></div></td>
    </tr>`)

        // Event delegation for view-profile buttons
        studentRecord.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-profile-btn')) {
                const profilePic = e.target.getAttribute('data-profilepic');
                const studentPic = document.getElementById('studentPic');
                studentPic.src = `/uploads/${profilePic}`;
            }
        });

        studentRecord.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-sign-btn')) {
                const signPic = e.target.getAttribute('data-signature');
                const studentSign = document.getElementById('studentSign');
                studentSign.src = `/uploads/${signPic}`;
            }
        });

        studentRecord.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-sheet-btn')) {
                const sheetDoc = e.target.getAttribute('data-sheet');
                const marksheetDoc = document.getElementById('studentSheet');
                marksheetDoc.src = `/uploads/${sheetDoc}`;
            }
        });


    } catch (error) {
        console.log(error);
        studentRecord.innerHTML = `<tr><td colspan="6">Error fetching data</td></tr>`;
        return;
    }
});

document.getElementById('logOut').addEventListener('click', () => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You want logout!',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#3085d6',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes. logout',
        reverseButtons: true
    })
        .then((result) => {
            if (result.isConfirmed) {
                fetch('/api/logout')
                .then(res => res.json())
                .then(data => {
                    Swal.fire({
                        icon:'success',
                        title: data.message,
                        showConfirmButton:false,
                        timer:1500
                    });
                })
                
                // Optional: redirect after short delay
                setTimeout(() => {
                    window.location.href = '/login'; // or '/'
                }, 1500);
            }
        });
})