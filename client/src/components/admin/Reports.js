// college-portal/client/src/components/admin/Reports.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents } from "../../redux/slices/adminSlice";

import Spinner from "../Spinner";

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

        // Convert testDate to a Date object if it's a string
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
          return; // Skip this mark if testDate is invalid
        }

        // Ensure testDate is valid before proceeding
        if (isNaN(testDate.getTime())) {
          console.warn(
            `Invalid testDate for student ${studentId}:`,
            mark.testDate
          );
          return; // Skip this mark if testDate is invalid
        }

        const testDateString = testDate.toISOString().split("T")[0]; // Now safe to call toISOString
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
      return "Invalid Date"; // Handle invalid dates gracefully
    }
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-700"><Spinner/></div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">
        Student Marks Reports
      </h2>
      {reports.length === 0 ? (
        <p className="text-gray-700">No reports available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left text-gray-700">
                  Name
                </th>
                <th className="py-2 px-4 border-b text-left text-gray-700">
                  Category
                </th>
                {dates.map((date) => (
                  <th
                    key={date}
                    className="py-2 px-4 border-b text-left text-gray-700"
                  >
                    {formatDate(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-700">
                    {report.studentName}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-700">
                    {report.subject}
                  </td>
                  {dates.map((date) => {
                    const markData = report.marksByDate[date];
                    return (
                      <td
                        key={date}
                        className="py-2 px-4 border-b text-gray-700"
                      >
                        {markData ? (
                          <>
                            {markData.marks}{" "}
                            <span className="text-blue-500">▼</span>{" "}
                            <span className="text-gray-500">
                              {markData.percentage}
                            </span>
                          </>
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
      )}
    </div>
  );
};

export default Reports;
