import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateWorkout from "./pages/CreateWorkout";
import PrivateRoute from "./components/PrivateRoute";
import CalendarPage from "./pages/CalendarPage";
import AiCoach from "./pages/AiCoach";
import Profile from "./pages/Profile";
import SplashScreen from "./components/SplashScreen";
import Onboarding from "./pages/Onboarding"; 
import { LanguageProvider } from "./context/LanguageContext"; 
import MacroCalculator from "./pages/MacroCalculator";
function App() {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      <LanguageProvider>
      <AnimatePresence mode="wait">
        {loading ? (
          <SplashScreen key="splash" onComplete={() => setLoading(false)} />
        ) : (
          <Router>
            <AuthProvider>
              <Navbar />
              <div className="container">
                <Routes>
                  {/* DEFAULT: Go to Login */}
                  <Route path="/" element={<Navigate to="/login" />} />
                  
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* PROTECTED ROUTES */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/onboarding" element={<Onboarding />} /> {/* Moved Here */}
                    <Route path="/create" element={<CreateWorkout />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/ai-coach" element={<AiCoach />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/nutrition" element={<MacroCalculator />} />
                  </Route>
                </Routes>
              </div>
            </AuthProvider>
          </Router>
        )}
      </AnimatePresence>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;