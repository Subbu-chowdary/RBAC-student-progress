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

  if (loading) {
    return <div className="p-6 text-center text-gray-700">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Student Records Visualization
      </h2>

      {/* Selectors */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Select Student</label>
          <Select
            options={studentOptions}
            value={selectedStudent}
            onChange={(option) => {
              setSelectedStudent(option);
              setSelectedSubject(null); // Reset subject when student changes
              setStartDate(null); // Reset dates when student changes
              setEndDate(null);
            }}
            placeholder="Select a student..."
            className="w-full max-w-md"
          />
        </div>

        {selectedStudent && (
          <>
            {subjectOptions.length > 0 && (
              <div>
                <label className="block text-gray-700 mb-2">
                  Select Subject (Optional)
                </label>
                <Select
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  placeholder="Select a subject..."
                  className="w-full max-w-md"
                  isClearable
                />
              </div>
            )}

            {/* Date Range Pickers */}
            <div className="flex space-x-4">
              <div>
                <label className="block text-gray-700 mb-2">From Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Select start date"
                  className="w-full max-w-xs p-2 border border-gray-300 rounded"
                  dateFormat="dd-MMM-yyyy"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">To Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="Select end date"
                  className="w-full max-w-xs p-2 border border-gray-300 rounded"
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Marks Over Time ({selectedSubject?.label})
              </h3>
              <div className="bg-white p-4 rounded-lg shadow">
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: true, text: "Marks Trend" },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Value" },
                      },
                      x: {
                        title: { display: true, text: "Test Date" },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {barData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Average Marks Across Subjects
              </h3>
              <div className="bg-white p-4 rounded-lg shadow">
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: {
                        display: true,
                        text: "Average Marks by Subject",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Average Marks" },
                      },
                      x: {
                        title: { display: true, text: "Subject" },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Detailed Marks
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left text-gray-700">
                      Date
                    </th>
                    <th className="py-2 px-4 border-b text-left text-gray-700">
                      Subject
                    </th>
                    <th className="py-2 px-4 border-b text-left text-gray-700">
                      Marks
                    </th>
                    <th className="py-2 px-4 border-b text-left text-gray-700">
                      Total Marks
                    </th>
                    <th className="py-2 px-4 border-b text-left text-gray-700">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length > 0 ? (
                    tableData.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-gray-700">
                          {record.date}
                        </td>
                        <td className="py-2 px-4 border-b text-gray-700">
                          {record.subject}
                        </td>
                        <td className="py-2 px-4 border-b text-gray-700">
                          {record.marks}
                        </td>
                        <td className="py-2 px-4 border-b text-gray-700">
                          {record.totalMarks}
                        </td>
                        <td className="py-2 px-4 border-b text-gray-700">
                          {record.percentage}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-2 px-4 border-b text-gray-700 text-center"
                      >
                        No records available for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-700">
          Please select a student to view records.
        </p>
      )}
    </div>
  );
};

export default StudentRecords;
