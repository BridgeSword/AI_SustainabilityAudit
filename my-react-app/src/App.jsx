import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home/Home.jsx";
import TestPage from "./Test/TestPage.jsx";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
