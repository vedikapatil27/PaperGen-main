// DOM Elements
const sidebar = document.querySelector('.left-sidebar');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const editModal = document.getElementById('edit-modal');
const fileInput = document.getElementById('image');
const fileName = document.getElementById('file-name');
const imagePreview = document.getElementById('image-preview');
const tooltip = document.getElementById('tooltip');
const searchInput = document.getElementById('question-search');
const clearSearchBtn = document.getElementById('clear-search');

// Store state variables
let allQuestions = [];
let currentQuestions = [];
let currentSubjectId = null;
let currentSubjectName = '';
let currentUnit = 'all';
let selectedUnit = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Fetch the username from sessionStorage
    const username = sessionStorage.getItem("username");

    // Check if the username is available
    setTimeout(() => {
        if (username) {
            document.getElementById("username").textContent = username;
        } else {
            document.getElementById("username").textContent = "Guest";
        }
    }, 1200);
    
    fetchSubjects();
    setupEventListeners();
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
        if (window.innerWidth <= 768 &&
            !sidebar.contains(e.target) &&
            e.target !== menuToggle &&
            e.target !== mobileMenuToggle &&
            !mobileMenuToggle.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // File input change event
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileName.textContent = fileInput.files[0].name;

                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                fileName.textContent = 'No file chosen';
                imagePreview.innerHTML = '';
            }
        });
    }

    // Setup tooltip functionality
    document.addEventListener('mouseover', handleTooltip);
    document.addEventListener('mouseout', hideTooltip);
    document.addEventListener('mousemove', moveTooltip);

    // Setup search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() !== '') {
                clearSearchBtn.style.display = 'flex';
            } else {
                clearSearchBtn.style.display = 'none';
            }
        });
        
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            handleSearch();
            searchInput.focus();
        });
    }

    // Setup unit filter button event delegation for sidebar
    document.addEventListener('click', function(e) {
        if (e.target.closest('.unit-filter-btn')) {
            const unitBtn = e.target.closest('.unit-filter-btn');
            const unit = unitBtn.getAttribute('data-unit');
            filterByUnitFromSidebar(unit);
        }
    });
}

// Fetch Subjects
function fetchSubjects() {
    fetch('/get_subjects')
        .then(response => response.json())
        .then(data => {
            const subjectsContainer = document.getElementById('subjects-container');
            subjectsContainer.innerHTML = '';

            if (data.subjects.length > 0) {
                data.subjects.forEach((subject, index) => {
                    const subjectCard = document.createElement('div');
                    subjectCard.className = 'subject-card';
                    subjectCard.dataset.id = subject.id;
                    subjectCard.innerHTML = `
                        <div class="subject-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <h3 class="subject-name">${subject.name}</h3>
                    `;

                    subjectCard.addEventListener('click', () => {
                        selectSubject(subject.id, subject.name);
                    });

                    subjectsContainer.appendChild(subjectCard);
                });
            } else {
                subjectsContainer.innerHTML = '<p class="no-data">No subjects found. Please add questions first.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching subjects:', error);
            showNotification('Failed to load subjects', 'error');
        });
}

