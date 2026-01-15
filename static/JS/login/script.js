document.addEventListener("DOMContentLoaded", () => {
    // Get form elements
    const loginForm = document.getElementById("loginForm")
    const usernameInput = document.getElementById("username")
    const passwordInput = document.getElementById("password")
  
    // Add focus and blur effects for input fields
    const inputFields = document.querySelectorAll(".input-field input")
  
    inputFields.forEach((input) => {
      // Add focus effect
      input.addEventListener("focus", function () {
        this.parentElement.style.boxShadow = "0 0 0 3px rgba(66, 153, 225, 0.3)"
        this.parentElement.style.borderColor = "#4299e1"
      })
  
      // Remove focus effect
      input.addEventListener("blur", function () {
        this.parentElement.style.boxShadow = "none"
  
        // Keep border color if input has value
        if (this.value.trim() === "") {
          this.parentElement.style.borderColor = "#4a5568"
        }
      })
    })
  
    // Form submission
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
  
      // Simple validation
      if (usernameInput.value.trim() === "") {
        showError(usernameInput, "Username is required")
        return
      }
  
      if (passwordInput.value.trim() === "") {
        showError(passwordInput, "Password is required")
        return
      }
  
      // Simulate login - in a real app, you would send this to your server
      simulateLogin(usernameInput.value, passwordInput.value)
    })
  
    // Show error function
    function showError(input, message) {
      const inputGroup = input.closest(".input-group")
  
      // Remove any existing error message
      const existingError = inputGroup.querySelector(".error-message")
      if (existingError) {
        existingError.remove()
      }
  
      // Create and append error message
      const errorDiv = document.createElement("div")
      errorDiv.className = "error-message"
      errorDiv.textContent = message
  
      inputGroup.appendChild(errorDiv)
  
      // Highlight input
      input.parentElement.style.borderColor = "#fc8181"
      input.parentElement.style.boxShadow = "0 0 0 3px rgba(252, 129, 129, 0.2)"
  
      // Focus the input
      input.focus()
  
      // Remove error after 3 seconds
      setTimeout(() => {
        errorDiv.remove()
        if (input.value.trim() !== "") {
          input.parentElement.style.borderColor = "#4299e1"
          input.parentElement.style.boxShadow = "0 0 0 3px rgba(66, 153, 225, 0.2)"
        } else {
          input.parentElement.style.borderColor = "#4a5568"
          input.parentElement.style.boxShadow = "none"
        }
      }, 3000)
    }
  
    function simulateLogin(username, password) {
      const loginBtn = document.querySelector(".login-btn");
      const originalText = loginBtn.textContent;
  
      // ✅ Show loading state on button
      loginBtn.textContent = "Logging in...";
      loginBtn.disabled = true;
      loginBtn.style.opacity = "0.7";
  
      // ✅ Send POST request to Flask backend
      fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
      })
      .then(response => response.json())
      .then(data => {
          if (data.status === "success") {
              // ✅ Success notification
              Swal.fire({
                  position: 'top-end', // Top-right corner
                  icon: 'success',
                  title: data.message,
                  toast: true,
                  showConfirmButton: false,
                  timer: 1500
              });
  
              // ✅ Redirect to appropriate page after success
              setTimeout(() => {
                  sessionStorage.setItem('hasAccess', true);
                  window.location.href = data.redirect_url;
              }, 1500);
          } else {
              // ✅ Error notification
              Swal.fire({
                  position: 'top-end',
                  icon: 'error',
                  title: 'Login Failed!',
                  text: data.message,
                  showConfirmButton: false,
                  toast: true,
                  timer: 2000
              });
          }
      })
      .catch(error => {
          console.error("Error:", error);
          Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: 'Oops!',
              text: 'An error occurred. Please try again.',
              showConfirmButton: false,
              toast: true,
              timer: 2000
          });
      })
      .finally(() => {
          // ✅ Reset button state
          loginBtn.textContent = originalText;
          loginBtn.disabled = false;
          loginBtn.style.opacity = "1";
      });
  }
  
  
  
    // Password visibility toggle - fixed positioning
    // Create a button element instead of an i element for better accessibility
    const togglePassword = document.createElement("button")
    togglePassword.type = "button" // Prevent form submission
    togglePassword.className = "toggle-password"
    togglePassword.innerHTML = '<i class="fas fa-eye-slash"></i>'
    togglePassword.setAttribute("aria-label", "Toggle password visibility")
  
    // Add the toggle button to the password field container
    passwordInput.parentElement.appendChild(togglePassword)
  
    togglePassword.addEventListener("click", function (e) {
      e.preventDefault() // Prevent any default behavior
      e.stopPropagation() // Stop event from bubbling
  
      if (passwordInput.type === "password") {
        passwordInput.type = "text"
        this.innerHTML = '<i class="fas fa-eye"></i>'
      } else {
        passwordInput.type = "password"
        this.innerHTML = '<i class="fas fa-eye-slash"></i>'
      }
  
      // Focus back on the input
      passwordInput.focus()
    })
  })
  
  