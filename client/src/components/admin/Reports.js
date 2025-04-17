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
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredReports = reports.filter(
    (report) =>
      report.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
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
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      const leftSiblingIndex = Math.max(currentPage - 2, 1);
      const rightSiblingIndex = Math.min(currentPage + 2, totalPages);
      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
      range.push(1);
      if (shouldShowLeftDots) range.push("...");
      const start = shouldShowLeftDots ? leftSiblingIndex : 2;
      const end = shouldShowRightDots ? rightSiblingIndex : totalPages - 1;
      for (let i = start; i <= end; i++) range.push(i);
      if (shouldShowRightDots) range.push("...");
      if (totalPages > 1) range.push(totalPages);
    }
    return range;
  };

  if (loading)
    return (
      <div className="p-14 text-center text-themecolor-120 font-sans">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="p-14 text-center text-red-500 font-sans">{error}</div>
    );

  return (
    <div className="min-h-screen bg-themecolor-50 p-14">
      <div className="bg-themecolor-50 rounded-2xl shadow-soft p-14">
        <h2 className="text-2xl font-bold text-themecolor-900 mb-14 font-display">
          Student Marks Reports
        </h2>
        <div className="mb-14 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by Name, Department, or Subject..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/2 p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 placeholder-themecolor-120 font-sans"
          />
          <div className="flex items-center gap-2">
            <label className="text-themecolor-120 font-sans">
              Rows per page:
            </label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <p className="text-themecolor-120 font-sans">No reports found.</p>
        ) : (
          <>
            <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-themecolor-500 scrollbar-track-themecolor-100">
              <table className="w-full bg-themecolor-50 border border-themecolor-400">
                <thead className="sticky top-0 bg-themecolor-50 z-10">
                  <tr>
                    <th className="py-2 px-4 border-b border-themecolor-400 text-left text-themecolor-900 sticky left-0 bg-themecolor-50 z-20 min-w-[150px] font-display">
                      Name
                    </th>
                    <th className="py-2 px-4 border-b border-themecolor-400 text-left text-themecolor-900 sticky left-[150px] bg-themecolor-50 z-20 min-w-[200px] font-display">
                      Department
                    </th>
                    <th className="py-2 px-4 border-b border-themecolor-400 text-left text-themecolor-900 sticky left-[350px] bg-themecolor-50 z-20 min-w-[200px] font-display">
                      Subject
                    </th>
                    {dates.map((date) => (
                      <th
                        key={date}
                        className="py-2 px-4 border-b border-themecolor-400 text-left text-themecolor-900 min-w-[120px] font-display"
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
                      className="hover:bg-themecolor-200 transition-colors duration-200"
                    >
                      <td className="py-2 px-4 border-b border-themecolor-400 text-themecolor-120 sticky left-0 bg-themecolor-50 z-20 min-w-[150px] font-sans">
                        {report.studentName}
                      </td>
                      <td className="py-2 px-4 border-b border-themecolor-400 text-themecolor-120 sticky left-[150px] bg-themecolor-50 z-20 min-w-[200px] font-sans">
                        {report.department}
                      </td>
                      <td className="py-2 px-4 border-b border-themecolor-400 text-themecolor-120 sticky left-[350px] bg-themecolor-50 z-20 min-w-[200px] font-sans">
                        {report.subject}
                      </td>
                      {dates.map((date) => {
                        const markData = report.marksByDate[date];
                        return (
                          <td
                            key={date}
                            className="py-2 px-4 border-b border-themecolor-400 text-themecolor-120 min-w-[120px] font-sans"
                          >
                            {markData ? (
                              <span className="flex flex-row">
                                {markData.marks}/{markData.totalMarks}
                                <span
                                  className={
                                    parseInt(markData.percentage) > 59
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  {parseInt(markData.percentage) > 59
                                    ? "▲"
                                    : "▼"}
                                </span>
                                <span className="text-themecolor-120">
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

            <div className="mt-14 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-themecolor-120 font-sans">
                Showing {indexOfFirstRow + 1} to{" "}
                {Math.min(indexOfLastRow, filteredReports.length)} of{" "}
                {filteredReports.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft disabled:bg-themecolor-300 disabled:cursor-not-allowed hover:bg-themecolor-700 transition-colors duration-200 font-sans"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {getPaginationRange().map((item, index) =>
                    item === "..." ? (
                      <span
                        key={index}
                        className="px-3 py-1 text-themecolor-120 font-sans"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => paginate(item)}
                        className={`px-3 py-1 rounded-3xl shadow-soft ${
                          currentPage === item
                            ? "bg-themecolor-600 text-themecolor-50"
                            : "bg-themecolor-100 text-themecolor-120 hover:bg-themecolor-200"
                        } transition-colors duration-200 font-sans`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft disabled:bg-themecolor-300 disabled:cursor-not-allowed hover:bg-themecolor-700 transition-colors duration-200 font-sans"
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
