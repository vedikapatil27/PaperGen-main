// DOM Elements
const sidebar = document.querySelector('.left-sidebar');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const form = document.getElementById('questionPaperForm');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Fetch the username from sessionStorage
    const username = sessionStorage.getItem("username");

    // Check if the username is available
    setTimeout(() => {
        if (username) {
            // Set the username in the span with the id 'username'
            document.getElementById("username").textContent = username;
        } else {
            // If username is not in sessionStorage, you can set a default value or redirect
            document.getElementById("username").textContent = "Guest";
        }
    }, 1200); // Timeout of 1200 ms
    
    setupEventListeners();
    loadUserData();
});

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 &&
            !sidebar.contains(e.target) &&
            e.target !== menuToggle &&
            e.target !== mobileMenuToggle &&
            !mobileMenuToggle.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Add focus and blur events for form fields to enhance UX
    const formFields = document.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            field.parentElement.classList.add('focused');
        });

        field.addEventListener('blur', () => {
            field.parentElement.classList.remove('focused');
        });
    });
}


document.getElementById('questionPaperForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    let isValid = true;

    // 1. Check for empty fields
    const allFields = document.querySelectorAll('#questionPaperForm input, #questionPaperForm select');
    allFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            highlightInvalidField(field);
        } else {
            removeInvalidHighlight(field);
        }
    });

    // 2. Semester must be selected
    const semester = document.getElementById('semester').value;
    if (!semester) {
        isValid = false;
        highlightInvalidField(document.getElementById('semester'));
        showNotification('Please select a semester', 'error');
    }

    // 3. Total Marks validation (1 to 100)
    const totalMarks = parseInt(document.getElementById('total_marks').value);
    if (isNaN(totalMarks) || totalMarks <= 0 || totalMarks > 100) {
        isValid = false;
        highlightInvalidField(document.getElementById('total_marks'));
        showNotification('Total marks must be between 1 and 100', 'error');
    }

    // 4. Subject Code and Paper Code (Alphanumeric only)
    const codePattern = /^[a-zA-Z0-9]+$/;
    const subjectCode = document.getElementById('subject_code').value;
    const paperCode = document.getElementById('paper_code').value;

    if (!codePattern.test(subjectCode)) {
        isValid = false;
        highlightInvalidField(document.getElementById('subject_code'));
        showNotification('Subject code must be alphanumeric', 'error');
    }

    if (!codePattern.test(paperCode)) {
        isValid = false;
        highlightInvalidField(document.getElementById('paper_code'));
        showNotification('Paper code must be alphanumeric', 'error');
    }

        // 5. Date must be in the future
    const examDate = new Date(document.getElementById('exam_date').value);
    const currentDate = new Date();

    if (examDate <= currentDate) {
        isValid = false;
        highlightInvalidField(document.getElementById('exam_date'));
        showNotification('Exam date must be a future date', 'error');
    }

    // 6. Unit validation (ADD THIS SECTION HERE - after line 107)
    const fromUnitElement = document.getElementById('fromUnit');
    const toUnitElement = document.getElementById('toUnit');

    if (fromUnitElement && toUnitElement) {
        const fromUnit = parseInt(fromUnitElement.value);
        const toUnit = parseInt(toUnitElement.value);

        if (!fromUnitElement.value.trim() || !toUnitElement.value.trim()) {
            isValid = false;
            if (!fromUnitElement.value.trim()) highlightInvalidField(fromUnitElement);
            if (!toUnitElement.value.trim()) highlightInvalidField(toUnitElement);
            showNotification('Please enter both From Unit and To Unit', 'error');
        } else if (isNaN(fromUnit) || isNaN(toUnit)) {
            isValid = false;
            if (isNaN(fromUnit)) highlightInvalidField(fromUnitElement);
            if (isNaN(toUnit)) highlightInvalidField(toUnitElement);
            showNotification('Please enter valid unit numbers', 'error');
        } else {
            if (fromUnit > toUnit) {
                isValid = false;
                highlightInvalidField(fromUnitElement);
                highlightInvalidField(toUnitElement);
                showNotification('From Unit cannot be greater than To Unit', 'error');
            }

            if (fromUnit < 1 || toUnit < 1) {
                isValid = false;
                if (fromUnit < 1) highlightInvalidField(fromUnitElement);
                if (toUnit < 1) highlightInvalidField(toUnitElement);
                showNotification('Unit numbers must be 1 or greater', 'error');
            }
        }
    }

    // ✅ If all validations pass, call generateQuestionPaper()
        // ✅ If all validations pass, call generateQuestionPaper()
    if (isValid) {
        // ✅ Extract form data into an object (UPDATED)
        const formData = {
            branch: document.getElementById('branch').value.trim(),
            semester: semester,
            subject: document.getElementById('subject').value.trim(),
            subjectCode: subjectCode,
            paperCode: paperCode,
            totalMarks: totalMarks,
            examDate: document.getElementById('exam_date').value,
            examTime: document.getElementById('exam_time').value,
            examination: document.getElementById('examination').value.trim()
        };

        // Add unit data if the fields exist
        const fromUnitElement = document.getElementById('fromUnit');
        const toUnitElement = document.getElementById('toUnit');

        if (fromUnitElement && toUnitElement) {
            const fromUnit = parseInt(fromUnitElement.value);
            const toUnit = parseInt(toUnitElement.value);
            
            if (!isNaN(fromUnit) && !isNaN(toUnit)) {
                formData.fromUnit = fromUnit;
                formData.toUnit = toUnit;
            }
        }

        console.log('Form Data:', formData); // ✅ For debugging

        generateQuestionPaper(formData);
    }
});

