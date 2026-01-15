// DOM Elements
const menuToggle = document.getElementById('menu-toggle');
const leftSidebar = document.querySelector('.left-sidebar');
const drawerToggle = document.querySelector('.drawer-toggle');
const mobileDrawer = document.querySelector('.mobile-drawer');
const closeDrawer = document.querySelector('.close-drawer');
const questionInput = document.getElementById('questionInput');
const matchedQuestionElement = document.getElementById('matchedQuestion');
const mobileMatchedQuestion = document.getElementById('mobileMatchedQuestion');
const matchedQuestionsInput = document.getElementById('matchedQuestionsInput');
const fileInput = document.getElementById('question_image');
const fileName = document.getElementById('file-name');
const form = document.querySelector('form');


// Fetch the username from sessionStorage
const username = sessionStorage.getItem("username");

setTimeout(() => {
    if (username) {
        // Set the username in the span with the id 'username'
        document.getElementById("username").textContent = username;
    } else {
        // If username is not in sessionStorage, you can set a default value or redirect
        document.getElementById("username").textContent = "Guest";
    }
}, 1200); // Timeout of 1200 ms


// Store fetched questions
let questions = [];
let searchTimeout;

// Fetch user-specific questions on page load
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/fetch_questions");
        questions = await response.json();
    } catch (error) {
        console.error("Error fetching questions:", error);
        // For demo purposes, let's add some sample questions
        questions = [
            "What is the principle of conservation of energy?",
            "Explain the concept of inheritance in object-oriented programming.",
            "Describe the process of photosynthesis in plants.",
            "What are the key features of a relational database?",
            "Explain the working of a transistor."
        ];
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




form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const branch = document.getElementById('branch').value.trim();
    const semester = document.getElementById('semester').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const unit = document.getElementById('unit').value.trim(); // Add this line
    const questionText = questionInput.value.trim();
    const marks = document.getElementById('marks').value.trim();
    const rbtLevel = document.getElementById('rbt_level').value.trim();
    const co = document.getElementById('co').value.trim();
    const pi = document.getElementById('pi').value.trim();
    const matchedQuestions = matchedQuestionsInput.value ? JSON.parse(matchedQuestionsInput.value) : [];
    const file = fileInput.files.length > 0 ? fileInput.files[0] : null;

    // ✅ Validation for empty fields (updated to include unit)
    if (!branch || !semester || !subject || !unit || !questionText || !marks || !rbtLevel || !co || !pi) {
        Swal.fire({
            position: 'top-end',
            icon: 'warning',
            title: 'Oops...',
            text: 'Please fill all the required fields!',
            toast: true,
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    // Validate unit number (add this new validation block)
    const unitNumber = parseInt(unit);
    if (isNaN(unitNumber) || unitNumber < 1) {
        Swal.fire({
            position: 'top-end',
            icon: 'warning',
            title: 'Invalid Unit',
            text: 'Please enter a valid unit number (1 or greater)!',
            toast: true,
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    const marksValue = parseInt(marks);
    if (isNaN(marksValue) || marksValue < 1 || marksValue > 12) {
       Swal.fire({
           position: 'top-end',
           icon: 'warning',
           title: 'Invalid Marks!',
           text: 'Marks must be between 1 and 12.',
           toast: true,
           showConfirmButton: false,
           timer: 2000
        });
    return;
}

    // ✅ If matched questions exist, block submission and show funny alert
    if (matchedQuestions.length > 0) {
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'Similar Questions Found!',
            text: `There are ${matchedQuestions.length} similar questions already added. Please review them first to resolve.!`,
            toast: true,
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    // Create object to pass to the function (updated to include unit)
    const formData = {
        branch,
        semester,
        subject,
        unit, // Add this line
        questionText,
        marks,
        rbtLevel,
        co,
        pi
    };

    // ✅ Add file only if it exists
    if (file) {
        formData.file = file;
    }

    // Call the function to handle submission
    submitQuestion(formData);
});

// Function to handle submission
async function submitQuestion(data) {
    try {
        const formData = new FormData();
        // ✅ Append only non-null values
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        const response = await fetch('/add_question', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log(response);


        // ✅ Handle response based on status
        if (response.ok) {
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: result.message || 'Question added successfully!',
                toast: true,
                showConfirmButton: false,
                timer: 1500
            });

            // ✅ Reset the form after successful submission
            document.getElementById('addQuestionForm').reset();
            matchedQuestionElement.innerHTML = ''; // Clear matched questions display
            mobileMatchedQuestion.innerHTML = ''; // Clear mobile display
            fileName.textContent = 'No file chosen'; // Reset file label
        } else {
            Swal.fire({
                position: 'top-end',
                icon: 'warning',
                title: 'Failed to add question!',
                text: result.message || 'Please try again.',
                toast: true,
                showConfirmButton: false,
                timer: 1500
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'An error occurred!',
            text: 'Please try again later.',
            toast: true,
            showConfirmButton: false,
            timer: 1500
        });
    }
}


// Handle question input typing
questionInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        let inputText = questionInput.value;
        searchQuestion(inputText);
    }, 800);
});

// Search for matching questions
function searchQuestion(inputText) {
    const searchTerm = inputText.toLowerCase();
    const matchedQuestions = questions.filter(q => q.toLowerCase().includes(searchTerm));

    if (matchedQuestions.length > 0) {
        let listHTML = "<ul>";
        matchedQuestions.forEach(question => {
            listHTML += `<li>${question}</li>`;
        });
        listHTML += "</ul>";
        matchedQuestionElement.innerHTML = listHTML;
        mobileMatchedQuestion.innerHTML = listHTML;

        // Store matched questions in hidden input field as JSON
        matchedQuestionsInput.value = JSON.stringify(matchedQuestions);
    } else {
        matchedQuestionElement.innerHTML = "<p>No match found</p>";
        mobileMatchedQuestion.innerHTML = "<p>No match found</p>";
        matchedQuestionsInput.value = ""; // Clear input if no matches
    }
}

// File input change handler
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileName.textContent = fileInput.files[0].name;
    } else {
        fileName.textContent = "No file chosen";
    }
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    leftSidebar.classList.toggle('open');
});

// Mobile drawer toggle
drawerToggle.addEventListener('click', () => {
    mobileDrawer.classList.add('open');
});

// Close mobile drawer
closeDrawer.addEventListener('click', () => {
    mobileDrawer.classList.remove('open');
});

// Close sidebars when clicking outside
document.addEventListener('click', (e) => {
    // Close left sidebar on mobile when clicking outside
    if (window.innerWidth <= 768 &&
        !e.target.closest('.left-sidebar') &&
        !e.target.closest('#menu-toggle') &&
        leftSidebar.classList.contains('open')) {
        leftSidebar.classList.remove('open');
    }

    // Close mobile drawer when clicking outside
    if (!e.target.closest('.mobile-drawer') &&
        !e.target.closest('.drawer-toggle') &&
        mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        leftSidebar.classList.remove('open');
    }
});