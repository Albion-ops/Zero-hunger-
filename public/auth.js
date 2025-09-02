// Authentication JavaScript for Zero Hunger System

// Global user state
let currentUser = null;

// Initialize authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  initializeAuth();
  setupAuthTabs();
  setupAuthForms();
  checkAuthStatus();
});

// Initialize authentication system
function initializeAuth() {
  // Check if we're on the login page
  if (window.location.pathname.includes("login.html")) {
    return; // Don't update navigation on login page
  }

  updateNavigation();
}

// Setup authentication tabs
function setupAuthTabs() {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const switchToRegister = document.getElementById("switchToRegister");
  const switchToLogin = document.getElementById("switchToLogin");

  if (loginTab && registerTab) {
    loginTab.addEventListener("click", () => switchTab("login"));
    registerTab.addEventListener("click", () => switchTab("register"));
  }

  if (switchToRegister) {
    switchToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("register");
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("login");
    });
  }
}

// Switch between login and register tabs
function switchTab(tab) {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (tab === "login") {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
  } else {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
  }
}

// Setup authentication forms
function setupAuthForms() {
  const loginForm = document.getElementById("loginFormElement");
  const registerForm = document.getElementById("registerFormElement");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const messages = document.getElementById("loginMessages");
  const submitButton = form.querySelector('button[type="submit"]');

  // Clear previous messages
  messages.innerHTML = "";

  const data = {
    username: form.username.value.trim(),
    password: form.password.value,
  };

  if (!data.username || !data.password) {
    messages.innerHTML =
      '<div class="flash danger">Please provide username and password.</div>';
    return;
  }

  // Show loading state
  submitButton.disabled = true;
  submitButton.textContent = "Signing In...";
  form.classList.add("loading");

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      messages.innerHTML =
        '<div class="flash success">Login successful! Redirecting...</div>';
      currentUser = result.user;

      // Redirect to home page after successful login
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      messages.innerHTML =
        '<div class="flash danger">' +
        (result.error || "Login failed") +
        "</div>";
    }
  } catch (err) {
    console.error("Login error:", err);
    messages.innerHTML =
      '<div class="flash danger">Network error. Please check your connection and try again.</div>';
  } finally {
    // Remove loading state
    submitButton.disabled = false;
    submitButton.textContent = "Sign In";
    form.classList.remove("loading");
  }
}

// Handle register form submission
async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  const messages = document.getElementById("registerMessages");
  const submitButton = form.querySelector('button[type="submit"]');

  // Clear previous messages
  messages.innerHTML = "";

  const data = {
    username: form.username.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value,
    full_name: form.full_name.value.trim(),
  };

  // Validate required fields
  if (!data.username || !data.email || !data.password) {
    messages.innerHTML =
      '<div class="flash danger">Please provide username, email, and password.</div>';
    return;
  }

  // Validate password confirmation
  if (data.password !== form.confirm_password.value) {
    messages.innerHTML =
      '<div class="flash danger">Passwords do not match.</div>';
    return;
  }

  // Validate password strength
  if (data.password.length < 6) {
    messages.innerHTML =
      '<div class="flash danger">Password must be at least 6 characters long.</div>';
    return;
  }

  // Show loading state
  submitButton.disabled = true;
  submitButton.textContent = "Creating Account...";
  form.classList.add("loading");

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      messages.innerHTML =
        '<div class="flash success">Account created successfully! Redirecting...</div>';
      currentUser = result.user;

      // Redirect to home page after successful registration
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      messages.innerHTML =
        '<div class="flash danger">' +
        (result.error || "Registration failed") +
        "</div>";
    }
  } catch (err) {
    console.error("Registration error:", err);
    messages.innerHTML =
      '<div class="flash danger">Network error. Please check your connection and try again.</div>';
  } finally {
    // Remove loading state
    submitButton.disabled = false;
    submitButton.textContent = "Create Account";
    form.classList.remove("loading");
  }
}

// Check authentication status
async function checkAuthStatus() {
  try {
    const response = await fetch("/api/auth/me");
    const result = await response.json();

    if (result.user) {
      currentUser = result.user;
      updateNavigation();
    } else {
      currentUser = null;
      updateNavigation();
    }
  } catch (err) {
    console.error("Auth status check error:", err);
    currentUser = null;
    updateNavigation();
  }
}

// Update navigation based on authentication status
function updateNavigation() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  // Remove existing auth elements
  const existingAuth = nav.querySelector(".auth-nav");
  if (existingAuth) {
    existingAuth.remove();
  }

  const authNav = document.createElement("span");
  authNav.className = "auth-nav";

  if (currentUser) {
    // User is logged in - show user menu
    const userMenu = document.createElement("div");
    userMenu.className = "user-menu";

    const userButton = document.createElement("button");
    userButton.className = "user-menu-button";
    userButton.innerHTML = `👤 ${currentUser.username}`;
    if (currentUser.role === "admin") {
      userButton.innerHTML += '<span class="admin-badge">ADMIN</span>';
    }
    userButton.addEventListener("click", toggleUserMenu);

    const dropdown = document.createElement("div");
    dropdown.className = "user-menu-dropdown";
    dropdown.innerHTML = `
      <div class="user-info">
        <strong>${currentUser.full_name || currentUser.username}</strong><br>
        ${currentUser.email}
      </div>
      <a href="admin.html" class="user-menu-item">Admin Panel</a>
      <a href="#" class="user-menu-item" id="logoutBtn">Logout</a>
    `;

    userMenu.appendChild(userButton);
    userMenu.appendChild(dropdown);
    authNav.appendChild(userMenu);

    // Add logout event listener
    const logoutBtn = dropdown.querySelector("#logoutBtn");
    logoutBtn.addEventListener("click", handleLogout);
  } else {
    // User is not logged in - show login button
    const loginButton = document.createElement("a");
    loginButton.href = "login.html";
    loginButton.className = "auth-button";
    loginButton.textContent = "Login";
    authNav.appendChild(loginButton);
  }

  nav.appendChild(authNav);
}

// Toggle user menu dropdown
function toggleUserMenu(e) {
  e.stopPropagation();
  const dropdown = e.target.nextElementSibling;
  const isOpen = dropdown.classList.contains("show");

  // Close all other dropdowns
  document.querySelectorAll(".user-menu-dropdown.show").forEach((d) => {
    d.classList.remove("show");
  });

  // Toggle current dropdown
  if (!isOpen) {
    dropdown.classList.add("show");
  }
}

// Handle logout
async function handleLogout(e) {
  e.preventDefault();

  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    const result = await response.json();

    if (result.success) {
      currentUser = null;
      updateNavigation();

      // If on admin page, redirect to home
      if (window.location.pathname.includes("admin.html")) {
        window.location.href = "index.html";
      }
    } else {
      console.error("Logout failed:", result.error);
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}

// Close dropdowns when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".user-menu")) {
    document
      .querySelectorAll(".user-menu-dropdown.show")
      .forEach((dropdown) => {
        dropdown.classList.remove("show");
      });
  }
});

// Export functions for use in other scripts
window.auth = {
  checkAuthStatus,
  updateNavigation,
  getCurrentUser: () => currentUser,
  isAdmin: () => currentUser && currentUser.role === "admin",
};