let debounceTimer;  // Variable to hold the debounce timer
// Function to fetch subjects based on selected branch and semester
function fetchSubjects() {
    const branch = document.getElementById('branch').value;  // Get the value of the branch input
    const semester = document.getElementById('semester').value;  // Get the selected semester

    // Clear the previous debounce timer if user is typing again (to reset the waiting time)
    clearTimeout(debounceTimer);

    // Set a new debounce timer to wait 2000ms before making the API call
    debounceTimer = setTimeout(() => {
        // Check if both branch and semester are provided
        if (branch && semester) {
            // Make a GET request to fetch the subjects based on branch and semester
            fetch(`/fetch_subjects?branch=${branch}&semester=${semester}`, {
                method: 'GET',
            })
                .then(response => response.json())  // Parse the JSON response from the server
                .then(data => {
                    const subjectSelect = document.getElementById('subject');  // Get the subject dropdown
                    subjectSelect.innerHTML = '<option value="" disabled selected>Select Subject</option>';  // Clear current subjects

                    // Check if subjects are available
                    if (data && data.length > 0) {
                        // Populate the subject dropdown with the fetched subjects
                        data.forEach(subject => {
                            const option = document.createElement('option');
                            option.value = subject;  // Use the subject name as the value
                            option.textContent = subject;  // Display the subject name
                            subjectSelect.appendChild(option);
                        });
                    } else {
                        // If no subjects found, add an option indicating no subjects available
                        const option = document.createElement('option');
                        option.value = "";
                        option.textContent = "No subjects available for this selection.";
                        subjectSelect.appendChild(option);
                    }
                })
                .catch(error => {
                    console.error('Error fetching subjects:', error);  // Log any errors
                });
        } else {
            // If branch or semester is missing, clear the subject dropdown
            const subjectSelect = document.getElementById('subject');
            subjectSelect.innerHTML = '<option value="" disabled selected>Select Subject</option>';
        }
    }, 1300);  // Wait for 2000ms before executing the function (2 seconds)
}


function generateQuestionPaper(data) {
    showNotification('Question paper generation in progress...', 'info');

    // Add unit fields to the data if they exist
    const fromUnitElement = document.getElementById('fromUnit');
    const toUnitElement = document.getElementById('toUnit');
    
    if (fromUnitElement && toUnitElement) {
        const fromUnit = parseInt(fromUnitElement.value);
        const toUnit = parseInt(toUnitElement.value);
        
        if (!isNaN(fromUnit) && !isNaN(toUnit)) {
            data.fromUnit = fromUnit;
            data.toUnit = toUnit;
        }
    }

    fetch('/generate_question_paper', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Failed to generate question paper');
                });
            }
            return response.blob(); // ✅ Expect binary data (Blob)
        })
        .then(blob => {
            const subject = data.subject || 'Unknown';
            const year = new Date().getFullYear(); // Get current year
            
            // Create unit info for filename
            let unitInfo = '';
            if (data.fromUnit && data.toUnit) {
                if (data.fromUnit === data.toUnit) {
                    unitInfo = `_Unit${data.fromUnit}`;
                } else {
                    unitInfo = `_Units${data.fromUnit}to${data.toUnit}`;
                }
            }

            // ✅ Create a temporary URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // ✅ Create a download link and set filename format with unit info
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${subject}_QuestionPaper${unitInfo}_${year}.docx`);
            document.body.appendChild(link);

            //  Simulate loading for 2 seconds before download
            setTimeout(() => {
                link.click(); //  Trigger download

                //  Cleanup the temporary URL and link
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);

                document.getElementById('questionPaperForm').reset();

                // Show success notification after download
                showNotification('Question paper generated successfully!', 'success');
            }, 2000); //  2-second delay
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification(error.message || 'Failed to generate question paper', 'error');
        });
}



// Highlight invalid field
function highlightInvalidField(field) {
    field.classList.add('invalid');
    field.addEventListener('input', function removeInvalid() {
        field.classList.remove('invalid');
        field.removeEventListener('input', removeInvalid);
    });
}

// Remove invalid highlight
function removeInvalidHighlight(field) {
    field.classList.remove('invalid');
}

// Load user data
function loadUserData() {
    // This would typically fetch user data from the server
    // For now, we'll just set a placeholder username
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        // In a real application, you would fetch this from the server or session
        // For example: fetch('/api/user').then(res => res.json()).then(data => { usernameElement.textContent = data.name; });

        // For demonstration purposes:
        const storedUsername = sessionStorage.getItem('username') || 'User';
        usernameElement.textContent = storedUsername;
    }
}

// Simple notification function
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = `notification ${type}`;
        document.body.appendChild(notification);
    } else {
        notification.className = `notification ${type}`;
    }

    // Set content
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        background-color: var(--card-bg);
        color: var(--text-color);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification.success i {
        color: var(--success-color);
    }
    
    .notification.error i {
        color: var(--error-color);
    }
    
    .invalid {
        border-color: var(--error-color) !important;
        box-shadow: 0 0 0 3px rgba(252, 129, 129, 0.2) !important;
    }
    
    .focused {
        position: relative;
    }
    
    .focused::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }
    
    .focused.focused::after {
        transform: scaleX(1);
    }
`;
document.head.appendChild(notificationStyles);