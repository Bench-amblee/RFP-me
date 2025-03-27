import React, { createContext, useState } from "react";

interface RfpContextType {
  companyName: string;
  setCompanyName: (name: string) => void;
  companyDescription: string;
  setCompanyDescription: (desc: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  responseData: string | null;
  setResponseData: (data: string) => void;
  documentStyles: {
    fontFamily: string;
    primaryColor: string;
    textColor: string;
    headerColor: string;
  };
  setDocumentStyles: React.Dispatch<React.SetStateAction<{
    fontFamily: string;
    primaryColor: string;
    textColor: string;
    headerColor: string;
  }>>;
}

const defaultStyles = {
  fontFamily: "Arial, sans-serif",
  primaryColor: "#2563EB",
  textColor: "#333333",
  headerColor: "#1E40AF"
};

const RfpContext = createContext<RfpContextType | undefined>(undefined);

export const RfpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [documentStyles, setDocumentStyles] = useState(defaultStyles);

  return (
    <RfpContext.Provider
      value={{
        companyName,
        setCompanyName,
        companyDescription,
        setCompanyDescription,
        file,
        setFile,
        responseData,
        setResponseData,
        documentStyles,
        setDocumentStyles
      }}
    >
      {children}
    </RfpContext.Provider>
  );
};

export default RfpContext;
