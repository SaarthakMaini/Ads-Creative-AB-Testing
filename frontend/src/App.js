import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, CircularProgress, CssBaseline } from '@mui/material';
import Products from './pages/Products';
import Creatives from './pages/Creatives';
import ABTests from './pages/ABTests';
import Performance from './pages/Performance';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#181f2a',
      paper: '#232b3a',
    },
    primary: {
      main: '#00bcd4', // Cyan accent
      contrastText: '#fff',
    },
    secondary: {
      main: '#7c4dff', // Purple accent
    },
    text: {
      primary: '#fff',
      secondary: '#b0b8c1',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
  },
});

function AnimatedBackground() {
  return (
    <Particles
      id="tsparticles"
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: { color: { value: '#181f2a' } },
        particles: {
          number: { value: 28 },
          color: { value: ['#00bcd4', '#7c4dff', '#fff'] },
          shape: { type: 'circle' },
          opacity: { value: 0.13 },
          size: { value: 2.5 },
          move: { enable: true, speed: 0.6, direction: 'none', outModes: 'out' },
        },
        interactivity: {
          events: { onHover: { enable: true, mode: 'repulse' } },
          modes: { repulse: { distance: 70, duration: 0.4 } },
        },
      }}
    />
  );
}

function NavBar() {
  const { user, logout } = useAuth();
  return (
    <AppBar position="static" color="inherit" elevation={1} sx={{ background: 'rgba(35,43,58,0.95)', boxShadow: 2 }}>
      <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1, color: '#00bcd4' }}>
          Ad Creative A/B Testing
        </Typography>
        {user && <Button color="primary" component={Link} to="/dashboard">Dashboard</Button>}
        {user && <Button color="primary" component={Link} to="/products">Products</Button>}
        {user && <Button color="primary" component={Link} to="/creatives">Creatives</Button>}
        {user && <Button color="primary" component={Link} to="/tests">A/B Tests</Button>}
        {user && <Button color="primary" component={Link} to="/performance">Performance</Button>}
        {user ? (
          <Button color="secondary" onClick={logout} sx={{ ml: 2 }}>Logout</Button>
        ) : (
          <>
            <Button color="primary" component={Link} to="/login">Login</Button>
            <Button color="secondary" component={Link} to="/register">Register</Button>
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

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<PageTransition><PrivateRoute><Dashboard /></PrivateRoute></PageTransition>} />
        <Route path="/products" element={<PageTransition><PrivateRoute><Products /></PrivateRoute></PageTransition>} />
        <Route path="/creatives" element={<PageTransition><PrivateRoute><Creatives /></PrivateRoute></PageTransition>} />
        <Route path="/tests" element={<PageTransition><PrivateRoute><ABTests /></PrivateRoute></PageTransition>} />
        <Route path="/performance" element={<PageTransition><PrivateRoute><Performance /></PrivateRoute></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '70vh' }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AnimatedBackground />
          <NavBar />
          <Container maxWidth="md" sx={{ pt: 6, pb: 6 }}>
            <AnimatedRoutes />
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
