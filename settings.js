// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (currentPage === 'settings') {
        loadSettingsPage();
    }
});

function loadSettingsPage() {
    setupSettingsForm();
    initSettingsAnimations();
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
    const inputs = form.querySelectorAll('input');
    
    // Validate all fields
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
            saveButton.textContent = originalText;
            saveButton.disabled = false;
            
            showSuccess('settings-success', 'Settings saved successfully!');
            
            // Update profile if needed
            const username = document.getElementById('username').value;
            const displayName = document.getElementById('display-name').value;
            
            if (currentUser) {
                currentUser.username = username;
                currentUser.name = displayName;
            }
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
}