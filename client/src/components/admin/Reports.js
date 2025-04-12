// college-portal/client/src/components/admin/Reports.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents } from "../../redux/slices/adminSlice";

const Reports = () => {
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const pivotData = () => {
    const groupedData = {};
    const allDates = new Set();

    students.forEach((student) => {
      (student.marks || []).forEach((mark) => {
        const studentId = student.studentId;
        const studentName = student.name;
        const department = student.department?.name || "N/A";
        const subject = mark.subjectId?.name || "N/A";

        let testDate;
        if (typeof mark.testDate === "string") {
          testDate = new Date(mark.testDate);
        } else if (mark.testDate instanceof Date) {
          testDate = mark.testDate;
        } else {
          console.warn(
            `Invalid testDate for student ${studentId}:`,
            mark.testDate
          );
          return;
        }

        if (isNaN(testDate.getTime())) {
          console.warn(
            `Invalid testDate for student ${studentId}:`,
            mark.testDate
          );
          return;
        }

        const testDateString = testDate.toISOString().split("T")[0];
        const marksObtained = mark.marks;
        const totalMarks = mark.totalMarks;
        const percentage =
          ((marksObtained / totalMarks) * 100).toFixed(0) + "%";

        allDates.add(testDateString);

        const key = `${studentId}-${studentName}-${department}-${subject}`;
        if (!groupedData[key]) {
          groupedData[key] = {
            studentId,
            studentName,
            department,
            subject,
            marksByDate: {},
          };
        }

        groupedData[key].marksByDate[testDateString] = {
          marks: marksObtained,
          totalMarks,
          percentage,
        };
      });
    });

    const reports = Object.values(groupedData);
    const dates = [...allDates].sort();

    return { reports, dates };
  };

  const { reports, dates } = pivotData();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // State for search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Number of rows per page

  // Filter reports based on search query
  const filteredReports = reports.filter(
    (report) =>
      report.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="p-6 text-center text-gray-700">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="m-6">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">
          Student Marks Reports
        </h2>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Name, Department, or Subject..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full md:w-1/2 lg:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredReports.length === 0 ? (
          <p className="text-gray-700">No reports found.</p>
        ) : (
          <>
            <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <table className="w-full bg-white border border-gray-300">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-gray-700 sticky left-0 bg-gray-100 z-20 min-w-[150px]">
                      Name
                    </th>
                    <th className="py-2 px-4 border-b text-left text-gray-700 sticky left-[150px] bg-gray-100 z-20 min-w-[200px]">
                      Department
                    </th>
                    <th className="py-2 px-4 border-b text-left text-gray-700 sticky left-[350px] bg-gray-100 z-20 min-w-[200px]">
                      Subject
                    </th>
                    {dates.map((date) => (
                      <th
                        key={date}
                        className="py-2 px-4 border-b text-left text-gray-700 min-w-[120px]"
                      >
                        {formatDate(date)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentReports.map((report, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-2 px-4 border-b text-gray-700 sticky left-0 bg-white z-20 min-w-[150px]">
                        {report.studentName}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-700 sticky left-[150px] bg-white z-20 min-w-[200px]">
                        {report.department}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-700 sticky left-[350px] bg-white z-20 min-w-[200px]">
                        {report.subject}
                      </td>
                      {dates.map((date) => {
                        const markData = report.marksByDate[date];
                        return (
                          <td
                            key={date}
                            className="py-2 px-4 border-b text-gray-700 min-w-[120px]"
                          >
                            {markData ? (
                              <span className="flex items-center gap-1">
                                {markData.marks} / {markData.totalMarks}
                                <span
                                  className={
                                    parseInt(markData.percentage) < 60
                                      ? "text-red-500"
                                      : "text-blue-500"
                                  }
                                >
                                  ▼
                                </span>
                                <span className="text-gray-500">
                                  ({markData.percentage})
                                </span>
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
