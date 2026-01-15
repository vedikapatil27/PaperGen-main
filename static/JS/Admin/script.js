document.addEventListener("DOMContentLoaded", () => {
    // Set username from sessionStorage
    const username = sessionStorage.getItem("username")
    setTimeout(() => {
        if (username) {
            // Set the username in the span with the id 'username'
            document.getElementById("username").textContent = username;
        } else {
            // If username is not in sessionStorage, you can set a default value or redirect
            document.getElementById("username").textContent = "Guest";
        }
    }, 1200); // Timeout of 1200 ms
    

    // Helper: Set active sidebar item
    function setActiveSidebarItem(itemSelector) {
        document.querySelectorAll(".sidebar-nav ul li").forEach((item) =>
            item.classList.remove("active")
        )
        const activeItem = document.querySelector(itemSelector)
        if (activeItem) activeItem.classList.add("active")
    }

    // Toggle mobile sidebar
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
    const sidebar = document.getElementById("sidebar")
    mobileMenuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open")
    })


        // ✅ Function to close sidebar on outside click
        function enableOutsideClickToCloseSidebar() {
            document.addEventListener("click", (event) => {
                const isClickInsideSidebar = sidebar.contains(event.target)
                const isClickOnToggle = mobileMenuToggle.contains(event.target)
    
                if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains("open")) {
                    sidebar.classList.remove("open")
                }
            })
        }

    // === Section References ===
    const tabs = document.querySelectorAll(".tab-item")
    const tabContents = document.querySelectorAll(".tab-content")
    const userSection = document.querySelector(".user-section")
    const subjectSection = document.getElementById("subject-section")
    const showSubjectBtn = document.getElementById("show-subject-btn")
    const manageUsersBtn = document.querySelector(".sidebar-nav ul li:nth-child(2)")
    const createSubjectBtn = document.getElementById("create-subject-btn")

    // Show user section with pending tab active
    function showUserSection() {
        userSection.style.display = "block"
        subjectSection.style.display = "none"
        setActiveSidebarItem(".sidebar-nav ul li:nth-child(2)")
        setActiveTab("pending")
    }

    // Show subject section
    function showSubjectSection() {
        userSection.style.display = "none"
        subjectSection.style.display = "block"
        setActiveSidebarItem(".sidebar-nav ul li:nth-child(4)")
        fetchAllSubjects()
        if (sidebar.classList.contains("open")) {
            sidebar.classList.remove("open")
        }
    }

    // Set active tab logic
    function setActiveTab(tabId) {
        tabs.forEach((tab) => tab.classList.remove("active"))
        tabContents.forEach((content) => (content.style.display = "none"))

        const activeTab = document.querySelector(`[data-tab="${tabId}"]`)
        const activeContent = document.getElementById(`${tabId}-content`)

        if (activeTab) activeTab.classList.add("active")
        if (activeContent) activeContent.style.display = "block"
    }

    // Tab switching logic
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const tabId = tab.getAttribute("data-tab")
            setActiveTab(tabId)

            // Ensure only user section is visible when tabs are clicked
            userSection.style.display = "block"
            subjectSection.style.display = "none"

            setActiveSidebarItem(".sidebar-nav ul li:nth-child(2)")
        })
    })

    // Button event: Show Subjects
    showSubjectBtn.addEventListener("click", () => {
        showSubjectSection()
    })

    // Button event: Manage Users
    manageUsersBtn.addEventListener("click", () => {
        showUserSection()
    })

    // Button event: Create Subject (just highlight)
    createSubjectBtn.addEventListener("click", () => {
        setActiveSidebarItem(".sidebar-nav ul li:nth-child(3)")
    })

    // Default setup
    fetchUsers()
    showUserSection() // default to manage user view
    enableOutsideClickToCloseSidebar()
})

function fetchUsers() {
    fetch("/get-users")
        .then((response) => {
            if (!response.ok) {
                //console.error('Failed to fetch users: ', response.statusText);  // Log failure details
                throw new Error("Failed to fetch users")
            }
            return response.json() // Return the JSON response
        })
        .then((users) => {
            //console.log('Users fetched successfully:', users);  // Log the fetched users
            populateUsers(users) // Pass the fetched users to populateUsers
        })
        .catch((error) => {
            //console.error('Error fetching users:', error);  // Log any error that occurs during the fetch or processing
        })
}

// Subject modal handling
const createSubjectBtn = document.getElementById("create-subject-btn")
const subjectModal = document.getElementById("subject-modal")
const closeSubjectModalAdmin = document.getElementById("close-subject-modal")
const cancelSubject = document.getElementById("cancel-subject")
const saveSubject = document.getElementById("save-subject")

