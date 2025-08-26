import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 Eventify. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-primary-600">À propos</a>
              <a href="#" className="hover:text-primary-600">Contact</a>
              <a href="#" className="hover:text-primary-600">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
