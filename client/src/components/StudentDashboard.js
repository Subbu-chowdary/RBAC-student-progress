import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarks, fetchWeeklyReport } from "../redux/slices/studentSlice";
import Sidebar from "../components/Sidebar";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { marks, weeklyReport, loading, error } = useSelector(
    (state) => state.student
  );
  const [days] = useState(7);
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
  });

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);
    dispatch(fetchMarks());
    dispatch(fetchWeeklyReport({ days, startDate: weekStartDate }));
  }, [dispatch, days, weekStartDate]);

  const getGroupedMarks = (marksData) => {
    if (!marksData || !Array.isArray(marksData)) {
      return { grouped: {}, allDates: [], totalMarks: 100 };
    }
    const intermediateGrouped = marksData.reduce((acc, mark) => {
      const subjectId = mark?.subjectId?._id ?? mark?.subjectId ?? "unknown";
      const dateKey = mark?.testDate
        ? new Date(mark.testDate).toLocaleDateString()
        : "Unknown Date";
      if (!acc[subjectId]) acc[subjectId] = {};
      if (!acc[subjectId][dateKey]) {
        acc[subjectId][dateKey] = {
          marks: [],
          totalMarks: mark?.totalMarks ?? 100,
          subjectName: mark?.subjectId?.name ?? "Unknown Subject",
        };
      }
      acc[subjectId][dateKey].marks.push(mark?.marks ?? 0);
      return acc;
    }, {});

    const grouped = {};
    Object.entries(intermediateGrouped).forEach(([subjectId, dates]) => {
      grouped[subjectId] = {
        name: Object.values(dates)[0]?.subjectName ?? "Unknown Subject",
        marksByDate: {},
      };
      Object.entries(dates).forEach(([dateKey, { marks, totalMarks }]) => {
        const avgMarks = marks.reduce((sum, m) => sum + m, 0) / marks.length;
        grouped[subjectId].marksByDate[dateKey] = {
          marks: parseFloat(avgMarks.toFixed(2)),
          totalMarks,
          percentage: totalMarks
            ? `${((avgMarks / totalMarks) * 100).toFixed(0)}%`
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

  const getWeeklyAverages = (marksData, startDate) => {
    if (!marksData || !Array.isArray(marksData) || !startDate) {
      return { weeks: [], subjects: [] };
    }
    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);

    const groupedBySubject = marksData.reduce((acc, mark) => {
      const subjectId = mark?.subjectId?._id ?? mark?.subjectId ?? "unknown";
      if (!acc[subjectId]) {
        acc[subjectId] = {
          name: mark?.subjectId?.name ?? "Unknown Subject",
          marks: [],
        };
      }
      acc[subjectId].marks.push(mark);
      return acc;
    }, {});

    const weeks = [];
    const validDates = marksData
      .filter((mark) => mark?.testDate)
      .map((mark) => new Date(mark.testDate).getTime());
    if (validDates.length === 0) return { weeks: [], subjects: [] };

    const earliestDate = new Date(Math.min(...validDates));
    const latestDate = new Date(Math.max(...validDates));
    let currentWeekStart = new Date(weekStart);
    while (currentWeekStart <= latestDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd >= earliestDate) {
        weeks.push({
          start: new Date(currentWeekStart),
          end: new Date(weekEnd),
        });
      }
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    const weeklyAverages = Object.entries(groupedBySubject).map(
      ([subjectId, { name, marks }]) => {
        const weeklyData = weeks.map((week) => {
          const weekMarks = marks.filter((mark) => {
            const testDate = new Date(mark.testDate);
            return testDate >= week.start && testDate <= week.end;
          });
          if (weekMarks.length === 0)
            return { averageMarks: "-", percentage: "-" };
          const totalMarks = weekMarks[0]?.totalMarks ?? 100;
          const avgMarks =
            weekMarks.reduce((sum, m) => sum + (m.marks || 0), 0) /
            weekMarks.length;
          return {
            averageMarks: parseFloat(avgMarks.toFixed(2)),
            percentage: totalMarks
              ? `${((avgMarks / totalMarks) * 100).toFixed(0)}%`
              : "-",
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
    totalMarks,
  } = getGroupedMarks(marks);
  const { weeks, subjects: weeklyAverages } = getWeeklyAverages(
    marks,
    weekStartDate
  );

  return (
    <div className="flex min-h-screen bg-white transition-colors duration-300">
      <Sidebar role="student" />
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">
            Student Dashboard
          </h1>

          {loading && (
            <p className="text-blue-500 mb-6 font-medium">Loading...</p>
          )}
          {error && (
            <p className="text-red-500 mb-6 font-medium">Error: {error}</p>
          )}

          {/* Subject Marks Table */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-black mb-4 bg-white">
              Subject Marks
            </h2>
            {marks?.length > 0 ? (
              <div>
                <p className="font-medium text-black mb-4">
                  Each Category Total Marks: {totalMarks}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-black min-w-[150px] sticky left-0 z-10 font-semibold border-r border-gray-200">
                          Subject
                        </th>
                        {marksDates.map((date) => (
                          <th
                            key={date}
                            className="px-4 py-3 text-left text-black min-w-[150px] font-semibold border-r border-gray-200"
                          >
                            {date}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(marksGrouped).map(
                        ([subjectId, { name, marksByDate }]) => (
                          <tr key={subjectId}>
                            <td className="px-4 py-3 text-black sticky left-0 z-10 bg-white border border-gray-200">
                              {name}
                            </td>
                            {marksDates.map((date) => (
                              <td
                                key={date}
                                className="px-4 py-3 text-black border border-gray-200"
                              >
                                {marksByDate[date] ? (
                                  <span>
                                    {marksByDate[date].marks}{" "}
                                    <span className="text-blue-500">▼</span>{" "}
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
              <p className="text-black">No marks available.</p>
            )}
          </div>

          {/* Weekly Marks Table */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Weekly Marks Averages
            </h2>
            <div className="mb-6">
              <label className="text-black mr-2 font-medium">
                Select Week Starting Date (Monday):
              </label>
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  const dayOfWeek = selectedDate.getDay();
                  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                  selectedDate.setDate(selectedDate.getDate() + diff);
                  setWeekStartDate(selectedDate.toISOString().split("T")[0]);
                }}
                className="p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-black"
              />
            </div>
            {marks?.length > 0 && weeks.length > 0 ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-black min-w-[150px] sticky left-0 z-10 font-semibold border-r border-gray-200">
                          Subject
                        </th>
                        {weeks.map((week, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-black min-w-[150px] font-semibold border-r border-gray-200"
                          >
                            {week.start.toLocaleDateString()} -{" "}
                            {week.end.toLocaleDateString()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyAverages.map(({ subjectId, name, weeklyData }) => (
                        <tr key={subjectId}>
                          <td className="px-4 py-3 text-black sticky left-0 z-10 bg-white border border-gray-200">
                            {name}
                          </td>
                          {weeklyData.map((data, index) => (
                            <td
                              key={index}
                              className="px-4 py-3 text-black border border-gray-200"
                            >
                              {data.averageMarks !== "-" ? (
                                <span>
                                  {data.averageMarks}{" "}
                                  <span className="text-blue-500">▼</span>{" "}
                                  {data.percentage}
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
              <p className="text-black">No weekly averages available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