// Declare sidebar here, as it's used in openSubjectModal
const sidebar = document.getElementById("sidebar")

function openSubjectModal() {
    subjectModal.style.display = "flex"
    setTimeout(() => {
        subjectModal.classList.add("active")
        sidebar.classList.remove("open")
    }, 10)
}

function closeSubjectModal() {
    subjectModal.classList.remove("active")
    setTimeout(() => {
        subjectModal.style.display = "none"
    }, 300)
}

// Function to validate and create subject
function createSubject() {
    const subjectName = document.getElementById("subject-name").value
    const branch = document.getElementById("branch").value
    const semester = document.getElementById("semester").value

    // Check if any field is empty
    if (!subjectName || !branch || !semester) {
        // If any field is empty, show SweetAlert error
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Missing Information",
            text: "Please fill in all the fields.",
            showConfirmButton: false,
            toast: true,
            timer: 2000,
        })
    } else if (semester < 1 || semester > 8) {
        // Check if semester is between 1 and 8
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Invalid Semester",
            text: "Uh-oh! Semesters go from 1 to 8, not beyond! 😆 Try again!",
            showConfirmButton: false,
            toast: true,
            timer: 2000,
        })
    } else {
        // If all fields are filled, send the data to the server (Python endpoint)
        const subjectData = {
            subject_name: subjectName,
            branch: branch,
            semester: semester,
        }

        fetch("/create_subject", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subjectData),
        })
            .then((response) => response.json())
            .then((data) => {
                // If the server responds successfully
                console.log(data)

                if (data.success) {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Subject Created",
                        text: "The subject has been created successfully.",
                        showConfirmButton: false,
                        toast: true,
                        timer: 2000,
                    })

                    // Reset the form and close the modal
                    document.getElementById("subject-form").reset()
                    closeSubjectModal()
                } else {
                    // If there's an error in the response from the server
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Error",
                        text: data.message || "Something went wrong. Please try again.",
                        showConfirmButton: false,
                        toast: true,
                        timer: 2000,
                    })
                }
            })
            .catch((error) => {
                // Handle network or other errors
                console.error("Error:", error)
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Oops!",
                    text: "An error occurred. Please try again.",
                    showConfirmButton: false,
                    toast: true,
                    timer: 2000,
                })
            })
    }
}

// Function to fetch all subjects
function fetchAllSubjects() {
    fetch("/get_all_subjects")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch subjects")
            }
            return response.json()
        })
        .then((data) => {
            displaySubjects(data.subjects)
        })
        .catch((error) => {
            console.error("Error fetching subjects:", error)
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Error",
                text: "Failed to load subjects. Please try again.",
                showConfirmButton: false,
                toast: true,
                timer: 3000,
            })
        })
}

// Function to display subjects in the UI
function displaySubjects(subjects) {
    const subjectListContainer = document.getElementById("subjectListContainer")
    subjectListContainer.innerHTML = ""

    if (subjects.length === 0) {
        subjectListContainer.innerHTML = '<p class="no-subjects">No subjects found. Create a subject to get started.</p>'
        return
    }

    subjects.forEach((subject, index) => {
        const subjectItem = document.createElement("div")
        subjectItem.className = "subject-item"
        subjectItem.innerHTML = `
              <div class="subject-info">
                  <span class="subject-number">${index + 1}</span>
                  <h3 class="subject-name">${subject.name}</h3>
                  <span class="subject-id">ID: ${subject.id}</span>
              </div>
              <button class="delete-subject-btn" data-id="${subject.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="delete-icon">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
              </button>
          `
        subjectListContainer.appendChild(subjectItem)
    })

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-subject-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const subjectId = this.getAttribute("data-id")
            confirmDeleteSubject(subjectId)
        })
    })
}

// Function to confirm and delete a subject
function confirmDeleteSubject(subjectId) {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3182ce",
        cancelButtonColor: "#fc8181",
        confirmButtonText: "Yes, delete it!",
    }).then((result) => {
        if (result.isConfirmed) {
            deleteSubject(subjectId)
        }
    })
}

// Function to delete a subject
function deleteSubject(subjectId) {
    fetch(`/delete_subject/${subjectId}`, {
        method: "DELETE",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to delete subject")
            }
            return response.json()
        })
        .then((data) => {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Deleted!",
                text: "Subject has been deleted successfully.",
                showConfirmButton: false,
                toast: true,
                timer: 2000,
            })
            // Refresh the subjects list
            fetchAllSubjects()
        })
        .catch((error) => {
            console.error("Error deleting subject:", error)
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Error",
                text: "Failed to delete subject. Please try again.",
                showConfirmButton: false,
                toast: true,
                timer: 3000,
            })
        })
}

