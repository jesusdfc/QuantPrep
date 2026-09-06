import { BookOpen, LayoutDashboard, ListChecks } from "lucide-react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LearnPage from "./pages/LearnPage";
import QuestionPage from "./pages/QuestionPage";
import QuestionsPage from "./pages/QuestionsPage";
import TopicPage from "./pages/TopicPage";

function Nav() {
  return (
    <header className="topbar">
      <NavLink to="/questions" className="brand">
        quantprep<span className="brand-accent">.ai</span>
      </NavLink>
      <nav className="nav">
        <NavLink to="/questions" className="nav-link">
          <ListChecks size={16} /> Questions
        </NavLink>
        <NavLink to="/learn" className="nav-link">
          <BookOpen size={16} /> Learn
        </NavLink>
        <NavLink to="/dashboard" className="nav-link">
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/questions" replace />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/questions/:id" element={<QuestionPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:topicId" element={<TopicPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/questions" replace />} />
        </Routes>
      </main>
    </div>
  );
}
