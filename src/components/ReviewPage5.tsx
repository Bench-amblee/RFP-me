import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import CustomizationPanel from "./CustomizationPanel";
import RfpContext from "./RfpContext";
import EditorJS from "@editorjs/editorjs";
import html2pdf from "html2pdf.js";

interface Section {
  title: string;
  content: any;
}

const ReviewPage = () => {
  console.log("ReviewPage has loaded!");

  const context = useContext(RfpContext);
  if (!context) {
    throw new Error("ReviewPage must be used within an RfpProvider");
  }

  const { companyName, companyDescription, file, responseData } = context;
  const navigate = useNavigate();

  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const editorInstances = useRef<{ [key: number]: EditorJS }>({});

  useEffect(() => {
    if (!file || !companyName || !companyDescription || !responseData) {
      alert("Missing required data. Redirecting...");
      navigate("/");
      return;
    }

    parseAndSetSections(responseData);
  }, [file, companyName, companyDescription, responseData, navigate]);

  const parseAndSetSections = (jsonResponse: string) => {
    try {
      const parsedData = JSON.parse(jsonResponse);
      console.log("Parsed JSON:", parsedData);

      const sectionsArray = parsedData.response || parsedData.sections;

      if (!sectionsArray || !Array.isArray(sectionsArray)) {
        console.error("Invalid response format:", parsedData);
        return;
      }

      const sections = sectionsArray.map((section) => ({
        title: section.title || "Untitled Section",
        content: section.content?.data || { time: Date.now(), blocks: [] }, // Ensure default content structure
      }));

      setSections(sections);
      setExpandedSections(sections.length > 0 ? [sections[0].title] : []);
    } catch (error) {
      console.error("Error parsing JSON response:", error);
    }
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prevExpanded) =>
      prevExpanded.includes(sectionTitle)
        ? prevExpanded.filter((title) => title !== sectionTitle)
        : [...prevExpanded, sectionTitle]
    );
  };

  useEffect(() => {
    sections.forEach((section, index) => {
      if (expandedSections.includes(section.title) && !editorInstances.current[index]) {
        editorInstances.current[index] = new EditorJS({
          holder: `editor-${index}`,
          data: section.content,
          onChange: async () => {
            const editorData = await editorInstances.current[index].save();
            updateSectionContent(index, editorData);
          },
          tools: {}, // Add Editor.js plugins here if needed
        });
      }
    });
  }, [sections, expandedSections]);

  const updateSectionContent = (index: number, newData: any) => {
    setSections((prevSections) =>
      prevSections.map((section, i) => (i === index ? { ...section, content: newData } : section))
    );
  };

  const handleDownloadPDF = () => {
    const content = document.getElementById("rfp-content");
    if (!content) return;

    html2pdf()
      .from(content)
      .set({ margin: 10, filename: "rfp-response.pdf", html2canvas: { scale: 2 } })
      .save();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Sidebar */}
        <div className="fixed top-16 left-0 h-full bg-white shadow-lg transition-all duration-300 w-64 overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Document Sections</h3>
            <ul className="space-y-2">
              {sections.map((section, index) => (
                <li key={index}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 transition-all duration-300">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">RFP Response Review</h1>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            </div>

            <CustomizationPanel />

            <div className="bg-white rounded-xl shadow-lg overflow-hidden" id="rfp-content">
              {sections.map((section, index) => (
                <div key={index} className="border-b">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                    {expandedSections.includes(section.title) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {expandedSections.includes(section.title) && (
                    <div className="p-4">
                      <div id={`editor-${index}`} className="border p-4 rounded-md bg-gray-100"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleDownloadPDF}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Download as PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewPage;
