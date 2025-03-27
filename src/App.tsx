import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import UploadPage from "./components/UploadPage";
import LoadingPage from "./components/LoadingPage";
import ReviewPage from "./components/ReviewPage";
import { RfpProvider } from "./components/RfpContext";

const App = () => {
  return (
    <RfpProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </Router>
    </RfpProvider>
  );
};

export default App;
