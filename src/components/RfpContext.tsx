import React, { createContext, useState } from "react";

interface RfpContextType {
  companyName: string;
  setCompanyName: (name: string) => void;
  companyDescription: string;
  setCompanyDescription: (desc: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  responseData: string; // ✅ Add this line
  setResponseData: (data: string) => void; // ✅ Add this line
}

const RfpContext = createContext<RfpContextType | undefined>(undefined);

export const RfpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [responseData, setResponseData] = useState(""); // ✅ Add this line

  return (
    <RfpContext.Provider
      value={{
        companyName,
        setCompanyName,
        companyDescription,
        setCompanyDescription,
        file,
        setFile,
        responseData, // ✅ Provide responseData
        setResponseData, // ✅ Provide setResponseData
      }}
    >
      {children}
    </RfpContext.Provider>
  );
};

export default RfpContext;
