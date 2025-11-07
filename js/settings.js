// Settings page functionality
function initSettingsPage() {
    console.log('Initializing settings page');
    loadSettingsPage();
    initSettingsAnimations();
}

function loadSettingsPage() {
    const settingsContent = document.getElementById('settings-content');
    if (!settingsContent) return;
    
    if (!currentUser) {
        // Show login prompt instead of settings form
        showLoginPrompt(settingsContent);
    } else {
        // Show actual settings form
        showSettingsForm(settingsContent);
        setupSettingsForm();
    }
}

function showLoginPrompt(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-user-lock" style="font-size: 4rem; color: var(--dark-grey); margin-bottom: 1.5rem;"></i>
            <h3 style="margin-bottom: 1rem; color: var(--dark-azure);">Account Access Required</h3>
            <p style="margin-bottom: 2rem; color: var(--dark-grey); line-height: 1.6;">
                To manage your account settings, please log in or create an account. 
                This allows you to customize your profile, reading preferences, and notification settings.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="cta" style="background: var(--orange);" onclick="openModal('login-modal')">
                    <i class="fas fa-sign-in-alt"></i> Log In
                </button>
                <button class="cta" style="background: var(--dark-azure);" onclick="openModal('signup-modal')">
                    <i class="fas fa-user-plus"></i> Sign Up
                </button>
            </div>
            <div style="margin-top: 2rem; padding: 1.5rem; background: var(--light-grey); border-radius: 8px;">
                <h4 style="margin-bottom: 0.5rem; color: var(--dark-azure);">Features You'll Unlock:</h4>
                <ul style="text-align: left; color: var(--dark-grey); line-height: 1.8;">
                    <li><i class="fas fa-user-edit" style="color: var(--orange);"></i> Customize your profile</li>
                    <li><i class="fas fa-bell" style="color: var(--orange);"></i> Manage notifications</li>
                    <li><i class="fas fa-book" style="color: var(--orange);"></i> Track your reading progress</li>
                    <li><i class="fas fa-users" style="color: var(--orange);"></i> Join book clubs</li>
                    <li><i class="fas fa-star" style="color: var(--orange);"></i> Rate and review books</li>
                </ul>
            </div>
        </div>
    `;
}

function showSettingsForm(container) {
    container.innerHTML = `
        <form id="settings-form">
            <div class="form-group">
                <label class="form-label" for="display-name">Display Name</label>
                <input type="text" id="display-name" class="form-input" value="${currentUser.name || ''}" required>
                <div class="error-message" id="name-error"></div>
            </div>
            <div class="form-group">
                <label class="form-label" for="username">Username</label>
                <input type="text" id="username" class="form-input" value="${currentUser.username || ''}" required>
                <div class="error-message" id="username-error"></div>
            </div>
            <div class="form-group">
                <label class="form-label" for="profile-pic">Profile Picture URL</label>
                <input type="text" id="profile-pic" class="form-input" value="https://via.placeholder.com/100/74925D/FFFFFF?text=User">
            </div>
            <div class="form-group">
                <label class="form-label" for="header-pic">Header Image URL</label>
                <input type="text" id="header-pic" class="form-input" value="https://via.placeholder.com/1200x200/4C6145/FFFFFF?text=Header+Image">
            </div>
            <div class="form-group">
                <label class="form-label">Reading Preferences</label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" checked> Email Notifications
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" checked> Reading Updates
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox"> Book Club Invites
                    </label>
                </div>
            </div>
            <button type="submit" class="cta" style="background: var(--orange);">Save Changes</button>
            <div class="success-message" id="settings-success">Changes saved successfully!</div>
        </form>
        
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--medium-grey);">
            <h3 style="margin-bottom: 1rem; color: var(--dark-azure);">Account Management</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="cta" style="background: var(--dark-grey-brown);" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Log Out
                </button>
                <button class="cta" style="background: #d32f2f;" onclick="showDeleteConfirmation()">
                    <i class="fas fa-trash"></i> Delete Account
                </button>
            </div>
        </div>
    `;
}

function setupSettingsForm() {
    const form = document.getElementById('settings-form');
    if (!form) return;
    
    form.addEventListener('submit', handleSettingsSubmit);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this, true);
        });
    });
}

function validateField(field, showError = false) {
    const fieldId = field.id;
    const value = field.value.trim();
    
    switch(fieldId) {
        case 'display-name':
            if (!value) {
                if (showError) showError('name-error', 'Display name is required');
                return false;
            } else if (value.length < 2) {
                if (showError) showError('name-error', 'Display name must be at least 2 characters');
                return false;
            } else {
                hideError('name-error');
                return true;
            }
            
        case 'username':
            if (!value) {
                if (showError) showError('username-error', 'Username is required');
                return false;
            } else if (value.length < 3) {
                if (showError) showError('username-error', 'Username must be at least 3 characters');
                return false;
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                if (showError) showError('username-error', 'Username can only contain letters, numbers, and underscores');
                return false;
            } else {
                hideError('username-error');
                return true;
            }
            
        default:
            return true;
    }
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    
    let isValid = true;
    const form = e.target;
    const inputs = form.querySelectorAll('input[required]');
    
    // Validate all required fields
    inputs.forEach(input => {
        if (!validateField(input, true)) {
            isValid = false;
        }
    });
    
    if (isValid) {
        // Simulate saving settings
        const saveButton = form.querySelector('button[type="submit"]');
        const originalText = saveButton.textContent;
        
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;
        
        setTimeout(() => {
            // Update user data
            if (currentUser) {
                currentUser.name = document.getElementById('display-name').value;
                currentUser.username = document.getElementById('username').value;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            saveButton.textContent = originalText;
            saveButton.disabled = false;
            
            showSuccess('settings-success', 'Settings saved successfully!');
            
            // Update UI if needed
            updateUIForUser();
            
        }, 1500);
    }
}

function showDeleteConfirmation() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Simulate account deletion
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--orange);
            color: white;
            padding: 2rem;
            border-radius: 8px;
            z-index: 10001;
            text-align: center;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        `;
        messageDiv.innerHTML = `
            <h3 style="margin-bottom: 1rem;">Account Deletion</h3>
            <p>In a real application, this would delete your account.</p>
            <button onclick="this.parentElement.remove()" style="
                background: white; 
                color: var(--orange); 
                border: none; 
                padding: 0.5rem 1rem; 
                border-radius: 4px; 
                cursor: pointer;
                margin-top: 1rem;
            ">OK</button>
        `;
        
        document.body.appendChild(messageDiv);
    }
}

function initSettingsAnimations() {
    // Form animation
    gsap.from('.content-box', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power2.out'
    });
    
    // Input field animations
    gsap.from('.form-group', {
        duration: 0.8,
        x: -100,
        opacity: 0,
        stagger: 0.2,
        delay: 0.5
    });
}