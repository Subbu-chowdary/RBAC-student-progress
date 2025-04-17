import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";

const customStyles = {
  table: {
    style: {
      backgroundColor: "#EEEEEE", // themecolor-50
      fontFamily: "Poppins, sans-serif", // font-sans
    },
  },
  header: {
    style: {
      backgroundColor: "#C2D6FF", // themecolor-200
      color: "#000000", // themecolor-120
      fontFamily: "Poppins, sans-serif", // font-sans
      fontWeight: "600",
      padding: "16px",
    },
  },
  headCells: {
    style: {
      backgroundColor: "#C2D6FF", // themecolor-200
      color: "#000000", // themecolor-120
      fontFamily: "Poppins, sans-serif", // font-sans
      fontWeight: "600",
      border: "1px solid #8EB8FF", // border-themecolor-400
      padding: "16px",
    },
  },
  cells: {
    style: {
      backgroundColor: "#EEEEEE", // themecolor-50
      color: "#000000", // themecolor-120
      fontFamily: "Poppins, sans-serif", // font-sans
      border: "1px solid #8EB8FF", // border-themecolor-400
      padding: "16px",
    },
  },
  rows: {
    style: {
      backgroundColor: "#EEEEEE", // themecolor-50
      "&:nth-child(odd)": {
        backgroundColor: "#DBE9FA", // themecolor-100 (striped)
      },
      "&:hover": {
        backgroundColor: "#DBE9FA", // themecolor-100
        cursor: "pointer",
      },
      fontFamily: "Poppins, sans-serif", // font-sans
      color: "#000000", // themecolor-120
      border: "1px solid #8EB8FF", // border-themecolor-400
    },
  },
  pagination: {
    style: {
      backgroundColor: "#EEEEEE", // themecolor-50
      color: "#000000", // themecolor-120
      fontFamily: "Poppins, sans-serif", // font-sans
    },
    pageButtonsStyle: {
      backgroundColor: "#4A8CFF", // themecolor-600
      color: "#EEEEEE", // themecolor-50
      borderRadius: "1.5rem", // rounded-3xl
      padding: "8px 16px",
      margin: "0 4px",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#1F6FFF", // themecolor-700
      },
      "&:disabled": {
        backgroundColor: "#A8C7FF", // themecolor-300
        cursor: "not-allowed",
      },
    },
  },
};

const StudentList = () => {
  const { students, loading, error } = useSelector((state) => state.admin);
  const [filterText, setFilterText] = useState("");
  const [filteredStudents, setFilteredStudents] = useState(students);
  const navigate = useNavigate();

  const columns = [
    { name: "Id", selector: (row) => row.studentId, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "College", selector: (row) => row.college, sortable: true },
    { name: "Branch", selector: (row) => row.branch, sortable: true },
    { name: "CGPA", selector: (row) => row.cgpa, sortable: true },
  ];

  const handleRowClick = (row) => {
    navigate(`/student/${row._id}`);
  };

  useEffect(() => {
    setFilteredStudents(
      students.filter((student) =>
        Object.values(student).some((value) =>
          String(value).toLowerCase().includes(filterText.toLowerCase())
        )
      )
    );
  }, [filterText, students]);

  return (
    <div className="bg-themecolor-50 p-14 rounded-2xl shadow-soft mb-14">
      <h2 className="text-2xl font-semibold text-themecolor-900 mb-4 font-display">
        Student List
      </h2>
      <input
        type="text"
        placeholder="Filter students..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-14 p-2 border-2 border-themecolor-500 rounded-3xl w-full bg-themecolor-50 text-themecolor-120 font-sans focus:outline-none focus:ring-2 focus:ring-themecolor-600"
      />
      {loading && (
        <p className="text-themecolor-600 mb-14 font-sans">Loading...</p>
      )}
      {error && <p className="text-red-500 mb-14 font-sans">Error: {error}</p>}
      <DataTable
        columns={columns}
        data={filteredStudents}
        customStyles={customStyles}
        pagination
        fixedHeader
        striped
        onRowClicked={handleRowClick}
        highlightOnHover
      />
    </div>
  );
};

export default StudentList;
