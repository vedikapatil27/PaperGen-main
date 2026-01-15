document.addEventListener('DOMContentLoaded', function () {
    // OTP input formatting and validation
    const otpInput = document.getElementById('otp');
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const form = document.getElementById('otpForm');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Format OTP input to only allow numbers
    otpInput.addEventListener('input', function (e) {
        this.value = this.value.replace(/[^0-9]/g, '');

        // Add animation when all 6 digits are entered
        if (this.value.length === 6) {
            this.classList.add('success');
            setTimeout(() => {
                newPasswordInput.focus();
            }, 300);
        } else {
            this.classList.remove('success');
        }
    });

    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function () {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('bx-hide');
                this.classList.add('bx-show');
            } else {
                input.type = 'password';
                this.classList.remove('bx-show');
                this.classList.add('bx-hide');
            }

            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Password strength checker
    newPasswordInput.addEventListener('input', checkPasswordStrength);

    function checkPasswordStrength() {
        const password = newPasswordInput.value;
        let strength = 0;
        let message = '';

        if (password.length >= 8) strength += 1;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
        if (password.match(/\d/)) strength += 1;
        if (password.match(/[^a-zA-Z\d]/)) strength += 1;

        switch (strength) {
            case 0:
                strengthBar.style.width = '0%';
                strengthBar.style.backgroundColor = 'var(--error-color)';
                strengthText.textContent = 'Password strength';
                break;
            case 1:
                strengthBar.style.width = '25%';
                strengthBar.style.backgroundColor = 'var(--error-color)';
                strengthText.textContent = 'Weak';
                strengthText.style.color = 'var(--error-color)';
                break;
            case 2:
                strengthBar.style.width = '50%';
                strengthBar.style.backgroundColor = 'var(--warning-color)';
                strengthText.textContent = 'Fair';
                strengthText.style.color = 'var(--warning-color)';
                break;
            case 3:
                strengthBar.style.width = '75%';
                strengthBar.style.backgroundColor = 'var(--primary-color)';
                strengthText.textContent = 'Good';
                strengthText.style.color = 'var(--primary-color)';
                break;
            case 4:
                strengthBar.style.width = '100%';
                strengthBar.style.backgroundColor = 'var(--success-color)';
                strengthText.textContent = 'Strong';
                strengthText.style.color = 'var(--success-color)';
                break;
        }
    }

    // Check if passwords match
    confirmPasswordInput.addEventListener('input', function () {
        if (newPasswordInput.value === this.value) {
            this.classList.remove('error');
            this.classList.add('success');

            // Remove error message if it exists
            const errorMessage = this.parentElement.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                errorMessage.remove();
            }
        } else {
            this.classList.remove('success');
            this.classList.add('error');

            // Add error message if it doesn't exist
            let errorMessage = this.parentElement.nextElementSibling;
            if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                errorMessage = document.createElement('div');
                errorMessage.classList.add('error-message');
                errorMessage.innerHTML = '<i class="bx bx-error-circle"></i> Passwords do not match';
                this.parentElement.after(errorMessage);
            }
        }
    });

    // Form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate OTP
        if (otpInput.value.length !== 6) {
            otpInput.classList.add('error');
            showErrorMessage(otpInput, 'Please enter a valid 6-digit OTP');
            return;
        }

        // Regex for password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        // Validate password
        if (!passwordRegex.test(newPasswordInput.value)) {
            newPasswordInput.classList.add('error');
            showErrorMessage(
                newPasswordInput,
                'Password must be at least 8 characters, include an uppercase letter, a number, and a special character.'
            );
            return;
        }

        // Validate password match
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.classList.add('error');
            showErrorMessage(confirmPasswordInput, 'Passwords do not match');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loader"></div>';
        submitBtn.disabled = true;


        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');

        // Form data to send
        const formData = {
            email: email,
            otp: otpInput.value,
            new_password: newPasswordInput.value,
            confirm_password: confirmPasswordInput.value
        };

        try {
            const response = await fetch(`/verify_otp?email={{ email }}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Success animation and redirect
                submitBtn.innerHTML = '<i class="bx bx-check" style="font-size: 24px;"></i>';
                submitBtn.style.backgroundColor = 'var(--success-color)';

                showAlert(data.message, 'success', true);
            } else {
                // ❌ Show error message using SweetAlert
                showAlert(data.error, 'error');

                // Reset button state
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }

        } catch (error) {
            // ❌ Handle network or server error
            showAlert('Something went wrong. Please try again.', 'error');

            // Reset button state
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }
    });


    // ✅ Function to show SweetAlert
    function showAlert(message, type, isSuccess = false) {
        Swal.fire({
            icon: type, // 'success' or 'error'
            title: type === 'success' ? 'Success' : 'Error',
            text: message,
            showConfirmButton: false,
            toast: true,
            timer: 1500, // 1.5 seconds for success and 3 seconds for error
            timerProgressBar: true,
            position: 'top-end', // Top-right corner
            background: '#333', // Dark background
            color: '#fff' // White text
        }).then(() => {
            if (isSuccess) {
                window.location.href = '/login'; // Redirect on success
            }
        });
    }



    function showErrorMessage(input, message) {
        // Remove existing error message
        const parent = input.parentElement;
        let errorMessage = parent.nextElementSibling;
        if (errorMessage && errorMessage.classList.contains('error-message')) {
            errorMessage.remove();
        }

        // Add new error message (inline)
        errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.innerHTML = `<i class="bx bx-error-circle"></i> ${message}`;
        parent.after(errorMessage);

        // Focus on the input
        input.focus();

        // Show SweetAlert error message (toast style)
        Swal.fire({
            position: 'top-end', // Top-right corner
            icon: 'error',
            title: message,
            toast: true,
            showConfirmButton: false,
            timer: 3000, // Display for 3 seconds
            timerProgressBar: true,
            background: '#333',
            color: '#fff'
        });
    }


    // Add ripple effect to button
    const button = document.querySelector('.submit-btn');
    button.addEventListener('mousedown', function (e) {
        const x = e.clientX - this.getBoundingClientRect().left;
        const y = e.clientY - this.getBoundingClientRect().top;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    // Add some initial animations
    setTimeout(() => {
        document.querySelectorAll('.form-group').forEach((group, index) => {
            setTimeout(() => {
                group.style.animation = 'fadeIn 0.5s forwards';
                group.style.opacity = '1';
            }, index * 100);
        });
    }, 300);
});

// Add CSS for the ripple effect and loader
const style = document.createElement('style');
style.textContent = `
.ripple {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
}

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.loader {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.form-group {
    opacity: 0;
}
`;
document.head.appendChild(style);