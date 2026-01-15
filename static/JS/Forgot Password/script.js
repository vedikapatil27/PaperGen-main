// Add ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousedown', function(e) {
        const x = e.clientX - e.target.getBoundingClientRect().left;
        const y = e.clientY - e.target.getBoundingClientRect().top;
        
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const email = document.getElementById('email').value;

        // Email validation using regex pattern
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email) {
            Swal.fire({
                position: 'top-end',
                icon: 'warning',
                title: 'Please enter your email address!',
                toast: true,
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        if (!emailPattern.test(email)) {
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'Please enter a valid email address!',
                toast: true,
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        try {
            const response = await fetch('/forgot_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: data.message,
                    toast: true,
                    showConfirmButton: false,
                    timer: 1500
                });

                setTimeout(() => {
                    window.location.href = `/verify_otp?email=${encodeURIComponent(email)}`;
                }, 1500); // Redirect after showing success message
            } else {
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: data.error || 'An error occurred while sending OTP.',
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
                title: 'Failed to send OTP. Please try again later.',
                toast: true,
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
});

