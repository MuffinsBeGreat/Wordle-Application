import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import { useNavigate } from "react-router-dom";
import GooeyNav from "@/components/GooeyNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";

// Main search and admin page - lets users search words and admins manage words + users
export default function Search() {
    // get current user info (role + username) from localStorage
    const { isAdmin, username } = useAuth();
    
    // STATE FOR WORD EDITING
    const [selectedData, setSelectedData] = useState(null); // holds the word obj user picked from search
    const [editing, setEditing] = useState(false); // toggles edit mode for selected word
    const [editWord, setEditWord] = useState(""); // temp storage for word while editing
    const [editDesc, setEditDesc] = useState(""); // temp storage for description while editing
    
    // STATE FOR ADDING NEW WORDS
    const [addMode, setAddMode] = useState(false); // toggles the add word form visibility
    const [newWord, setNewWord] = useState(""); // stores new word input
    const [newDesc, setNewDesc] = useState(""); // stores new description input
    
    // STATE FOR USER MANAGEMENT
    const [userList, setUserList] = useState([]); // holds all users fetched from backend
    const [usersOpen, setUsersOpen] = useState(false); // toggles user management panel
    const [userSearch, setUserSearch] = useState(""); // user search input for filtering users
    
    // GENERAL STATE
    const [feedback, setFeedback] = useState(""); // displays success/error messages to user

    const nav = useNavigate();

    // logout: clears user data from storage and sends them back to login
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        nav("/");
    }

    // navigation items for the top menu
    const items = [
        { label: "Home", href: "/dashboard" },
        { label: "Search", href: "/search" },
        { label: "Logout", href: "/", onClick: handleLogout }
    ];

    // ============ WORD MANAGEMENT FUNCTIONS ============
    
    // startEdit: loads selected word data into edit form
    // INPUT: none (uses selectedData from state)
    // OUTPUT: updates editWord, editDesc, and sets editing mode to true
    const startEdit = () => {
        setEditWord(selectedData.word);
        setEditDesc(selectedData.description ?? "");
        setEditing(true);
    };

    // saveEdit: sends updated word + description to backend via PUT request
    // INPUT: none (uses editWord, editDesc from state)
    // OUTPUT: updates selectedData with new values, turns off edit mode, shows success message
    const saveEdit = async () => {
        try {
            await apiFetch(`/words/${selectedData.word}`, {
                method: "PUT",
                body: JSON.stringify({ word: editWord, description: editDesc }),
            });
            setSelectedData({ ...selectedData, word: editWord, description: editDesc });
            setEditing(false);
            setFeedback("Word updated.");
        } catch (e) { setFeedback(e.message); }
    };

    // deleteWord: asks for confirmation then deletes selected word from database
    // INPUT: none (uses selectedData.word)
    // OUTPUT: removes word from backend, clears selectedData, shows message
    const deleteWord = async () => {
        if (!confirm(`Delete "${selectedData.word}"?`)) return;
        try {
            await apiFetch(`/words/${selectedData.word}`, { method: "DELETE" });
            setSelectedData(null);
            setFeedback("Word deleted.");
        } catch (e) { setFeedback(e.message); }
    };

    // addWord: sends new word to backend via POST request, clears form on success
    // INPUT: none (uses newWord, newDesc from state)
    // OUTPUT: creates word in database, resets form fields, hides add panel, shows success msg
    const addWord = async () => {
        try {
            await apiFetch("/words", {
                method: "POST",
                body: JSON.stringify({ word: newWord.toUpperCase(), description: newDesc }),
            });
            setNewWord(""); setNewDesc(""); setAddMode(false);
            setFeedback(`"${newWord.toUpperCase()}" added.`);
        } catch (e) { setFeedback(e.message); }
    };

    // ============ USER MANAGEMENT FUNCTIONS ============
    
    // loadUsers: fetches all users from backend and opens the management panel
    // INPUT: none
    // OUTPUT: populates userList state with user data, sets usersOpen to true
    const loadUsers = async () => {
        try {
            const data = await apiFetch("/admin/users");
            setUserList(data.users);
            setUsersOpen(true);
        } catch (e) { setFeedback(e.message); }
    };

    // changeRole: toggles user between Admin (1) and User (2) role with confirmation
    // INPUT: userId (user id), newRole (1=Admin, 2=User)
    // OUTPUT: asks for confirmation, updates user in backend, refreshes userList state
    const changeRole = async (userId, newRole) => {
        const newRoleText = newRole === 1 ? "Admin" : "User";
        if (!confirm(`Change this user to ${newRoleText}?`)) return;
        try {
            await apiFetch(`/admin/users/${userId}/role`, {
                method: "PUT",
                body: JSON.stringify({ role: newRole }),
            });
            setUserList(prev =>
                prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u)
            );
            setFeedback(`User role changed to ${newRoleText}.`);
        } catch (e) { setFeedback(e.message); }
    };

    // deleteUser: removes a user account from database with safety checks (can't delete yourself)
    // INPUT: userId (user id to delete), userToDeleteName (username for display)
    // OUTPUT: checks if current user, asks for confirmation, deletes from backend, updates userList
    const deleteUser = async (userId, userToDeleteName) => {
        if (userToDeleteName === username) {
            setFeedback("You cannot delete your own account.");
            return;
        }
        if (!confirm(`Delete user "${userToDeleteName}"?`)) return;
        try {
            await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
            setUserList(prev => prev.filter(u => u.user_id !== userId));
            setFeedback(`User "${userToDeleteName}" deleted.`);
        } catch (e) { setFeedback(e.message); }
    };

    // derive filtered user list based on userSearch input - case insensitive username search
    // INPUT: userList (all users), userSearch (search string)
    // OUTPUT: array of users matching search criteria
    const filteredUsers = userList.filter(u =>
        u.username.toLowerCase().includes(userSearch.toLowerCase())
    );

    // ============ JSX STRUCTURE ============
    // Main page layout:
    // 1. Header + admin buttons (Add Word, Manage Users)
    // 2. User management panel (only shows when admin opens it)
    // 3. Add word form (only shows when Add Word is toggled on)
    // 4. Search bar + word details card (main search functionality)

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <GooeyNav
                items={items}
                particleCount={15}
                particleDistances={[90, 10]}
                particleR={100}
                initialActiveIndex={0}
                animationTime={600}
                timeVariance={300}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3">Search Words</h1>
                {isAdmin && (
                    <div className="flex gap-2 border-t border-border pt-3">
                        {/* Admin-only buttons: Add Word and Manage Users */}
                        <Button
                            variant={addMode ? "default" : "outline"}
                            onClick={() => setAddMode(m => !m)}
                        >
                            + Add Word
                        </Button>
                        <Button
                            variant={usersOpen ? "default" : "outline"}
                            onClick={loadUsers}
                        >
                            Manage Users
                        </Button>
                    </div>
                )}
            </div>

            {feedback && (
                <p className="text-sm text-green-600 mb-3">{feedback}</p>
            )}

            {/* User management panel - shows admin grid with search, username, role, and action buttons */}
            {isAdmin && usersOpen && (
                <Card className="mb-6 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-lg">User Management</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                    
                    <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="mb-4"
                    />

                    {filteredUsers.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No users found</p>
                    ) : (
                        <div className="space-y-3">
                            {/* Header row */}
                            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border font-semibold text-sm">
                                <div>Username</div>
                                <div>Role</div>
                                <div className="col-span-2">Actions</div>
                            </div>
                            
                            {/* User rows */}
                            {filteredUsers.map(u => {
                                // prevent admin from modifying their own account
                                const isCurrentUser = u.username === username;
                                return (
                                    <div key={u.user_id} className="grid grid-cols-4 gap-2 items-center text-sm">
                                        <div className="font-medium truncate">{u.username}</div>
                                        <div className="text-muted-foreground">{u.role === 1 ? "Admin" : "User"}</div>
                                        <div className="col-span-2 flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => changeRole(u.user_id, u.role === 1 ? 2 : 1)}
                                                disabled={isCurrentUser}
                                                title={isCurrentUser ? "You cannot modify your own account" : ""}
                                            >
                                                Make {u.role === 1 ? "User" : "Admin"}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => deleteUser(u.user_id, u.username)}
                                                disabled={isCurrentUser}
                                                title={isCurrentUser ? "You cannot delete your own account" : ""}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            )}

            {/* Add word form - only shows when admin clicks "Add Word" button */}
            {isAdmin && addMode && (
                <Card className="p-4 mb-4 space-y-2">
                    <p className="font-semibold">Add new word</p>
                    <Input
                        placeholder="Word (3–7 letters)"
                        value={newWord}
                        onChange={e => setNewWord(e.target.value)}
                        maxLength={7}
                    />
                    <Input
                        placeholder="Description"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button onClick={addWord}>Save</Button>
                        <Button variant="outline" onClick={() => setAddMode(false)}>Cancel</Button>
                    </div>
                </Card>
            )}

            {/* Main search & edit section - search bar + word details card */}
            <div className="w-full max-w-[350px] mx-auto">
                {/* search bar that finds words and populates selectedData */}
                <SearchBar onSelect={data => { setSelectedData(data); setEditing(false); }} />

                {selectedData && (
                    <Card className="mt-6 p-4 space-y-2 relative z-0">
                        {/* toggle between edit mode and display mode */}
                        {editing ? (
                            <>
                                {/* edit mode - shows input fields to change word and description */}
                                <Input value={editWord} onChange={e => setEditWord(e.target.value)} maxLength={7} />
                                <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                                <div className="flex gap-2">
                                    <Button onClick={saveEdit}>Save</Button>
                                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* display mode - shows word info and edit/delete buttons (if admin) */}
                                <p className="font-bold text-lg">{selectedData.word}</p>
                                <p className="text-muted-foreground">{selectedData.description}</p>
                                {isAdmin && (
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" onClick={startEdit}>Edit</Button>
                                        <Button variant="destructive" onClick={deleteWord}>Delete</Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}