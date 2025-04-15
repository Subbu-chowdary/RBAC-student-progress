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

    if (!Array.isArray(students)) {
      console.warn("Students data is not an array:", students);
      return { reports: [], dates: [] };
    }

    students.forEach((student) => {
      if (!student || !Array.isArray(student.marks)) {
        console.warn("Invalid student or marks data:", student);
        return;
      }

      student.marks.forEach((mark) => {
        const studentId = student.studentId || "N/A";
        const studentName = student.name || "N/A";
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
        const marksObtained = mark.marks ?? 0;
        const totalMarks = mark.totalMarks ?? 100;
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
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by Name, Department, or Subject..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <label className="text-white">Rows per page:</label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
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

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-700">
                Showing {indexOfFirstRow + 1} to{" "}
                {Math.min(indexOfLastRow, filteredReports.length)} of{" "}
                {filteredReports.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-200"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {getPaginationRange().map((item, index) =>
                    item === "..." ? (
                      <span key={index} className="px-3 py-1 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => paginate(item)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === item
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  className="px-3 py-1 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
