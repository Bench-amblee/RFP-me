import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Save, 
  X, 
  FileDown, 
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import Navbar from "./Navbar";
import RfpContext from "./RfpContext";
import html2pdf from "html2pdf.js";

// Interface for RFP sections
interface RfpSection {
  id: string;
  title: string;
  content: string;
}

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    companyName, 
    companyDescription, 
    file, 
    responseData,
    setResponseData 
  } = useContext(RfpContext) || {};
  
  const [sections, setSections] = useState<RfpSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [documentStyles, setDocumentStyles] = useState({
    fontFamily: "Arial, sans-serif",
    primaryColor: "#2563EB",
    textColor: "#333333",
    headerColor: "#1E40AF"
  });
  const [showSidebar, setShowSidebar] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: "" });

  // Process the incoming response data and convert to consistent format
  useEffect(() => {
    if (!responseData) {
      // Redirect if no data
      if (!file || !companyName) {
        navigate("/upload");
        return;
      }
      return;
    }

    try {
      let parsedData;
      
      if (typeof responseData === "string") {
        parsedData = JSON.parse(responseData);
      } else {
        parsedData = responseData;
      }

      if (!parsedData || !parsedData.response || !Array.isArray(parsedData.response)) {
        console.error("Unexpected data structure:", parsedData);
        setSaveStatus({
          show: true,
          success: false,
          message: "Error parsing response data"
        });
        return;
      }

      // Convert API response to consistent section format
      const formattedSections = parsedData.response.map((section, index) => {
        // Extract content from various possible formats
        let formattedContent = "";
        
        try {
          if (typeof section.content === "string") {
            try {
              // Check if it's JSON from EditorJS
              const parsed = JSON.parse(section.content);
              if (parsed.blocks) {
                // Convert EditorJS blocks to HTML
                formattedContent = convertEditorJsToHtml(parsed);
              } else {
                // Just use the content as is
                formattedContent = section.content;
              }
            } catch (e) {
              // Not JSON, use as is
              formattedContent = section.content;
            }
          } else if (section.content && typeof section.content === "object") {
            // Handle API format with type and data
            if (section.content.type === "paragraph") {
              formattedContent = section.content.data;
            } else if (section.content.type === "list" && Array.isArray(section.content.data)) {
              formattedContent = `<ul>${section.content.data.map(item => `<li>${item}</li>`).join("")}</ul>`;
            }
          }
        } catch (error) {
          console.error("Error processing section content:", error);
          formattedContent = "Error displaying content";
        }
        
        return {
          id: `section-${index}`,
          title: section.title,
          content: formattedContent
        };
      });

      setSections(formattedSections);
      // Expand all sections by default
      setExpandedSections(formattedSections.map(section => section.id).concat("title-page"));
    } catch (error) {
      console.error("Error parsing response data:", error);
      setSaveStatus({
        show: true,
        success: false,
        message: "Error processing RFP response"
      });
    }
  }, [responseData, file, companyName, companyDescription, navigate]);

  // Helper to convert EditorJS content to HTML
  const convertEditorJsToHtml = (editorData) => {
    if (!editorData || !editorData.blocks) return "";
    
    return editorData.blocks.map(block => {
      switch (block.type) {
        case "paragraph":
          return `<p>${block.data.text.replace(/\n/g, "<br>")}</p>`;
        case "header":
          return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
        case "list":
          const listItems = block.data.items.map(item => `<li>${item}</li>`).join("");
          return block.data.style === "unordered" 
            ? `<ul>${listItems}</ul>` 
            : `<ol>${listItems}</ol>`;
        default:
          return "";
      }
    }).join("");
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Start editing a section
  const startEditing = (section: RfpSection) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  };

  // Save edits to a section
  const saveEdits = () => {
    if (!editingSection) return;
    
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === editingSection
          ? { ...section, content: editContent }
          : section
      )
    );
    
    // Update the response data to be consistent
    updateResponseData();
    
    setEditingSection(null);
    setEditContent("");
    
    // Show success message
    setSaveStatus({
      show: true,
      success: true,
      message: "Changes saved successfully"
    });
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Update the response data in context when sections change
  const updateResponseData = () => {
    if (!sections.length) return;
    
    const updatedResponse = {
      response: sections.map(section => ({
        title: section.title,
        content: section.content
      }))
    };
    
    setResponseData(JSON.stringify(updatedResponse));
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSection(null);
    setEditContent("");
  };

  // Generate and download PDF
  const generatePDF = () => {
    const content = document.getElementById("rfp-document");
    if (!content) return;
    
    // Clone the content to avoid modifying the original DOM
    const clonedContent = content.cloneNode(true) as HTMLElement;
    
    // Remove any edit buttons in the clone
    const editButtons = clonedContent.querySelectorAll(".edit-button");
    editButtons.forEach(button => button.remove());
    
    // Ensure the document fits on PDF pages properly
    const options = {
      margin: 10,
      filename: `${companyName.replace(/\s+/g, '_')}_RFP_Response.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    
    // Generate PDF
    html2pdf().set(options).from(clonedContent).save();
  };

  // Rich text editor modules/formats
  const editorModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"]
    ]
  };

  // Custom toolbar format options
  const editorFormats = [
    "header",
    "bold", "italic", "underline", "strike",
    "list", "bullet",
    "link"
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Top action bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/upload")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={18} />
                <span>Back to Upload</span>
              </button>
              <h1 className="text-xl font-semibold">RFP Response Review</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-3 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
              >
                {showSidebar ? "Hide Outline" : "Show Outline"}
              </button>
              <button
                onClick={generatePDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FileDown size={18} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content with sidebar */}
        <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Document outline sidebar */}
          {showSidebar && (
            <div className="w-64 mr-8">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h2 className="font-medium text-gray-900 mb-4">Document Outline</h2>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => toggleSection("title-page")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        expandedSections.includes("title-page")
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Title Page
                    </button>
                  </li>
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                          expandedSections.includes(section.id)
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Document content */}
          <div className="flex-1">
            {/* Style customization */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <h2 className="font-medium text-gray-900 mb-4">Document Styling</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Font Family</label>
                  <select
                    value={documentStyles.fontFamily}
                    onChange={(e) => setDocumentStyles(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Times New Roman', Times, serif">Times New Roman</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="'Courier New', monospace">Courier New</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={documentStyles.primaryColor}
                    onChange={(e) => setDocumentStyles(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-full px-2 py-1 border rounded-md h-10"
                  />
                </div>
              </div>
            </div>

            {/* Success/error notification */}
            {saveStatus.show && (
              <div className={`mb-4 p-3 rounded-md ${
                saveStatus.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}>
                <div className="flex items-center">
                  {saveStatus.success ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <X className="h-5 w-5 mr-2" />
                  )}
                  <p>{saveStatus.message}</p>
                </div>
              </div>
            )}

            {/* Document preview */}
            <div 
              id="rfp-document" 
              className="bg-white rounded-lg shadow-lg border overflow-hidden"
              style={{ fontFamily: documentStyles.fontFamily }}
            >
              {/* Title Page */}
              <div className="border-b">
                <button
                  onClick={() => toggleSection("title-page")}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <h2 
                    className="text-2xl font-bold" 
                    style={{ color: documentStyles.headerColor }}
                  >
                    Title Page
                  </h2>
                  {expandedSections.includes("title-page") ? 
                    <ChevronUp size={20} /> : 
                    <ChevronDown size={20} />
                  }
                </button>
                {expandedSections.includes("title-page") && (
                  <div className="px-6 py-8 bg-gray-50">
                    <div className="text-center mb-12">
                      <h1 
                        className="text-3xl font-bold mb-4" 
                        style={{ color: documentStyles.primaryColor }}
                      >
                        RFP Response
                      </h1>
                      <p className="text-xl mb-2">Prepared by: {companyName}</p>
                      <p className="text-gray-600">
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="border-t border-gray-300 pt-6">
                      <h3 
                        className="text-lg font-medium mb-2"
                        style={{ color: documentStyles.headerColor }}
                      >
                        Company Overview
                      </h3>
                      <p className="text-gray-700">{companyDescription}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Sections */}
              {sections.map((section) => (
                <div key={section.id} className="border-b last:border-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <h2 
                      className="text-2xl font-bold"
                      style={{ color: documentStyles.headerColor }}
                    >
                      {section.title}
                    </h2>
                    <div className="flex items-center">
                      {expandedSections.includes(section.id) && 
                        editingSection !== section.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(section);
                            }}
                            className="edit-button p-2 text-gray-500 hover:text-blue-600 mr-2"
                          >
                            <Edit2 size={16} />
                          </button>
                        )
                      }
                      {expandedSections.includes(section.id) ? 
                        <ChevronUp size={20} /> : 
                        <ChevronDown size={20} />
                      }
                    </div>
                  </button>
                  
                  {expandedSections.includes(section.id) && (
                    <div className="px-6 py-4 bg-gray-50">
                      {editingSection === section.id ? (
                        <div>
                          <ReactQuill
                            value={editContent}
                            onChange={setEditContent}
                            modules={editorModules}
                            formats={editorFormats}
                            theme="snow"
                            className="bg-white mb-4 min-h-[200px]"
                          />
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEdits}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            >
                              <Save size={16} className="mr-1" /> Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          dangerouslySetInnerHTML={{ __html: section.content }}
                          className="prose max-w-none"
                          style={{ color: documentStyles.textColor }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewPage;