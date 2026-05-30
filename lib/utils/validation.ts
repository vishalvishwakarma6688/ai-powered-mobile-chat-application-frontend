/**
 * Form validation utilities
 */

export interface ValidationResult {
    isValid: boolean;
    errors: {
        username?: string;
        email?: string;
        phone?: string;
        password?: string;
    };
}

/**
 * Validate signup form data
 */
export const validateSignupForm = (form: {
    username: string;
    email: string;
    phone: string;
    password: string;
}): ValidationResult => {
    const errors: ValidationResult['errors'] = {};

    // Username validation
    if (!form.username.trim()) {
        errors.username = 'Username is required';
    } else if (form.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
    } else if (form.username.length > 30) {
        errors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!form.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!form.phone.trim()) {
        errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(form.phone)) {
        errors.phone = 'Please enter a valid phone number';
    } else if (form.phone.replace(/\D/g, '').length < 10) {
        errors.phone = 'Phone number must be at least 10 digits';
    }

    // Password validation
    if (!form.password) {
        errors.password = 'Password is required';
    } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    } else if (form.password.length > 100) {
        errors.password = 'Password must be less than 100 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate login form data
 */
export const validateLoginForm = (form: {
    username: string;
    password: string;
}): ValidationResult => {
    const errors: ValidationResult['errors'] = {};

    // Username validation
    if (!form.username.trim()) {
        errors.username = 'Username is required';
    }

    // Password validation
    if (!form.password) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
