import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import GTranslate from './components/GTranslate';



const App = () => {


  return (
    <BrowserRouter>
    <GTranslate/>
      

      <Routes>
        <Route path="/" element={<Home />} />
       
       

      </Routes>
    </BrowserRouter>
  );
};

export default App;
