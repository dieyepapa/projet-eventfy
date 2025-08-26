import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive(to)
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
      } ${className}`}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
        isActive(to)
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">Eventify</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/">🏠 Accueil</NavLink>
                
                {/* Role-based navigation */}
                {user?.profile?.role === 'organizer' || user?.profile?.role === 'both' ? (
                  <>
                    <NavLink to="/dashboard">📊 Dashboard</NavLink>
                    <NavLink to="/create-event">➕ Créer Événement</NavLink>
                  </>
                ) : null}
                
                {user?.profile?.role === 'participant' || user?.profile?.role === 'both' ? (
                  <NavLink to="/my-events">🎫 Mes Événements</NavLink>
                ) : null}

                {/* User menu */}
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      Bonjour, {user?.first_name || user?.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/">🏠 Accueil</NavLink>
                <NavLink to="/login">🔑 Connexion</NavLink>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
          {isAuthenticated ? (
            <>
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
                🏠 Accueil
              </MobileNavLink>
              
              {user?.profile?.role === 'organizer' || user?.profile?.role === 'both' ? (
                <>
                  <MobileNavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    📊 Dashboard
                  </MobileNavLink>
                  <MobileNavLink to="/create-event" onClick={() => setIsMenuOpen(false)}>
                    ➕ Créer Événement
                  </MobileNavLink>
                </>
              ) : null}
              
              {user?.profile?.role === 'participant' || user?.profile?.role === 'both' ? (
                <MobileNavLink to="/my-events" onClick={() => setIsMenuOpen(false)}>
                  🎫 Mes Événements
                </MobileNavLink>
              ) : null}

              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.first_name} {user?.last_name}
                  </div>
                </div>
                <div className="mt-3 px-3">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
                🏠 Accueil
              </MobileNavLink>
              <MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                🔑 Connexion
              </MobileNavLink>
              <MobileNavLink to="/register" onClick={() => setIsMenuOpen(false)}>
                S'inscrire
              </MobileNavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
