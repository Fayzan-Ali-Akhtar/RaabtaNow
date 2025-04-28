// // src/App.tsx
// import { useState, useEffect } from 'react'
// import {VITE_BACKEND_URL} from './constant'
// import './App.css'

// function App() {
//   const [backendMsg, setBackendMsg] = useState<string>('Loading…')
//   const [backendUrl, setBackendUrl] = useState<string>('Finding backend URL...')

//   useEffect(() => {
//     const backendUrl = import.meta.env.VITE_BACKEND_URL || VITE_BACKEND_URL
//     setBackendUrl(backendUrl);
//     console.log('Fetching backend message...')
//     console.log(`Backend URL: ${backendUrl}`)
//     fetch(backendUrl)
//       .then(res => res.text())
//       .then(text => setBackendMsg(text))
//       .catch(err => {
//         console.error(err)
//         setBackendMsg('❌ Failed to reach backend')
//       })
//   }, [])

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
//       <h1 className="text-4xl font-bold text-white mb-4">
//         🎉 RaabtaNow!
//       </h1>
//       <p className="text-xl text-white">
//         {backendMsg}
//       </p>
//       <p className="text-lg text-white mt-4">
//         Backend URL: {backendUrl}
//       </p>
//     </div>
//   )
// }

// export default App
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import JobsPage from "./pages/JobsPage";
import CoverLetterPage from "./pages/CoverLetterPage";
import SettingsPage from "./pages/SettingsPage";
import FeaturesPage from "./pages/FeaturesPage";
import NotFound from "./pages/NotFound";

// Context
import { AuthProvider } from "./context/AuthContext";

// Private Route
import PrivateRoute from "./pages/auth/PrivateRoute"; // 👈 (Adjust import path if needed)

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            
            {/* Private Routes */}
            <Route
              path="/feed"
              element={
                <PrivateRoute>
                  <FeedPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <PrivateRoute>
                  <JobsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/cover-letter"
              element={
                <PrivateRoute>
                  <CoverLetterPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