createSubjectBtn.addEventListener("click", openSubjectModal)
closeSubjectModalAdmin.addEventListener("click", closeSubjectModal)
cancelSubject.addEventListener("click", closeSubjectModal)

saveSubject.addEventListener("click", createSubject)

// Create user cards
function createUserCard(user) {
    const card = document.createElement("div")
    card.className = "user-card"
    card.setAttribute("data-id", user[0])

    const userInfo = document.createElement("div")
    userInfo.className = "user-info"
    userInfo.innerHTML = `
      <p><strong>ID:</strong> ${user[0]}</p>
      <p><strong>Username:</strong> ${user[1]}</p>
      <p><strong>Email:</strong> ${user[2]}</p>
      <p><strong>Role:</strong> ${user[3]}</p>
      <p>
         <strong>Status:</strong>
         <span class="status-badge status-${user[4]}">${user[4]}</span>
     </p>
     <p>
         <strong>Verification:</strong>
         ${user[5]
           ? '<span class="status-badge status-approved">Email Verified</span>'
           : '<span class="status-badge status-pending">Email Not Verified</span>'}
     </p>
    `;


    const userActions = document.createElement("div")
    userActions.className = "user-actions"

    if (user[4] === "pending") {
        userActions.innerHTML = `
              <button class="action-btn approve-btn" onclick="handleUserAction(${user[0]}, 'approve')">
                  <i class="fas fa-check-circle"></i>
              </button>
              <button class="action-btn reject-btn" onclick="handleUserAction(${user[0]}, 'reject')">
                  <i class="fas fa-times-circle"></i>
              </button>
          `
    } else if (user[4] === "approved") {
        userActions.innerHTML = `
              <button class="action-btn reject-btn" onclick="handleUserAction(${user[0]}, 'restore')">
                  <i class="fas fa-times-circle"></i>
              </button>
          `
    } else if (user[4] === "rejected") {
        userActions.innerHTML = `
          <button class="action-btn restore-btn" onclick="handleUserAction(${user[0]}, 'restore')">
              <i class="fas fa-undo"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteUserAttachment(${user[0]})">
              <i class="fas fa-trash"></i>
          </button>
      `
}

    card.appendChild(userInfo)
    card.appendChild(userActions)

    return card
}

function populateUsers(users) {
    const pendingContainer = document.getElementById("pending-users")
    const approvedContainer = document.getElementById("approved-users")
    const rejectedContainer = document.getElementById("rejected-users")

    pendingContainer.innerHTML = ""
    approvedContainer.innerHTML = ""
    rejectedContainer.innerHTML = ""

    users.forEach((user) => {
        const userCard = createUserCard(user)

        if (user[4] === "pending") {
            pendingContainer.appendChild(userCard)
        } else if (user[4] === "approved") {
            approvedContainer.appendChild(userCard)
        } else if (user[4] === "rejected") {
            rejectedContainer.appendChild(userCard)
        }
    })
}

// Handle user actions (approve, reject, restore)
function handleUserAction(userId, action) {
    console.log(`User ID: ${userId}, Action: ${action}`)

    // Send the action to the backend
    fetch("/update_user_status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, action: action }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data)

            // Show success alert with SweetAlert2
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "User status updated",
                text: data.message,
                showConfirmButton: false,
                toast: true,
                timer: 3000,
            })

            // Refresh the user list or update the UI
            fetchUsers() // Call the function to refresh user list
        })
        .catch((error) => {
            console.error("Error:", error)

            // Show error alert with SweetAlert2
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Oops!",
                text: "An error occurred. Please try again.",
                showConfirmButton: false,
                toast: true,
                timer: 3000,
            })
        })
}  

// Function to delete user attachment
function deleteUserAttachment(userId) {
    Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the user!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3182ce",
        cancelButtonColor: "#fc8181",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/delete_user/${userId}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to delete user");
                    }
                    return response.json();
                })
                .then((data) => {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Deleted!",
                        text: data.message,
                        showConfirmButton: false,
                        toast: true,
                        timer: 2000,
                    });
                    // Refresh the users list
                    fetchUsers();
                })
                .catch((error) => {
                    console.error("Error deleting user attachment:", error);
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Error",
                        text: "Failed to delete user. Please try again.",
                        showConfirmButton: false,
                        toast: true,
                        timer: 3000,
                    });
                });
        }
    });
}