// Select Subject - Show units
function selectSubject(subjectId, subjectName) {
    currentSubjectId = subjectId;
    currentSubjectName = subjectName;

    // Update active subject card
    document.querySelectorAll('.subject-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-id="${subjectId}"]`).classList.add('active');

    // Update breadcrumb
    document.getElementById('selected-subject-name').textContent = subjectName;

    // Hide questions container and show units container
    document.getElementById('questions-container').style.display = 'none';
    document.getElementById('units-container').style.display = 'block';

    // Load units for this subject
    loadUnitsForSubject(subjectId);
    
    showNotification(`Selected subject: ${subjectName}`, 'info');
}

// Load Units for Subject
function loadUnitsForSubject(subjectId) {
    fetch(`/get_units?subject_id=${subjectId}`)
        .then(response => response.json())
        .then(data => {
            const unitsGrid = document.getElementById('units-grid');
            unitsGrid.innerHTML = '';

            if (data.units && data.units.length > 0) {
                // Add "All Units" option
                const allUnitsSpan = document.createElement('div');
                allUnitsSpan.className = 'unit-span';
                allUnitsSpan.dataset.unit = 'all';
                allUnitsSpan.innerHTML = `
                    <div class="unit-icon">
                        <i class="fas fa-th-list"></i>
                    </div>
                    <div class="unit-name">All Units</div>
                `;
                allUnitsSpan.addEventListener('click', () => {
                    selectUnit('all', 'All Units');
                });
                unitsGrid.appendChild(allUnitsSpan);

                // Add individual unit options
                data.units.forEach(unit => {
                    const unitSpan = document.createElement('div');
                    unitSpan.className = 'unit-span';
                    unitSpan.dataset.unit = unit;
                    unitSpan.innerHTML = `
                        <div class="unit-icon">
                            <i class="fas fa-bookmark"></i>
                        </div>
                        <div class="unit-name">Unit ${unit}</div>
                    `;
                    unitSpan.addEventListener('click', () => {
                        selectUnit(unit, `Unit ${unit}`);
                    });
                    unitsGrid.appendChild(unitSpan);
                });

                // Update sidebar unit filters
                displayUnitFiltersInSidebar(data.units);
                showUnitFilters();
            } else {
                unitsGrid.innerHTML = '<p class="no-data">No units found for this subject.</p>';
                hideUnitFilters();
            }
        })
        .catch(error => {
            console.error('Error loading units:', error);
            showNotification('Failed to load units', 'error');
            hideUnitFilters();
        });
}

// Select Unit - Show questions
function selectUnit(unit, unitName) {
    selectedUnit = unit;
    currentUnit = unit;

    // Update active unit span
    document.querySelectorAll('.unit-span').forEach(span => {
        span.classList.remove('active');
    });
    document.querySelector(`[data-unit="${unit}"]`).classList.add('active');

    // Update breadcrumbs
    document.getElementById('breadcrumb-subject').textContent = currentSubjectName;
    document.getElementById('breadcrumb-unit').textContent = unitName;

    // Hide units container and show questions container
    document.getElementById('units-container').style.display = 'none';
    document.getElementById('questions-container').style.display = 'block';

    // Load and display questions
    loadQuestionsForUnit(currentSubjectId, unit);
    
    // Update sidebar active button
    updateActiveUnitButton();
    
    showNotification(`Showing questions from ${unitName}`, 'info');
}

// Load Questions for Unit
function loadQuestionsForUnit(subjectId, unit) {
    fetch(`/get_questions?subject_id=${subjectId}`)
        .then(response => response.json())
        .then(data => {
            if (data.questions.length > 0) {
                allQuestions = data.questions;
                
                // Filter questions based on selected unit
                let filteredQuestions;
                if (unit === 'all') {
                    filteredQuestions = allQuestions;
                } else {
                    filteredQuestions = allQuestions.filter(q => q.unit == unit);
                }
                
                currentQuestions = filteredQuestions;
                displayQuestions(filteredQuestions);
            } else {
                allQuestions = [];
                currentQuestions = [];
                document.getElementById('questions-grid').innerHTML = 
                    '<div class="no-data">No questions found for this selection.</div>';
            }
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            showNotification('Failed to load questions', 'error');
        });
}

// Filter by Unit from Sidebar
function filterByUnitFromSidebar(unit) {
    if (!currentSubjectId) {
        showNotification('Please select a subject first', 'warning');
        return;
    }

    currentUnit = unit;
    updateActiveUnitButton();
    
    let filteredQuestions;
    if (unit === 'all') {
        filteredQuestions = allQuestions;
    } else {
        filteredQuestions = allQuestions.filter(q => q.unit == unit);
    }
    
    currentQuestions = filteredQuestions;
    displayQuestions(filteredQuestions);
    
    // Update breadcrumb
    const unitText = unit === 'all' ? 'All Units' : `Unit ${unit}`;
    document.getElementById('breadcrumb-unit').textContent = unitText;
    
    // Clear search
    if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
    }
    
    // Show questions container if not visible
    if (document.getElementById('questions-container').style.display === 'none') {
        document.getElementById('units-container').style.display = 'none';
        document.getElementById('questions-container').style.display = 'block';
    }
    
    showNotification(`Filtered by ${unitText}`, 'info');
}

// Display Unit Filters in Sidebar
function displayUnitFiltersInSidebar(units) {
    const unitButtonsSidebar = document.getElementById('unit-buttons-sidebar');
    if (!unitButtonsSidebar) return;
    
    unitButtonsSidebar.innerHTML = '';
    
    units.forEach((unit, index) => {
        const listItem = document.createElement('li');
        
        const button = document.createElement('button');
        button.className = 'unit-filter-btn';
        button.setAttribute('data-unit', unit);
        button.style.animationDelay = `${(index + 1) * 0.1}s`;
        button.innerHTML = `<i class="fas fa-bookmark"></i><span>Unit ${unit}</span>`;
        
        listItem.appendChild(button);
        unitButtonsSidebar.appendChild(listItem);
    });
    
    currentUnit = 'all';
    updateActiveUnitButton();
}

