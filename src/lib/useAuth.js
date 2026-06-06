// Gives any component easy access to auth state without repeating localStorage calls everywhere

export function useAuth() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = parseInt(localStorage.getItem("role"), 10);
    const isAdmin = role === 1;

    return { token, username, role, isAdmin };
}