import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

const getCurrentPath = () => window.location.pathname;

export default function App() {
  const [path, setPath] = useState(getCurrentPath);

  const navigate = (nextPath) => {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };

  useEffect(() => {
    const handlePopState = () => setPath(getCurrentPath());

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const hasToken = !!window.localStorage.getItem('crewling-token');

  useEffect(() => {
    if (!hasToken && path.startsWith('/app')) {
      navigate('/login');
    } else if (hasToken && (path === '/login' || path === '/' || path === '')) {
      navigate('/app/home');
    }
  }, [path, hasToken]);

  if (path === '/signup') {
    return <SignupPage onNavigate={navigate} />;
  }

  if (path.startsWith('/app') && hasToken) {
    return <HomePage onNavigate={navigate} />;
  }

  return <LoginPage onNavigate={navigate} />;
}
