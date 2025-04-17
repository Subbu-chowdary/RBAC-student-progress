import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents } from "../../redux/slices/adminSlice";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "react-datepicker/dist/react-datepicker.css";

import Spinner from "../Spinner";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentRecords = () => {
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector((state) => state.admin);

  // State for selectors and date range
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // State for search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Fetch students on mount
  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Prepare student options for the dropdown
  const studentOptions = students.map((student) => ({
    value: student.studentId,
    label: student.name,
  }));

  // Get subjects for the selected student
  const getSubjectOptions = () => {
    if (!selectedStudent) return [];
    const student = students.find((s) => s.studentId === selectedStudent.value);
    if (!student || !student.marks) return [];
    const subjects = [
      ...new Set(student.marks.map((mark) => mark.subjectId?.name || "N/A")),
    ];
    return subjects.map((subject) => ({
      value: subject,
      label: subject,
    }));
  };

  const subjectOptions = getSubjectOptions();

  // Filter marks by date range and subject
  const filterMarks = (marks) => {
    let filteredMarks = marks;
    if (selectedSubject) {
      filteredMarks = filteredMarks.filter(
        (mark) => mark.subjectId?.name === selectedSubject.value
      );
    }
    if (startDate) {
      filteredMarks = filteredMarks.filter(
        (mark) => new Date(mark.testDate) >= startDate
      );
    }
    if (endDate) {
      filteredMarks = filteredMarks.filter(
        (mark) => new Date(mark.testDate) <= endDate
      );
    }
    return filteredMarks;
  };

  // Prepare data for visualization
  const getChartData = () => {
    if (!selectedStudent) return { lineData: null, barData: null };

    const student = students.find((s) => s.studentId === selectedStudent.value);
    if (!student || !student.marks) return { lineData: null, barData: null };

    const filteredMarks = filterMarks(student.marks);

    // For Line Chart: Marks over time for the selected subject
    if (selectedSubject) {
      const dates = filteredMarks.map((mark) => {
        const testDate = new Date(mark.testDate);
        return testDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      });
      const marks = filteredMarks.map((mark) => mark.marks);
      const percentages = filteredMarks.map((mark) =>
        ((mark.marks / mark.totalMarks) * 100).toFixed(0)
      );

      const lineData = {
        labels: dates,
        datasets: [
          {
            label: "Marks",
            data: marks,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
          },
          {
            label: "Percentage",
            data: percentages,
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            fill: true,
          },
        ],
      };

      return { lineData, barData: null };
    }

    // For Bar Chart: Average marks across subjects (if no subject is selected)
    const subjects = [
      ...new Set(filteredMarks.map((mark) => mark.subjectId?.name || "N/A")),
    ];
    const averageMarks = subjects.map((subject) => {
      const subjectMarks = filteredMarks.filter(
        (mark) => mark.subjectId?.name === subject
      );
      const totalMarks = subjectMarks.reduce(
        (sum, mark) => sum + mark.marks,
        0
      );
      return subjectMarks.length > 0 ? totalMarks / subjectMarks.length : 0;
    });

    const barData = {
      labels: subjects,
      datasets: [
        {
          label: "Average Marks",
          data: averageMarks,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };

    return { lineData: null, barData };
  };

  const { lineData, barData } = getChartData();

  // Prepare table data
  const getTableData = () => {
    if (!selectedStudent) return [];
    const student = students.find((s) => s.studentId === selectedStudent.value);
    if (!student || !student.marks) return [];

    const filteredMarks = filterMarks(student.marks);

    return filteredMarks.map((mark) => {
      const testDate = new Date(mark.testDate);
      const dateString = testDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const percentage =
        ((mark.marks / mark.totalMarks) * 100).toFixed(0) + "%";
      return {
        date: dateString,
        subject: mark.subjectId?.name || "N/A",
        marks: mark.marks,
        totalMarks: mark.totalMarks,
        percentage,
      };
    });
  };

  const tableData = getTableData();

  // Sorting logic
  const sortTableData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Handle specific field types
      if (key === "date") {
        aValue = new Date(aValue.split("-").reverse().join("-"));
        bValue = new Date(bValue.split("-").reverse().join("-"));
      } else if (key === "percentage") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (key === "marks" || key === "totalMarks") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Handle sort click
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to filtered table data
  const filteredTableData = sortConfig.key
    ? sortTableData(
        tableData.filter(
          (record) =>
            record.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.date.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        sortConfig.key,
        sortConfig.direction
      )
    : tableData.filter(
        (record) =>
          record.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.date.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentTableData = filteredTableData.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalPages = Math.ceil(filteredTableData.length / rowsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPaginationRange = () => {
    const totalNumbers = 5;
    const totalButtons = totalNumbers + 2;
    const range = [];

    if (totalPages <= totalButtons) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 2, 1);
      const rightSiblingIndex = Math.min(currentPage + 2, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      range.push(1);

      if (shouldShowLeftDots) {
        range.push("...");
      }

      const start = shouldShowLeftDots ? leftSiblingIndex : 2;
      const end = shouldShowRightDots ? rightSiblingIndex : totalPages - 1;
      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (shouldShowRightDots) {
        range.push("...");
      }

      if (totalPages > 1) {
        range.push(totalPages);
      }
    }

    return range;
  };

  if (loading) {
    return (
      <div className="p-14 text-center text-themecolor-800 font-sans">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-14 text-center text-red-500 font-sans">{error}</div>
    );
  }

  return (
    <div className="p-14 bg-themecolor-50 font-sans">
      <h2 className="text-2xl font-bold text-themecolor-900 mb-14 font-display">
        Student Records Visualization
      </h2>

      {/* Selectors */}
      <div className="mb-14 space-y-4">
        <div>
          <label className="block mb-2 text-themecolor-800 font-sans">
            Select Student
          </label>
          <Select
            options={studentOptions}
            value={selectedStudent}
            onChange={(option) => {
              setSelectedStudent(option);
              setSelectedSubject(null);
              setStartDate(null);
              setEndDate(null);
              setSearchQuery("");
              setCurrentPage(1);
            }}
            placeholder="Select a student..."
            className="react-select w-1/2"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#DBE9FA", // themecolor-100
                borderColor: "#8EB8FF", // themecolor-400
                color: "#002F7A", // themecolor-900
                fontFamily: "Poppins, sans-serif",
              }),
              singleValue: (base) => ({
                ...base,
                color: "#002F7A", // themecolor-900
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "#DBE9FA", // themecolor-100
              }),
              option: (base, { isFocused }) => ({
                ...base,
                backgroundColor: isFocused ? "#C2D6FF" : "#DBE9FA", // themecolor-200 / themecolor-100
                color: "#002F7A", // themecolor-900
                fontFamily: "Poppins, sans-serif",
              }),
            }}
          />
        </div>

        {selectedStudent && (
          <>
            {subjectOptions.length > 0 && (
              <div>
                <label className="block mb-2 text-themecolor-800 font-sans">
                  Select Subject (Optional)
                </label>
                <Select
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  placeholder="Select a subject..."
                  className="react-select w-1/2"
                  classNamePrefix="react-select"
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: "#DBE9FA", // themecolor-100
                      borderColor: "#8EB8FF", // themecolor-400
                      color: "#002F7A", // themecolor-900
                      fontFamily: "Poppins, sans-serif",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#002F7A", // themecolor-900
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "#DBE9FA", // themecolor-100
                    }),
                    option: (base, { isFocused }) => ({
                      ...base,
                      backgroundColor: isFocused ? "#C2D6FF" : "#DBE9FA", // themecolor-200 / themecolor-100
                      color: "#002F7A", // themecolor-900
                      fontFamily: "Poppins, sans-serif",
                    }),
                  }}
                />
              </div>
            )}

            {/* Date Range Pickers */}
            <div className="flex space-x-4">
              <div>
                <label className="block mb-2 text-themecolor-800 font-sans">
                  From Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Select start date"
                  className="w-full p-2 border border-themecolor-400 rounded-3xl bg-themecolor-100 text-themecolor-900 font-sans focus:outline-none focus:ring-2 focus:ring-themecolor-600"
                  dateFormat="dd-MMM-yyyy"
                />
              </div>
              <div>
                <label className="block mb-2 text-themecolor-800 font-sans">
                  To Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="Select end date"
                  className="w-full p-2 border border-themecolor-400 rounded-3xl bg-themecolor-100 text-themecolor-900 font-sans focus:outline-none focus:ring-2 focus:ring-themecolor-600"
                  dateFormat="dd-MMM-yyyy"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Graphs */}
      {selectedStudent ? (
        <div className="space-y-8">
          {lineData && (
            <div>
              <h3 className="text-lg font-semibold text-themecolor-900 mb-4 font-display">
                Marks Over Time ({selectedSubject?.label})
              </h3>
              <div className="bg-themecolor-50 p-4 rounded-2xl shadow-soft">
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: { font: { family: "Roboto" } },
                      },
                      title: {
                        display: true,
                        text: "Marks Trend",
                        font: { family: "Roboto" },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Value",
                          font: { family: "Roboto" },
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Test Date",
                          font: { family: "Roboto" },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {barData && (
            <div>
              <h3 className="text-lg font-semibold text-themecolor-900 mb-4 font-display">
                Average Marks Across Subjects
              </h3>
              <div className="bg-themecolor-50 p-4 rounded-2xl shadow-soft">
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: { font: { family: "Roboto" } },
                      },
                      title: {
                        display: true,
                        text: "Average Marks by Subject",
                        font: { family: "Roboto" },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Average Marks",
                          font: { family: "Roboto" },
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Subject",
                          font: { family: "Roboto" },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div>
            <h3 className="text-lg font-semibold text-themecolor-900 mb-4 font-display">
              Detailed Marks
            </h3>

            <div className="mb-14 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search by Subject or Date..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-1/2 p-2 border border-themecolor-400 rounded-3xl bg-themecolor-100 text-themecolor-900 font-sans focus:outline-none focus:ring-2 focus:ring-themecolor-600"
              />
              <div className="flex items-center gap-2">
                <label className="text-themecolor-800 font-sans">
                  Rows per page:
                </label>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="p-2 border border-themecolor-400 rounded-3xl bg-themecolor-100 text-themecolor-900 font-sans focus:outline-none focus:ring-2 focus:ring-themecolor-600"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {filteredTableData.length === 0 ? (
              <p className="text-themecolor-800 font-sans">
                No records found for the selected criteria.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-themecolor-400 scrollbar-track-themecolor-100">
                  <table className="w-full bg-themecolor-50 border border-themecolor-400 rounded-2xl shadow-soft">
                    <thead className="sticky top-0 bg-themecolor-200 z-10">
                      <tr>
                        <th
                          className="py-2 px-4 border-b text-left text-themecolor-900 font-sans sticky left-0 bg-themecolor-200 z-20 min-w-[120px] cursor-pointer hover:bg-themecolor-300"
                          onClick={() => handleSort("date")}
                        >
                          Date{" "}
                          {sortConfig.key === "date" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="py-2 px-4 border-b text-left text-themecolor-900 font-sans sticky left-[120px] bg-themecolor-200 z-20 min-w-[150px] cursor-pointer hover:bg-themecolor-300"
                          onClick={() => handleSort("subject")}
                        >
                          Subject{" "}
                          {sortConfig.key === "subject" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="py-2 px-4 border-b text-left text-themecolor-900 font-sans min-w-[100px] cursor-pointer hover:bg-themecolor-300"
                          onClick={() => handleSort("marks")}
                        >
                          Marks{" "}
                          {sortConfig.key === "marks" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="py-2 px-4 border-b text-left text-themecolor-900 font-sans min-w-[100px] cursor-pointer hover:bg-themecolor-300"
                          onClick={() => handleSort("totalMarks")}
                        >
                          Total Marks{" "}
                          {sortConfig.key === "totalMarks" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="py-2 px-4 border-b text-left text-themecolor-900 font-sans min-w-[100px] cursor-pointer hover:bg-themecolor-300"
                          onClick={() => handleSort("percentage")}
                        >
                          Percentage{" "}
                          {sortConfig.key === "percentage" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData.map((record, index) => (
                        <tr
                          key={index}
                          className="hover:bg-themecolor-100 transition-colors duration-200"
                        >
                          <td className="py-2 px-4 border-b text-themecolor-800 font-sans sticky left-0 bg-themecolor-50 z-20 min-w-[120px]">
                            {record.date}
                          </td>
                          <td className="py-2 px-4 border-b text-themecolor-800 font-sans sticky left-[120px] bg-themecolor-50 z-20 min-w-[150px]">
                            {record.subject}
                          </td>
                          <td className="py-2 px-4 border-b text-themecolor-800 font-sans min-w-[100px]">
                            {record.marks}
                          </td>
                          <td className="py-2 px-4 border-b text-themecolor-800 font-sans min-w-[100px]">
                            {record.totalMarks}
                          </td>
                          <td className="py-2 px-4 border-b text-themecolor-800 font-sans min-w-[100px]">
                            <span
                              className={
                                parseInt(record.percentage) < 60
                                  ? "text-red-500"
                                  : "text-themecolor-700"
                              }
                            >
                              {record.percentage}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-themecolor-800 font-sans">
                    Showing {indexOfFirstRow + 1} to{" "}
                    {Math.min(indexOfLastRow, filteredTableData.length)} of{" "}
                    {filteredTableData.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-themecolor-600 text-themecolor-50 rounded-3xl disabled:bg-themecolor-300 disabled:cursor-not-allowed hover:bg-themecolor-700 transition-colors duration-200 font-sans"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {getPaginationRange().map((item, index) =>
                        item === "..." ? (
                          <span
                            key={index}
                            className="px-3 py-1 text-themecolor-800 font-sans"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={index}
                            onClick={() => paginate(item)}
                            className={`px-3 py-1 rounded-3xl font-sans ${
                              currentPage === item
                                ? "bg-themecolor-600 text-themecolor-50"
                                : "bg-themecolor-100 text-themecolor-800 hover:bg-themecolor-200"
                            } transition-colors duration-200`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-themecolor-600 text-themecolor-50 rounded-3xl disabled:bg-themecolor-300 disabled:cursor-not-allowed hover:bg-themecolor-700 transition-colors duration-200 font-sans"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="text-themecolor-800 font-sans">
          Please select a student to view records.
        </p>
      )}
    </div>
  );
};

export default StudentRecords;
