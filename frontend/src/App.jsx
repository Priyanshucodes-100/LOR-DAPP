import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Verify from "./pages/Verify";
import "./App.css";

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole={1}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/professor"
              element={
                <ProtectedRoute requiredRole={2}>
                  <ProfessorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={3}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/verify" element={<Verify />} />
          </Routes>
        </main>
      </BrowserRouter>
    </Web3Provider>
  );
}

export default App;
