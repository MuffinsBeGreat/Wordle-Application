import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/routes/login";
import Register from "@/routes/register";
import Dashboard from "@/routes/dashboard";
import Wordle3 from "@/routes/wordle-3";
import Wordle4 from "@/routes/wordle-4";
import Wordle5 from "@/routes/wordle-5";
import Wordle6 from "@/routes/wordle-6";
import Wordle7 from "@/routes/wordle-7";
import Search from "@/routes/search";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wordle/3"
        element={
          <ProtectedRoute>
            <Wordle3 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wordle/4"
        element={
          <ProtectedRoute>
            <Wordle4 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wordle/5"
        element={
          <ProtectedRoute>
            <Wordle5 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wordle/6"
        element={
          <ProtectedRoute>
            <Wordle6 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wordle/7"
        element={
          <ProtectedRoute>
            <Wordle7 />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
