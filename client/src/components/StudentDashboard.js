// college-portal/client/src/pages/StudentDashboard.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarks, fetchWeeklyReport } from "../redux/slices/studentSlice";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { marks, weeklyReport, loading, error } = useSelector(
    (state) => state.student
  );
  const [days, setDays] = useState(7); // Default to 7 days for weekly report
  const [weekStartDate, setWeekStartDate] = useState(() => {
    // Default to the start of the current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  });

  useEffect(() => {
    // Initialize dark mode on mount
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);

    // Fetch marks and weekly report
    dispatch(fetchMarks());
    dispatch(fetchWeeklyReport({ days }));
  }, [dispatch, days]);

  // Group marks by subject and prepare table data, averaging marks on the same day
  const getGroupedMarks = (marksData) => {
    if (!marksData || !Array.isArray(marksData)) {
      return { grouped: {}, allDates: [], totalMarks: 100 };
    }

    // First, group marks by subject and date to handle duplicates
    const intermediateGrouped = marksData.reduce((acc, mark) => {
      const subjectId = mark?.subjectId?._id || mark?.subjectId || "unknown";
      const dateKey = mark?.testDate
        ? new Date(mark.testDate).toLocaleDateString()
        : "Unknown Date";

      if (!acc[subjectId]) {
        acc[subjectId] = {};
      }
      if (!acc[subjectId][dateKey]) {
        acc[subjectId][dateKey] = {
          marks: [],
          totalMarks: mark?.totalMarks || 100,
          subjectName: mark?.subjectId?.name || "Unknown Subject",
        };
      }
      acc[subjectId][dateKey].marks.push(mark?.marks || 0);
      return acc;
    }, {});

    // Now, average the marks for each subject and date
    const grouped = {};
    Object.entries(intermediateGrouped).forEach(([subjectId, dates]) => {
      grouped[subjectId] = {
        name: Object.values(dates)[0].subjectName,
        marksByDate: {},
      };
      Object.entries(dates).forEach(([dateKey, { marks, totalMarks }]) => {
        const avgMarks = marks.reduce((sum, m) => sum + m, 0) / marks.length;
        grouped[subjectId].marksByDate[dateKey] = {
          marks: parseFloat(avgMarks.toFixed(2)),
          totalMarks,
          percentage:
            avgMarks && totalMarks
              ? ((avgMarks / totalMarks) * 100).toFixed(0) + "%"
              : "N/A",
        };
      });
    });

    const allDates = Array.from(
      new Set(
        marksData
          .filter((mark) => mark?.testDate)
          .map((mark) => new Date(mark.testDate).toLocaleDateString())
      )
    ).sort((a, b) => new Date(a) - new Date(b));

    const totalMarks =
      marksData.length > 0 && marksData[0]?.totalMarks
        ? marksData[0].totalMarks
        : 100;

    return { grouped, allDates, totalMarks };
  };

  // Calculate weekly averages for each subject, week by week
  const getWeeklyAverages = (marksData, startDate) => {
    if (!marksData || !Array.isArray(marksData) || !startDate) {
      return { weeks: [], subjects: [] };
    }

    // Parse the start date
    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);

    // Group marks by subject
    const groupedBySubject = marksData.reduce((acc, mark) => {
      const subjectId = mark?.subjectId?._id || mark?.subjectId || "unknown";
      if (!acc[subjectId]) {
        acc[subjectId] = {
          name: mark?.subjectId?.name || "Unknown Subject",
          marks: [],
        };
      }
      acc[subjectId].marks.push(mark);
      return acc;
    }, {});

    // Define weeks starting from the selected date
    const weeks = [];
    const earliestDate = new Date(
      Math.min(
        ...marksData
          .filter((mark) => mark?.testDate)
          .map((mark) => new Date(mark.testDate).getTime())
      )
    );
    const latestDate = new Date(
      Math.max(
        ...marksData
          .filter((mark) => mark?.testDate)
          .map((mark) => new Date(mark.testDate).getTime())
      )
    );

    let currentWeekStart = new Date(weekStart);
    while (currentWeekStart <= latestDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // End of the week (7 days total)

      if (weekEnd >= earliestDate) {
        weeks.push({
          start: new Date(currentWeekStart),
          end: new Date(weekEnd),
        });
      }
      currentWeekStart.setDate(currentWeekStart.getDate() + 7); // Move to next week
    }

    // Calculate averages for each subject for each week
    const weeklyAverages = Object.entries(groupedBySubject).map(
      ([subjectId, { name, marks }]) => {
        const weeklyData = weeks.map((week) => {
          // Filter marks for this week
          const weekMarks = marks.filter((mark) => {
            const testDate = new Date(mark.testDate);
            return testDate >= week.start && testDate <= week.end;
          });

          if (weekMarks.length === 0) {
            return { averageMarks: "-", percentage: "-" };
          }

          // Group by date to handle duplicates
          const marksByDate = weekMarks.reduce((acc, mark) => {
            const dateKey = new Date(mark.testDate).toLocaleDateString();
            if (!acc[dateKey]) {
              acc[dateKey] = [];
            }
            acc[dateKey].push(mark.marks);
            return acc;
          }, {});

          // Average marks per day
          const averagedMarksByDate = Object.values(marksByDate).map(
            (dailyMarks) =>
              dailyMarks.reduce((sum, m) => sum + m, 0) / dailyMarks.length
          );

          // Calculate weekly average
          const totalMarks = weekMarks[0]?.totalMarks || 100;
          const weeklyAverage =
            averagedMarksByDate.reduce((sum, avg) => sum + avg, 0) /
            averagedMarksByDate.length;

          return {
            averageMarks: parseFloat(weeklyAverage.toFixed(2)),
            percentage:
              parseFloat(((weeklyAverage / totalMarks) * 100).toFixed(0)) + "%",
          };
        });

        return { subjectId, name, weeklyData };
      }
    );

    return { weeks, subjects: weeklyAverages };
  };

  const {
    grouped: marksGrouped,
    allDates: marksDates,
    totalMarks: marksTotal,
  } = getGroupedMarks(marks);

  const { weeks, subjects: weeklyAverages } = getWeeklyAverages(
    marks,
    weekStartDate
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Student Dashboard
        </h1>

        {/* Loading and Error Messages */}
        {loading && (
          <p className="text-blue-500 dark:text-blue-400 mb-4">Loading...</p>
        )}
        {error && (
          <p className="text-red-500 dark:text-red-400 mb-4">Error: {error}</p>
        )}

        {/* Subject Marks Table */}
        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Subject Marks
          </h2>
          {marks?.length > 0 ? (
            <div>
              <p className="font-bold text-gray-700 dark:text-white mb-4">
                Each Category Total Marks: {marksTotal}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-black">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white min-w-[120px] sticky left-0 z-10 bg-gray-200 dark:bg-black">
                        Subject
                      </th>
                      {marksDates.map((date) => (
                        <th
                          key={date}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white min-w-[120px]"
                        >
                          {date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(marksGrouped).map(
                      ([subjectId, { name, marksByDate }]) => (
                        <tr
                          key={subjectId}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white sticky left-0 z-10 bg-white dark:bg-black">
                            {name}
                          </td>
                          {marksDates.map((date) => (
                            <td
                              key={date}
                              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white"
                            >
                              {marksByDate[date] ? (
                                <span>
                                  {marksByDate[date].marks} ▼{" "}
                                  {marksByDate[date].percentage}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-white">No marks available.</p>
          )}
        </div>

        {/* Weekly Marks Table */}
        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Weekly Marks Averages
          </h2>
          <div className="mb-4">
            <label className="text-gray-700 dark:text-white mr-2">
              Select Week Starting Date (Monday):
            </label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                // Ensure the selected date is a Monday
                const dayOfWeek = selectedDate.getDay();
                const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
                selectedDate.setDate(selectedDate.getDate() + diff);
                setWeekStartDate(selectedDate.toISOString().split("T")[0]);
              }}
              className="p-2 border-2 border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
          {marks?.length > 0 && weeks.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-black">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white min-w-[120px] sticky left-0 z-10 bg-gray-200 dark:bg-black">
                        Subject
                      </th>
                      {weeks.map((week, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white min-w-[120px]"
                        >
                          {week.start.toLocaleDateString()} -{" "}
                          {week.end.toLocaleDateString()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyAverages.map(({ subjectId, name, weeklyData }) => (
                      <tr
                        key={subjectId}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white sticky left-0 z-10 bg-white dark:bg-black">
                          {name}
                        </td>
                        {weeklyData.map((data, index) => (
                          <td
                            key={index}
                            className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white"
                          >
                            {data.averageMarks !== "-" ? (
                              <span>
                                {data.averageMarks} ▼ {data.percentage}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-white">
              No weekly averages available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
