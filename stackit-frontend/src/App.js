import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuestionsPage from "./pages/QuestionsPage.js";
import QuestionDetailPage from "./pages/QuestionDetailPage.js";
import AskPage from "./pages/AskPage.js";
import LoginPage from "./pages/LoginPage.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuestionsPage />} />
        <Route path="/question/:id" element={<QuestionDetailPage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
