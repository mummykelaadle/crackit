import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ResumePage from './components/resumePage';
import BehavioralPage from './components/BehavioralPage';
import CodingPage from './components/codingPage';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/coding" element={<CodingPage />} />
        <Route path="/behavioral" element={<BehavioralPage />} />
      </Routes>
    </Router>
  );
};

export default App;
