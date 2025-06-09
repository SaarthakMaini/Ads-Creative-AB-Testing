import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, CircularProgress } from '@mui/material';
import Products from './pages/Products';
import Creatives from './pages/Creatives';
import ABTests from './pages/ABTests';
import Performance from './pages/Performance';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './auth/AuthContext';

function NavBar() {
  const { user, logout } = useAuth();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Ad Creative A/B Testing
        </Typography>
        {user && <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>}
        {user && <Button color="inherit" component={Link} to="/products">Products</Button>}
        {user && <Button color="inherit" component={Link} to="/creatives">Creatives</Button>}
        {user && <Button color="inherit" component={Link} to="/tests">A/B Tests</Button>}
        {user && <Button color="inherit" component={Link} to="/performance">Performance</Button>}
        {user ? (
          <Button color="inherit" onClick={logout}>Logout</Button>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/register">Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress /></Box>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
            <Route path="/creatives" element={<PrivateRoute><Creatives /></PrivateRoute>} />
            <Route path="/tests" element={<PrivateRoute><ABTests /></PrivateRoute>} />
            <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
