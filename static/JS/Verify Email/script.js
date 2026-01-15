document.addEventListener("DOMContentLoaded", () => {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")
  
    // Show loading state
    const loadingState = document.getElementById("loading-state")
    const successState = document.getElementById("success-state")
    const errorState = document.getElementById("error-state")
    const errorMessage = document.getElementById("error-message")
  
    // Add scroll effect for navbar
    window.addEventListener("scroll", () => {
      const navbar = document.querySelector(".navbar")
      if (window.scrollY > 10) {
        navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)"
        navbar.style.backgroundColor = "rgba(23, 25, 35, 0.95)"
      } else {
        navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)"
        navbar.style.backgroundColor = "var(--bg-dark)"
      }
    })
  
    // Add hover effect for logo
    const logo = document.querySelector(".logo-small")
    logo.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.05)"
    })
  
    logo.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)"
    })
  
    // Function to show state with animation
    function showState(element) {
      element.classList.remove("hidden")
      setTimeout(() => {
        element.classList.add("show")
      }, 10)
    }
  
    // Function to hide state with animation
    function hideState(element) {
      element.classList.remove("show")
      setTimeout(() => {
        element.classList.add("hidden")
      }, 300)
    }
  
    // Verify the email
    verifyEmail(token)
  
    // Function to verify email
    function verifyEmail(token) {
      // Simulate a delay for demonstration purposes
      setTimeout(() => {
        fetch(`/verify-email/${token}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            // Hide loading state with animation
            hideState(loadingState)
  
            if (data.success) {
              // Show success state with animation
              showState(successState)
  
              // Show success message with SweetAlert2
              Swal.fire({
                position: 'top-end',
                icon: 'success', // 'success' or 'error'
                title: 'Your email has been successfully verified.',
                toast: true,
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                // Redirect to login page
                window.location.href = "/login"
              })
  
              // Redirect to login page after 5 seconds
              setTimeout(() => {
                window.location.href = "/login"
              }, 5000)
            } else {
              // Show error state with animation
              showState(errorState)
              errorMessage.textContent = data.message || "There was an error verifying your email."
  
              // Show error message with SweetAlert2
              Swal.fire({
                position: 'top-end',
                icon: 'error', // 'success' or 'error'
                title: data.message,
                toast: true,
                showConfirmButton: false,
                timer: 2000
            });
            }
          })
          .catch((error) => {
            // Hide loading state with animation
            hideState(loadingState)
  
            // Show error state with animation
            showState(errorState)
            errorMessage.textContent = "Network error. Please try again later."
  
            // Show error message with SweetAlert2
            Swal.fire({
                position: 'top-end',
                icon: 'error', // 'success' or 'error'
                title: 'Could not connect to the server. Please try again later.',
                toast: true,
                showConfirmButton: false,
                timer: 2000
            });
  
            //console.error("Error:", error)
          })
      }, 2000) // Simulate network delay
    }
  
    // Add button hover effects
    const buttons = document.querySelectorAll(".btn")
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-3px)"
        this.style.boxShadow = "0 7px 14px rgba(66, 153, 225, 0.4)"
      })
  
      button.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
        this.style.boxShadow = "0 0 0 rgba(66, 153, 225, 0)"
      })
    })
  })
  