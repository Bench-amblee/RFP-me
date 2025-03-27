import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RfpContext from "../components/RfpContext";

// Types
export interface RfpSection {
  id: string;
  title: string;
  content: string;
}

export interface DocumentStyles {
  fontFamily: string;
  primaryColor: string;
  textColor: string;
  headerColor: string;
}

export interface UseRfpDocumentReturn {
  sections: RfpSection[];
  documentStyles: DocumentStyles;
  expandedSections: string[];
  editingSection: string | null;
  editContent: string;
  saveStatus: {
    show: boolean;
    success: boolean;
    message: string;
  };
  setSections: React.Dispatch<React.SetStateAction<RfpSection[]>>;
  setDocumentStyles: React.Dispatch<React.SetStateAction<DocumentStyles>>;
  setExpandedSections: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSection: (sectionId: string) => void;
  startEditing: (section: RfpSection) => void;
  saveEdits: () => void;
  cancelEditing: () => void;
  generatePDF: () => void;
  convertEditorJsToHtml: (editorData: any) => string;
}

export function useRfpDocument(): UseRfpDocumentReturn {
  // Get context and router
  const context = useContext(RfpContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("useRfpDocument must be used within an RfpProvider");
  }

  const { 
    companyName, 
    companyDescription, 
    file, 
    responseData, 
    setResponseData 
  } = context;

  // State
  const [sections, setSections] = useState<RfpSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [documentStyles, setDocumentStyles] = useState<DocumentStyles>({
    fontFamily: "Arial, sans-serif",
    primaryColor: "#2563EB",
    textColor: "#333333",
    headerColor: "#1E40AF"
  });
  const [saveStatus, setSaveStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: "" });

  // Parse response data into sections
  useEffect(() => {
    if (!responseData) {
      // Redirect if necessary data is missing
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
  }, [responseData, file, companyName, navigate]);

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
    const updatedSections = sections.map(section => 
      section.id === editingSection
        ? { ...section, content: editContent }
        : section
    );
    
    updateResponseData(updatedSections);
    
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

  // Cancel editing
  const cancelEditing = () => {
    setEditingSection(null);
    setEditContent("");
  };

  // Update response data in context
  const updateResponseData = (updatedSections = sections) => {
    if (!updatedSections.length) return;
    
    const updatedResponse = {
      response: updatedSections.map(section => ({
        title: section.title,
        content: section.content
      }))
    };
    
    setResponseData(JSON.stringify(updatedResponse));
  };

  // Generate PDF
  const generatePDF = () => {
    // This is a placeholder - the actual implementation will be in the component
    // since it needs direct DOM access
    console.log("Generate PDF called from hook");
  };

  return {
    sections,
    documentStyles,
    expandedSections,
    editingSection,
    editContent,
    saveStatus,
    setSections,
    setDocumentStyles,
    setExpandedSections,
    toggleSection,
    startEditing,
    saveEdits,
    cancelEditing,
    generatePDF,
    convertEditorJsToHtml
  };
}