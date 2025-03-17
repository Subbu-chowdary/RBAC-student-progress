import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarks, fetchWeeklyReport } from "../redux/slices/studentSlice";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { marks, weeklyReport, loading, error } = useSelector(
    (state) => state.student
  );

  useEffect(() => {
    dispatch(fetchMarks());
    dispatch(fetchWeeklyReport());
  }, [dispatch]);

  // Group marks by subject and prepare table data
  const getGroupedMarks = (marksData) => {
    if (!marksData || !Array.isArray(marksData)) {
      return { grouped: {}, allDates: [], totalMarks: 100 };
    }

    const grouped = marksData.reduce((acc, mark) => {
      const subjectId = mark?.subjectId?._id || mark?.subjectId || "unknown";
      if (!acc[subjectId]) {
        acc[subjectId] = {
          name: mark?.subjectId?.name || "Unknown Subject",
          marksByDate: {},
        };
      }
      const dateKey = mark?.testDate
        ? new Date(mark.testDate).toLocaleDateString()
        : "Unknown Date";
      acc[subjectId].marksByDate[dateKey] = {
        marks: mark?.marks || 0,
        totalMarks: mark?.totalMarks || 100,
        percentage:
          mark?.marks && mark?.totalMarks
            ? ((mark.marks / mark.totalMarks) * 100).toFixed(0) + "%"
            : "N/A",
      };
      return acc;
    }, {});

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

  const {
    grouped: marksGrouped,
    allDates: marksDates,
    totalMarks: marksTotal,
  } = getGroupedMarks(marks);
  const {
    grouped: weeklyGrouped,
    allDates: weeklyDates,
    totalMarks: weeklyTotal,
  } = getGroupedMarks(weeklyReport);

  return (
    <div>
      <h1>Student Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Your Marks</h2>
      {marks?.length > 0 ? (
        <div>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Each Category Total Marks: {marksTotal}
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    minWidth: "120px",
                  }}
                >
                  Subject
                </th>
                {marksDates.map((date) => (
                  <th
                    key={date}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      minWidth: "120px",
                    }}
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
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {name}
                    </td>
                    {marksDates.map((date) => (
                      <td
                        key={date}
                        style={{ border: "1px solid #ddd", padding: "8px" }}
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
      ) : (
        <p>No marks available.</p>
      )}

      <h2>Weekly Report</h2>
      {weeklyReport?.length > 0 ? (
        <div>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Each Category Total Marks: {weeklyTotal}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    minWidth: "120px",
                  }}
                >
                  Subject
                </th>
                {weeklyDates.map((date) => (
                  <th
                    key={date}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      minWidth: "120px",
                    }}
                  >
                    {date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(weeklyGrouped).map(
                ([subjectId, { name, marksByDate }]) => (
                  <tr key={subjectId}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {name}
                    </td>
                    {weeklyDates.map((date) => (
                      <td
                        key={date}
                        style={{ border: "1px solid #ddd", padding: "8px" }}
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
      ) : (
        <p>No weekly report available.</p>
      )}
    </div>
  );
};

export default StudentDashboard;
