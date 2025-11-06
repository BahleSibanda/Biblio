// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation
    let isValid = true;
    
    if (!username) {
        showError('login-username-error', 'Username or email is required');
        isValid = false;
    } else {
        hideError('login-username-error');
    }
    
    if (!password) {
        showError('login-password-error', 'Password is required');
        isValid = false;
    } else {
        hideError('login-password-error');
    }
    
    if (isValid) {
        // Simulate API call
        simulateAPICall('/api/login', { username, password })
            .then(userData => {
                currentUser = userData;
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                showSuccess('login-success', 'Login successful!');
                
                setTimeout(() => {
                    closeAllModals();
                    updateUIForUser();
                    // Reload current page to update content
                    if (currentPage === 'profile' || currentPage === 'notifications') {
                        loadPage(currentPage);
                    }
                }, 1500);
            })
            .catch(error => {
                showError('login-username-error', 'Invalid credentials');
            });
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    // Validation
    let isValid = true;
    
    if (!name) {
        showError('signup-name-error', 'Full name is required');
        isValid = false;
    } else {
        hideError('signup-name-error');
    }
    
    if (!username) {
        showError('signup-username-error', 'Username is required');
        isValid = false;
    } else if (username.length < 3) {
        showError('signup-username-error', 'Username must be at least 3 characters');
        isValid = false;
    } else {
        hideError('signup-username-error');
    }
    
    if (!email || !validateEmail(email)) {
        showError('signup-email-error', 'Valid email is required');
        isValid = false;
    } else {
        hideError('signup-email-error');
    }
    
    if (!password || password.length < 6) {
        showError('signup-password-error', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        hideError('signup-password-error');
    }
    
    if (password !== confirmPassword) {
        showError('signup-confirm-error', 'Passwords do not match');
        isValid = false;
    } else {
        hideError('signup-confirm-error');
    }
    
    if (isValid) {
        // Simulate API call
        simulateAPICall('/api/signup', { name, username, email, password })
            .then(userData => {
                currentUser = userData;
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                showSuccess('signup-success', 'Account created successfully!');
                
                setTimeout(() => {
                    closeAllModals();
                    updateUIForUser();
                    loadPage('profile');
                }, 1500);
            })
            .catch(error => {
                showError('signup-username-error', 'Username or email already exists');
            });
    }
}

function simulateAPICall(endpoint, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate successful login/signup for demo
            if (endpoint === '/api/login' || endpoint === '/api/signup') {
                resolve({
                    id: 1,
                    username: data.username,
                    name: data.name || data.username,
                    email: data.email,
                    joinDate: new Date().toISOString(),
                    followers: 127,
                    following: 89
                });
            } else {
                reject(new Error('Authentication failed'));
            }
        }, 1000);
    });
}
