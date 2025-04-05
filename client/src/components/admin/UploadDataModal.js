import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import api from "../../services/api";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // For navigation after upload

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("File selected:", selectedFile);
    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    console.log("Uploading file:", file);
    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      const response = await api.post("/upload/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload response:", response.data);
      setMessage(response.data.message);
      setFile(null); // Reset file input

      // Redirect to admin dashboard after a delay to show the success message
      setTimeout(() => {
        navigate("/admin"); // Redirect to admin dashboard
      }, 2000); // Delay to show the success message
    } catch (error) {
      console.error("Upload error:", error.response || error);
      setMessage(
        "Error uploading file: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-2 dark:text-white">
          Upload Data
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              Upload an Excel file containing student and marks data. Ensure it
              follows the predefined template.
            </p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full p-2 border-2 border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {file && (
              <p className="text-gray-600 dark:text-gray-300">
                Selected file:{" "}
                <span className="font-semibold">{file.name}</span>
              </p>
            )}
            <button
              onClick={handleUpload}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Upload
            </button>
            {message && (
              <p
                className={`mt-4 ${
                  message.includes("Error")
                    ? "text-red-500 dark:text-red-400"
                    : "text-green-500 dark:text-green-400"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
