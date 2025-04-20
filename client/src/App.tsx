import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ResumePage from './components/resumePage';
import BehavioralPage from './components/BehavioralPage';
import CodingPage from './components/CodingPage';
import InterviewDetailPage from './components/InterviewDetailPage';
import InterviewHub from './components/InterviewHub';
import SummaryPage from './components/SummaryPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/coding" element={<CodingPage />} />
        <Route path="/coding/:id" element={<CodingPage />} />
        <Route path="/behavioral" element={<BehavioralPage />} />
        <Route path="interview" element={<InterviewHub />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
};

export default App;

