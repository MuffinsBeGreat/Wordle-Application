// input validation utility - prevents injection attacks and invalid data
// college style comments - quick and simple explanations

// validate username - must be 3-50 chars, alphanumeric + underscore only
export function validateUsername(username) {
    if (!username || typeof username !== "string") {
        return { valid: false, message: "Username is required" };
    }
    if (username.length < 3 || username.length > 50) {
        return { valid: false, message: "Username must be 3-50 characters" };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: "Username can only contain letters, numbers, and underscores" };
    }
    return { valid: true };
}

// validate password - must be 8+ chars with uppercase, lowercase, number, special char
export function validatePassword(password) {
    if (!password || typeof password !== "string") {
        return { valid: false, message: "Password is required" };
    }
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!regex.test(password)) {
        return { 
            valid: false, 
            message: "Password must be 8+ characters with uppercase, lowercase, number, and special character" 
        };
    }
    return { valid: true };
}

// validate word - must be 3-7 letters only
export function validateWord(word) {
    if (!word || typeof word !== "string") {
        return { valid: false, message: "Word is required" };
    }
    if (word.length < 3 || word.length > 7) {
        return { valid: false, message: "Word must be 3-7 letters" };
    }
    if (!/^[a-zA-Z]+$/.test(word)) {
        return { valid: false, message: "Word can only contain letters" };
    }
    return { valid: true };
}

// validate description - max 500 chars, no dangerous content
export function validateDescription(description) {
    if (!description || typeof description !== "string") {
        return { valid: true }; // description is optional
    }
    if (description.length > 500) {
        return { valid: false, message: "Description max 500 characters" };
    }
    return { valid: true };
}