// Update Active Unit Button
function updateActiveUnitButton() {
    document.querySelectorAll('.unit-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[data-unit="${currentUnit}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        
        activeButton.style.transform = 'translateX(5px)';
        setTimeout(() => {
            activeButton.style.transform = '';
        }, 200);
    }
}

// Show/Hide Unit Filters
function showUnitFilters() {
    const unitFiltersSidebar = document.getElementById('unit-filters-sidebar');
    if (unitFiltersSidebar) {
        unitFiltersSidebar.style.display = 'block';
        setTimeout(() => {
            unitFiltersSidebar.style.opacity = '1';
            unitFiltersSidebar.style.transform = 'translateY(0)';
        }, 50);
    }
}

function hideUnitFilters() {
    const unitFiltersSidebar = document.getElementById('unit-filters-sidebar');
    if (unitFiltersSidebar) {
        unitFiltersSidebar.style.opacity = '0';
        unitFiltersSidebar.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            unitFiltersSidebar.style.display = 'none';
        }, 300);
    }
}

// Go Back to Units
function goBackToUnits() {
    document.getElementById('questions-container').style.display = 'none';
    document.getElementById('units-container').style.display = 'block';
    
    // Clear search
    if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (currentQuestions.length > 0) {
        if (searchTerm === '') {
            displayQuestions(currentQuestions);
        } else {
            const matchedQuestions = [];
            const unmatchedQuestions = [];
            
            currentQuestions.forEach(question => {
                if (question.text.toLowerCase().includes(searchTerm)) {
                    matchedQuestions.push(question);
                } else {
                    unmatchedQuestions.push(question);
                }
            });
            
            const sortedQuestions = [...matchedQuestions, ...unmatchedQuestions];
            
            if (matchedQuestions.length === 0) {
                const unitText = currentUnit === 'all' ? 'All Units' : `Unit ${currentUnit}`;
                document.getElementById('questions-grid').innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No questions found matching "${searchTerm}" in ${unitText}</p>
                        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="clearSearch()">
                            Clear Search
                        </button>
                    </div>
                `;
            } else {
                displayQuestions(sortedQuestions, searchTerm);
            }
        }
    }
}

// Clear search
function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        handleSearch();
    }
}

// Display Questions
function displayQuestions(questions, searchTerm = '') {
    const questionsGrid = document.getElementById('questions-grid');
    if (!questionsGrid) return;
    
    questionsGrid.innerHTML = '';

    if (!questions || questions.length === 0) {
        const unitText = currentUnit === 'all' ? 'this subject' : `Unit ${currentUnit}`;
        questionsGrid.innerHTML = `
            <div class="no-data">
                <i class="fas fa-question-circle" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No questions found for ${unitText}</p>
            </div>
        `;
        return;
    }

    questions.forEach(question => {
        const card = document.createElement('div');
        card.className = 'question-card';
        
        if (searchTerm && question.text.toLowerCase().includes(searchTerm.toLowerCase())) {
            card.classList.add('search-match');
        }

        const editSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>`;
        
        const deleteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>`;

        const highlightedText = searchTerm ? highlightText(question.text, searchTerm) : question.text;

        card.innerHTML = `
            <div class="question-unit-badge">Unit ${question.unit}</div>
            <div class="question-header">
                <div class="question-text">${highlightedText}</div>
            </div>
            <div class="question-details">
                <div class="detail-item">
                    <span class="detail-label">Marks</span>
                    <span class="detail-value">${question.marks}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">RBT Level</span>
                    <span class="detail-value">${question.rbt_level}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">CO</span>
                    <span class="detail-value">${question.co}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">PI</span>
                    <span class="detail-value">${question.pi}</span>
                </div>
            </div>
            ${question.image 
                ? `<div class="question-image">
                    <img src="${question.image.replace(/\\/g, '/').includes('static/uploads/') 
                        ? question.image.replace(/\\/g, '/') 
                        : 'static/uploads/' + question.image.replace(/\\/g, '/').replace(/^\//, '')}" 
                        alt="Question Image">
                   </div>`
                : ''}
            <div class="question-actions">
                <button class="action-btn edit-btn" 
                    data-tooltip="Edit this question"
                    onclick="openEditModal(${question.id}, '${escapeString(question.text)}', ${question.marks}, '${question.rbt_level}', '${question.co}', '${question.pi}', '${question.image ? (question.image.replace(/\\/g, '/').includes("static/uploads/") ? question.image.replace(/\\/g, '/').replace(/^\//, '') : "static/uploads/" + question.image.replace(/\\/g, '/').replace(/^\//, '')) : ""}')">
                    ${editSvg}
                </button>
                <button class="action-btn delete-btn" 
                    data-tooltip="Delete this question"
                    onclick="deleteQuestion(${question.id})">
                    ${deleteSvg}
                </button>
            </div>
        `;

        questionsGrid.appendChild(card);
    });
}

// Utility Functions
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight-text">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Tooltip Functions
function handleTooltip(e) {
    const target = e.target;
    
    if (target.hasAttribute('data-tooltip') || 
        (target.parentElement && target.parentElement.hasAttribute('data-tooltip'))) {
        
        const tooltipElement = target.hasAttribute('data-tooltip') ? target : target.parentElement;
        const tooltipText = tooltipElement.getAttribute('data-tooltip');
        
        showTooltip(tooltipText, e);
    }
}

function showTooltip(text, e) {
    tooltip.textContent = text;
    tooltip.classList.add('visible');
    moveTooltip(e);
}

function hideTooltip() {
    tooltip.classList.remove('visible');
}

function moveTooltip(e) {
    if (tooltip.classList.contains('visible')) {
        const x = e.clientX;
        const y = e.clientY - 10;
        
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        
        let posX = x - (tooltipWidth / 2);
        let posY = y - tooltipHeight - 10;
        
        if (posX < 10) posX = 10;
        if (posX + tooltipWidth > window.innerWidth - 10) {
            posX = window.innerWidth - tooltipWidth - 10;
        }
        
        if (posY < 10) {
            posY = y + 25;
        }
        
        tooltip.style.left = `${posX}px`;
        tooltip.style.top = `${posY}px`;
    }
}

// Modal Functions
function openEditModal(id, text, marks, rbtLevel, co, pi, image) {
    document.getElementById('question_id').value = id;
    document.getElementById('question').value = text;
    document.getElementById('marks').value = marks;
    document.getElementById('rbt_level').value = rbtLevel;
    document.getElementById('co').value = co;
    document.getElementById('pi').value = pi;

    document.getElementById('file-name').textContent = 'No file chosen';

    if (image) {
        document.getElementById('image-preview').innerHTML =
            `<img src="${image}" alt="Question Image">`;
    } else {
        document.getElementById('image-preview').innerHTML = '';
    }

    editModal.style.display = 'flex';
    setTimeout(() => {
        editModal.classList.add('active');
    }, 10);
}

function closeModal() {
    editModal.classList.remove('active');
    setTimeout(() => {
        editModal.style.display = 'none';
    }, 300);
}

function updateQuestion() {
    const form = document.getElementById('edit-form');
    const formData = new FormData(form);

    fetch(`/update_question`, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Refresh questions for current selection
                if (currentSubjectId && currentUnit) {
                    loadQuestionsForUnit(currentSubjectId, currentUnit);
                }

                closeModal();
                showNotification(data.message, 'success');
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error updating question:', error);
            showNotification('Failed to update question', 'error');
        });
}

function deleteQuestion(id) {
    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
        fetch(`/delete_question/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                // Refresh questions for current selection
                if (currentSubjectId && currentUnit) {
                    loadQuestionsForUnit(currentSubjectId, currentUnit);
                }

                showNotification(data.message, 'success');
            })
            .catch(error => {
                console.error('Error deleting question:', error);
                showNotification('Failed to delete question', 'error');
            });
    }
}

// Notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add notification styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--card-bg);
                border: 2px solid;
                border-radius: 0.5rem;
                padding: 1rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                min-width: 300px;
                max-width: 500px;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }
            
            .notification.success { border-color: #22c55e; color: #22c55e; }
            .notification.error { border-color: #ef4444; color: #ef4444; }
            .notification.warning { border-color: #f59e0b; color: #f59e0b; }
            .notification.info { border-color: var(--primary-color); color: var(--primary-color); }
            
            .notification.show { transform: translateX(0); }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .notification-content i:first-child {
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            
            .notification-content span {
                flex: 1;
                font-weight: 500;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 0.25rem;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            }
            
            .notification-close:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.1);
            }
            
            @media (max-width: 768px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to body
    document.body.appendChild(notification);

    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}