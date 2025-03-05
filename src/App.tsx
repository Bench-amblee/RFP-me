import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import UploadPage from "./components/UploadPage";
import ReviewPage from "./components/ReviewPage";
import { useState } from "react";

const App = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/upload"
          element={
            <UploadPage
              companyName={companyName}
              setCompanyName={setCompanyName}
              companyDescription={companyDescription}
              setCompanyDescription={setCompanyDescription}
              file={file}
              setFile={setFile}
            />
          }
        />
        <Route
          path="/review"
          element={
            <ReviewPage
              companyName={companyName}
              companyDescription={companyDescription}
              file={file}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;