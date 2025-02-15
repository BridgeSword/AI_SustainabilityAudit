import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TestPage from "./Test/TestPage.jsx"; // 引入 TestPage 组件
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Welcome to Vite + React</h1>} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
