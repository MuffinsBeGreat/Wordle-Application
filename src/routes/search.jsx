import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import GooeyNav from "@/components/GooeyNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";

export default function Search() {
    const { isAdmin } = useAuth();
    const [selectedData, setSelectedData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editWord, setEditWord] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [addMode, setAddMode] = useState(false);
    const [newWord, setNewWord] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [userList, setUserList] = useState([]);
    const [usersOpen, setUsersOpen] = useState(false);
    const [feedback, setFeedback] = useState("");

    const items = [
        { label: "Home", href: "/dashboard" },
        { label: "Logout", href: "/" },
    ];

    // Word actions 
    const startEdit = () => {
        setEditWord(selectedData.word);
        setEditDesc(selectedData.description ?? "");
        setEditing(true);
    };

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

    const deleteWord = async () => {
        if (!confirm(`Delete "${selectedData.word}"?`)) return;
        try {
            await apiFetch(`/words/${selectedData.word}`, { method: "DELETE" });
            setSelectedData(null);
            setFeedback("Word deleted.");
        } catch (e) { setFeedback(e.message); }
    };

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

    // User management
    const loadUsers = async () => {
        try {
            const data = await apiFetch("/admin/users");
            setUserList(data.users);
            setUsersOpen(true);
        } catch (e) { setFeedback(e.message); }
    };

    const changeRole = async (userId, newRole) => {
        try {
            await apiFetch(`/admin/users/${userId}/role`, {
                method: "PUT",
                body: JSON.stringify({ role: newRole }),
            });
            setUserList(prev =>
                prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u)
            );
        } catch (e) { setFeedback(e.message); }
    };

    const deleteUser = async (userId, username) => {
        if (!confirm(`Delete user "${username}"?`)) return;
        try {
            await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
            setUserList(prev => prev.filter(u => u.user_id !== userId));
        } catch (e) { setFeedback(e.message); }
    };

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

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Search</h1>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setAddMode(m => !m)}>
                            + Add Word
                        </Button>
                        <Button variant="outline" onClick={loadUsers}>
                            Manage Users
                        </Button>
                    </div>
                )}
            </div>

            {feedback && (
                <p className="text-sm text-green-600 mb-3">{feedback}</p>
            )}

            {/* Add word form */}
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

            <SearchBar onSelect={data => { setSelectedData(data); setEditing(false); }} />

            {/* Selected word result */}
            {selectedData && (
                <Card className="mt-6 p-4 space-y-2">
                    {editing ? (
                        <>
                            <Input value={editWord} onChange={e => setEditWord(e.target.value)} maxLength={7} />
                            <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                            <div className="flex gap-2">
                                <Button onClick={saveEdit}>Save</Button>
                                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                            </div>
                        </>
                    ) : (
                        <>
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

            {/* User management panel */}
            {isAdmin && usersOpen && (
                <Card className="mt-6 p-4">
                    <p className="font-semibold mb-3">User Management</p>
                    <div className="space-y-2">
                        {userList.map(u => (
                            <div key={u.user_id} className="flex items-center justify-between gap-2 text-sm">
                                <span className="font-medium w-32 truncate">{u.username}</span>
                                <span className="text-muted-foreground">{u.role === 1 ? "Admin" : "User"}</span>
                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => changeRole(u.user_id, u.role === 1 ? 2 : 1)}
                                    >
                                        Make {u.role === 1 ? "User" : "Admin"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteUser(u.user_id, u.username)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}