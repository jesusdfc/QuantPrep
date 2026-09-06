import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LearnPage from "./pages/LearnPage";
import QuestionPage from "./pages/QuestionPage";
import QuestionsPage from "./pages/QuestionsPage";
import TopicPage from "./pages/TopicPage";
import Layout from "./ui/Layout";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/questions" replace />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<QuestionPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/learn/:topicId" element={<TopicPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/questions" replace />} />
      </Route>
    </Routes>
  );
}
