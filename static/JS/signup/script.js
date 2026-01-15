document.addEventListener('DOMContentLoaded', function () {
    // Select all password fields
    const passwordFields = document.querySelectorAll('input[type="password"]');
    const usernameInput = document.querySelector('#username');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const confirmPasswordInput = document.querySelector('#confirm-password');
    const roleSelect = document.querySelector('#role');
    
    // Validation requirement elements
    const validationRequirements = document.querySelector('#validation-requirements');
    const lengthRequirement = document.querySelector('#length-requirement');
    const uppercaseRequirement = document.querySelector('#uppercase-requirement');
    const numberRequirement = document.querySelector('#number-requirement');
    const specialRequirement = document.querySelector('#special-requirement');
    const usernameRequirement = document.querySelector('#username-requirement');
    const passwordsMatchRequirement = document.querySelector('#passwords-match-requirement');
    

    // Add toggle password visibility functionality
    passwordFields.forEach(passwordInput => {
        // Create toggle button
        const togglePassword = document.createElement("button");
        togglePassword.type = "button"; // Prevent form submission
        togglePassword.className = "toggle-password";
        togglePassword.innerHTML = '<i class="fas fa-eye-slash"></i>';
        togglePassword.setAttribute("aria-label", "Toggle password visibility");

        // Add the toggle button to the password field container
        passwordInput.parentElement.appendChild(togglePassword);

        // Add event listener to toggle visibility
        togglePassword.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent form submission
            e.stopPropagation(); // Stop event from bubbling

            // Toggle password visibility
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                this.innerHTML = '<i class="fas fa-eye"></i>';
            } else {
                passwordInput.type = "password";
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            }

            // Focus back on the input
            passwordInput.focus();
        });
    });

    // Show validation requirements when any input is focused
    const allInputs = [usernameInput, passwordInput, confirmPasswordInput];
    allInputs.forEach(input => {
        input.addEventListener('focus', function() {
            validationRequirements.classList.add('show');
        });
        
        input.addEventListener('input', function() {
            validationRequirements.classList.add('show');
        });
    });

    // Real-time username validation
    usernameInput.addEventListener('input', function() {
        validateUsername();
    });

    // Real-time password validation
    passwordInput.addEventListener('input', function() {
        validatePassword();
        if (confirmPasswordInput.value) {
            validatePasswordsMatch();
        }
    });

    // Real-time confirm password validation
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordsMatch();
    });

    // Username validation function
    function validateUsername() {
        const username = usernameInput.value.trim();
        const isValid = username.length >= 3;
        
        // Update icon in username requirement
        const icon = usernameRequirement.querySelector('i');
        if (isValid) {
            icon.className = 'fas fa-check-circle';
            usernameRequirement.classList.add('valid-text');
        } else {
            icon.className = 'fas fa-times-circle';
            usernameRequirement.classList.remove('valid-text');
        }
        
        
        return isValid;
    }

    // Password validation function
    function validatePassword() {
        const password = passwordInput.value;
        
        // Check each requirement
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[@$!%*?&#]/.test(password);
        
        // Update requirement list items
        updateRequirement(lengthRequirement, hasLength);
        updateRequirement(uppercaseRequirement, hasUppercase);
        updateRequirement(numberRequirement, hasNumber);
        updateRequirement(specialRequirement, hasSpecial);
        
        // Update validation icon next to input
        const isValid = hasLength && hasUppercase && hasNumber && hasSpecial;
        
        return isValid;
    }

    // Passwords match validation function
    function validatePasswordsMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const doMatch = password === confirmPassword && confirmPassword !== '';
        
        // Update icon in passwords match requirement
        const icon = passwordsMatchRequirement.querySelector('i');
        if (doMatch) {
            icon.className = 'fas fa-check-circle';
            passwordsMatchRequirement.classList.add('valid-text');
        } else {
            icon.className = 'fas fa-times-circle';
            passwordsMatchRequirement.classList.remove('valid-text');
        }
        
        
        return doMatch;
    }

    // Helper function to update requirement items
    function updateRequirement(element, isValid) {
        const icon = element.querySelector('i');
        if (isValid) {
            icon.className = 'fas fa-check-circle';
            element.classList.add('valid-text');
        } else {
            icon.className = 'fas fa-times-circle';
            element.classList.remove('valid-text');
        }
    }

    // ✅ Show error using SweetAlert
    function showError(input, message) {
        input.style.borderColor = 'red';
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: message,
                toast: true,
                showConfirmButton: false,
                timer: 4000
            });
        } else {
            console.error('SweetAlert is not defined. Please include the SweetAlert library.');
            alert(message); // Fallback to a basic alert
        }
    }

    // ✅ Show success or error messages using SweetAlert
    function showMessage(type, message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                position: 'top-end',
                icon: type, // 'success' or 'error'
                title: message,
                toast: true,
                showConfirmButton: false,
                timer: 2000
            });
        } else {
            console.error('SweetAlert is not defined. Please include the SweetAlert library.');
            alert(message); // Fallback to a basic alert
        }
    }

    // ✅ Handle form submission
    function submitForm() {
        const signupBtn = document.querySelector('.signup-btn');
        signupBtn.textContent = 'Creating Account...';
        signupBtn.style.opacity = '0.7';
        signupBtn.disabled = true;


        setTimeout(() => {
            // ✅ Prepare data to send to Flask backend
        const data = {
            username: usernameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            confirm_password: confirmPasswordInput.value,
            role: roleSelect.value
        };

        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    showMessage('success', data.message);
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    showMessage('error', data.message);
                    resetButtonState(signupBtn);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('error', 'An error occurred. Please try again.');
                resetButtonState(signupBtn);
            });
        }, 1200);

    }

    // ✅ Validate form inputs
    function validateForm() {
        let isValid = true;
        console.log('functioncalled');

        // Show validation requirements
        validationRequirements.classList.add('show');

        // ✅ Reset input borders
        [usernameInput, emailInput, passwordInput, confirmPasswordInput, roleSelect].forEach(input => {
            input.style.borderColor = '';
        });

        // ✅ Username validation
        if (!validateUsername()) {
            showError(usernameInput, 'Username is required and must be at least 3 characters');
            isValid = false;
        }

        // ✅ Email validation
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Invalid email format');
            isValid = false;
        }

        // ✅ Password strength validation
        if (!validatePassword()) {
            showError(passwordInput, 'Password must meet all requirements');
            isValid = false;
        }

        // ✅ Password match validation
        if (!validatePasswordsMatch()) {
            showError(confirmPasswordInput, 'Passwords do not match');
            isValid = false;
        }

        // ✅ Role validation
        if (!roleSelect.value) {
            showError(roleSelect, 'Role is required');
            isValid = false;
        }

        return isValid;
    }

    // ✅ Trigger validation and submission on button click
    document.querySelector('.signup-btn').addEventListener('click', (e) => {
        e.preventDefault(); // ✅ Prevent default form submission

        if (validateForm()) {
            submitForm(); // ✅ Only call POST if validation passes
        }
    });

    // ✅ Reset button state after failure
    function resetButtonState(button) {
        button.textContent = 'Sign Up';
        button.style.opacity = '1';
        button.disabled = false;
    }

    // ✅ Email and password format validators
    function validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    function isValidPassword(password) {
        const re = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return re.test(password);
    }

    // Reset border color on input focus
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.style.borderColor = '#4299e1';

            // Remove error message if exists
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    });

    // Add subtle animation to the form on load
    const signupBox = document.querySelector('.signup-box');
    setTimeout(() => {
        signupBox.style.opacity = '1';
    }, 100);
    
    // Initialize validation on page load but keep requirements hidden
    validatePassword();
    validateUsername();
    if (confirmPasswordInput.value) {
        validatePasswordsMatch();
    }
});