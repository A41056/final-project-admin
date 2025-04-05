import { useGetAllFileTypes } from "@/services/mediaServices";
import React, { useEffect } from "react";

const Dashboard: React.FC = () => {
  const { data: fileTypes, isLoading, error } = useGetAllFileTypes();

  useEffect(() => {
    if (fileTypes) {
      localStorage.setItem('fileTypes', JSON.stringify(fileTypes));
    }
  }, [fileTypes]);

  if (isLoading) return <div>Loading file types...</div>;
  if (error) return <div>Error loading file types: {error.message}</div>;

  return (
    <div>
      <pre>{JSON.stringify(fileTypes, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;