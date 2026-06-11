/**
 * Validates required fields based on operation type (registration or profile update)
 */
function validateRequiredFields(userData, errors, isRegistration) {
    const requiredForRegistration = ['username', 'email', 'password', 'confirmPassword'];
    const requiredForProfile = ['firstName', 'lastName', 'dateOfBirth', 'address'];
    const requiredFields = isRegistration ? requiredForRegistration : requiredForProfile;

    for (const field of requiredFields) {
        if (!userData[field] || userData[field].trim() === '') {
            errors.push(`${field} is required${isRegistration ? ' for registration' : ' if provided'}`);
        }
    }
}

/**
 * Validates username format and existence
 */
function validateUsername(username, errors, options) {
    if (!username) return;

    if (username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    } else if (username.length > 20) {
        errors.push('Username must be at most 20 characters long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
    } else if (options.checkExisting && options.checkExisting.usernameExists(username)) {
        errors.push('Username is already taken');
    }
}

/**
 * Validates password strength and confirmation
 */
function validatePassword(password, confirmPassword, errors) {
    if (!password) return;

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    } else if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    if (confirmPassword !== password) {
        errors.push('Password and confirmation do not match');
    }
}

/**
 * Validates email format and existence
 */
function validateEmail(email, errors, isRegistration, options) {
    if (email === undefined) return;

    if (email.trim() === '') {
        if (isRegistration) {
            errors.push('Email is required');
        }
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Email format is invalid');
        } else if (options.checkExisting && options.checkExisting.emailExists(email)) {
            errors.push('Email is already registered');
        }
    }
}

/**
 * Validates date of birth and age requirements
 */
function validateDateOfBirth(dateOfBirth, errors) {
    if (dateOfBirth === undefined || dateOfBirth === '') return;

    const dobDate = new Date(dateOfBirth);

    if (isNaN(dobDate.getTime())) {
        errors.push('Date of birth is not a valid date');
        return;
    }

    const now = new Date();
    const minAgeDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
    const maxAgeDate = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());

    if (dobDate > now) {
        errors.push('Date of birth cannot be in the future');
    } else if (dobDate > minAgeDate) {
        errors.push('You must be at least 13 years old');
    } else if (dobDate < maxAgeDate) {
        errors.push('Invalid date of birth (age > 120 years)');
    }
}

/**
 * Validates postal code format based on country
 */
function validatePostalCode(zip, country, errors) {
    if (!zip || !country) return;

    if (country === 'US' && !/^\d{5}(-\d{4})?$/.test(zip)) {
        errors.push('Invalid US ZIP code format');
    } else if (country === 'CA' && !/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(zip)) {
        errors.push('Invalid Canadian postal code format');
    } else if (country === 'UK' && !/^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/.test(zip)) {
        errors.push('Invalid UK postal code format');
    }
}

/**
 * Validates address structure and required fields
 */
function validateAddress(address, errors) {
    if (address === undefined || address === '') return;

    if (typeof address !== 'object') {
        errors.push('Address must be an object with required fields');
        return;
    }

    const requiredAddressFields = ['street', 'city', 'zip', 'country'];

    for (const field of requiredAddressFields) {
        if (!address[field] || address[field].trim() === '') {
            errors.push(`Address ${field} is required`);
        }
    }

    validatePostalCode(address.zip, address.country, errors);
}

/**
 * Validates phone number format
 */
function validatePhone(phone, errors) {
    if (phone === undefined || phone === '') return;

    if (!/^\+?[\d\s\-()]{10,15}$/.test(phone)) {
        errors.push('Phone number format is invalid');
    }
}

/**
 * Applies custom field validations
 */
function validateCustomFields(userData, errors, customValidations) {
    if (!customValidations) return;

    for (const validation of customValidations) {
        const field = validation.field;

        if (userData[field] !== undefined) {
            const valid = validation.validator(userData[field], userData);

            if (!valid) {
                errors.push(validation.message || `Invalid value for ${field}`);
            }
        }
    }
}

/**
 * Validates user input data for user registration and profile updates.
 * Returns an array of validation errors if any are found.
 */
function validateUserData(userData, options = {}) {
    const errors = [];
    const isRegistration = options.isRegistration || false;

    // Validate required fields
    validateRequiredFields(userData, errors, isRegistration);

    // For registration, validate registration-specific fields
    if (isRegistration) {
        validateUsername(userData.username, errors, options);
        validatePassword(userData.password, userData.confirmPassword, errors);
    }

    // Validate fields common to both registration and profile updates
    validateEmail(userData.email, errors, isRegistration, options);
    validateDateOfBirth(userData.dateOfBirth, errors);
    validateAddress(userData.address, errors);
    validatePhone(userData.phone, errors);

    // Apply custom validations if provided
    validateCustomFields(userData, errors, options.customValidations);

    return errors;
}

// Export the function for testing
// export default validateUserData;
// Export functions for testing
module.exports = { validateUserData };
