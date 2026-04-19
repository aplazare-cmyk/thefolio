// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider }       from './context/AuthContext';
import Navbar                 from './components/Navbar';
import ProtectedRoute         from './components/ProtectedRoute';

import SplashPage             from './pages/SplashPage';
import HomePage               from './pages/HomePage';
import AboutPage              from './pages/AboutPage';
import ContactPage            from './pages/ContactPage';
import LoginPage              from './pages/LoginPage';
import RegisterPage           from './pages/RegisterPage';
import ForgotPasswordPage     from './pages/ForgotPasswordPage';
import PostPage               from './pages/PostPage';
import UserProfilePage        from './pages/UserProfilePage';
import ProfilePage            from './pages/ProfilePage';
import MyPostsPage            from './pages/MyPostsPage';
import ReadingListPage        from './pages/ReadingListPage';
import CreatePostPage         from './pages/CreatePostPage';
import EditPostPage           from './pages/EditPostPage';
import AdminPage              from './pages/AdminPage';

function WithNav({ children }) {
    return <Navbar>{children}</Navbar>;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Splash — no nav */}
                    <Route path="/"                  element={<SplashPage />} />

                    {/* Public pages */}
                    <Route path="/home"              element={<WithNav><HomePage /></WithNav>} />
                    <Route path="/about"             element={<WithNav><AboutPage /></WithNav>} />
                    <Route path="/contact"           element={<WithNav><ContactPage /></WithNav>} />
                    <Route path="/login"             element={<WithNav><LoginPage /></WithNav>} />
                    <Route path="/register"          element={<WithNav><RegisterPage /></WithNav>} />
                    <Route path="/forgot-password"   element={<WithNav><ForgotPasswordPage /></WithNav>} />
                    <Route path="/posts/:id"         element={<WithNav><PostPage /></WithNav>} />

                    {/* Public user profiles */}
                    <Route path="/user/:id"          element={<WithNav><UserProfilePage /></WithNav>} />

                    {/* Protected pages */}
                    <Route path="/my-posts"          element={<WithNav><ProtectedRoute><MyPostsPage /></ProtectedRoute></WithNav>} />
                    <Route path="/reading-list"      element={<WithNav><ProtectedRoute><ReadingListPage /></ProtectedRoute></WithNav>} />
                    <Route path="/profile"           element={<WithNav><ProtectedRoute><ProfilePage /></ProtectedRoute></WithNav>} />
                    <Route path="/create-post"       element={<WithNav><ProtectedRoute><CreatePostPage /></ProtectedRoute></WithNav>} />
                    <Route path="/edit-post/:id"     element={<WithNav><ProtectedRoute><EditPostPage /></ProtectedRoute></WithNav>} />
                    <Route path="/admin"             element={<WithNav><ProtectedRoute role="admin"><AdminPage /></ProtectedRoute></WithNav>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;