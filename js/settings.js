// Settings page functionality
function initSettingsPage() {
    console.log('Initializing settings page');
    loadSettingsPage();
    initSettingsAnimations();
}

function loadSettingsPage() {
    setupSettingsForm();
    loadCurrentSettings();
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

function loadCurrentSettings() {
    // Load current user settings
    if (currentUser) {
        const displayName = document.getElementById('display-name');
        const username = document.getElementById('username');
        
        if (displayName) displayName.value = currentUser.name || '';
        if (username) username.value = currentUser.username || '';
    }
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
            
        case 'profile-pic':
        case 'header-pic':
            if (value && !isValidUrl(value)) {
                if (showError) showError(fieldId + '-error', 'Please enter a valid URL');
                return false;
            } else {
                hideError(fieldId + '-error');
                return true;
            }
            
        default:
            return true;
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
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
    
    // Button animation
    gsap.from('.cta', {
        duration: 0.6,
        scale: 0,
        rotation: 180,
        ease: 'back.out(1.7)',
        delay: 1.2
    });
    
    // Success message animation (prepared)
    gsap.set('#settings-success', {
        transformOrigin: 'center',
        scale: 0
    });
    
    // Prepare success message animation
    const successElement = document.getElementById('settings-success');
    if (successElement) {
        successElement.addEventListener('DOMNodeInserted', function() {
            if (this.style.display === 'block') {
                gsap.fromTo(this, 
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
                );
            }
        });
    }
}