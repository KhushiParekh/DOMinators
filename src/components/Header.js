import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {  IconButton } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  // Open menu handler
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close menu handler
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <header className="py-1 bg-gray-900 shadow-sm z-11 w-screen flex top-0 absolute">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold text-green-600">
            RECit
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-green-600 border-b-2 border-green-600 pb-1 px-1">
              Home
            </Link>
            <Link to="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Login
            </Link>
            {/* Multilingual Icon */}
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              aria-controls="language-menu"
              aria-haspopup="true"
              className="hover:text-green-600"
            >
              <LanguageIcon />
            </IconButton>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
