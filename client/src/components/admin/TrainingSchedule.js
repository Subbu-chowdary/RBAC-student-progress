import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrainingSchedules,
  fetchSubjects,
  fetchDepartments,
} from "../../redux/slices/adminSlice";
import { Chart } from "react-google-charts";
import api from "../../services/api";

// Utility function to convert days to milliseconds, as in the reference
function daysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

const TrainingSchedule = () => {
  const dispatch = useDispatch();
  const { trainingSchedules, subjects, loading, error, departments } =
    useSelector((state) => state.admin);

  // State for form data and selected month
  const [formData, setFormData] = useState({
    subjectId: "",
    startDate: "",
    duration: "",
    departmentId: "",
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month (1-12)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  // Log the state for debugging
  useEffect(() => {
    console.log("Training Schedules:", trainingSchedules);
    console.log("Subjects:", subjects);
    console.log("Departments:", departments);
    console.log("Loading:", loading);
    console.log("Error:", error);
  }, [trainingSchedules, subjects, departments, loading, error]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchTrainingSchedules());
    dispatch(fetchSubjects());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/admin/training-schedules", formData);
      console.log("Response from POST:", response.data);
      dispatch(fetchTrainingSchedules());
      setFormData({
        subjectId: "",
        startDate: "",
        duration: "",
        departmentId: "",
      });
    } catch (error) {
      console.error(
        "Error adding training schedule:",
        error.response?.data || error.message
      );
    }
  };

  // Group schedules by subject and aggregate into a single task per subject
  const groupedSchedules = trainingSchedules.reduce((acc, schedule) => {
    const subjectName = schedule.subjectId?.name || "Unknown Subject";
    const deptName = schedule.departmentId?.name || "Unknown Dept";
    const filteredDates = schedule.classDates.filter((classDate) => {
      const date = new Date(classDate);
      return (
        date.getMonth() + 1 === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });

    if (filteredDates.length > 0) {
      const startDate = new Date(filteredDates[0]);
      const endDate = new Date(filteredDates[filteredDates.length - 1]);
      endDate.setDate(endDate.getDate() + 1); // Include the last day

      if (!acc[subjectName]) {
        acc[subjectName] = {
          startDate,
          endDate,
          departments: new Set(),
          totalClasses: 0,
        };
      }

      // Update the earliest start date and latest end date
      if (startDate < acc[subjectName].startDate) {
        acc[subjectName].startDate = startDate;
      }
      if (endDate > acc[subjectName].endDate) {
        acc[subjectName].endDate = endDate;
      }

      // Add department and increment total classes
      acc[subjectName].departments.add(deptName);
      acc[subjectName].totalClasses += filteredDates.length;
    }
    return acc;
  }, {});

  // Prepare data for the Gantt chart (one bar per subject, matching reference structure)
  const chartData = [
    [
      { type: "string", label: "Task ID" },
      { type: "string", label: "Task Name" },
      { type: "date", label: "Start Date" },
      { type: "date", label: "End Date" },
      { type: "number", label: "Duration" },
      { type: "number", label: "Percent Complete" },
      { type: "string", label: "Dependencies" },
    ],
    ...Object.entries(groupedSchedules).map(([subjectName, data], index) => {
      const departmentsArray = Array.from(data.departments);
      const durationInDays = Math.ceil(
        (data.endDate - data.startDate) / (24 * 60 * 60 * 1000)
      ); // Calculate duration in days
      return [
        `${subjectName}-${index}`, // Unique ID per subject
        `${subjectName} (${departmentsArray.join(", ")})`,
        data.startDate,
        data.endDate,
        daysToMilliseconds(durationInDays), // Convert duration to milliseconds
        100,
        null,
      ];
    }),
  ];

  // Log chartData for debugging
  useEffect(() => {
    console.log("Chart Data:", chartData);
  }, [chartData, selectedMonth, selectedYear]);

  // Prepare monthly data summary (one row per subject)
  const monthlyData = Object.entries(groupedSchedules).map(
    ([subjectName, data]) => ({
      task: subjectName,
      departments: Array.from(data.departments).join(", "),
      startDate: data.startDate.toLocaleDateString(),
      totalClasses: data.totalClasses,
    })
  );

  const options = {
    height: Math.max(100, (chartData.length - 1) * 40 + 50),
    gantt: {
      trackHeight: 30,
      defaultStyle: {
        fill: "#4CAF50", // Single color for all bars (green, as an example)
        stroke: "#388E3C", // Slightly darker border for contrast
        label: { color: "#333333" },
      },
      barCornerRadius: 3,
      labelStyle: {
        fontName: "Arial",
        fontSize: 12,
        color: "#333333",
      },
      criticalPathEnabled: false,
      innerGridTrack: { fill: "#F5F5F5" },
      innerGridDarkTrack: { fill: "#E0E0E0" },
      arrow: {
        color: "#666666",
        width: 2,
      },
      sortTasks: true, // Sort tasks to group by subject
    },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Training Schedule
      </h1>

      {/* Month and Year Selector */}
      <div className="mb-6 flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() + i - 2;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Form to Add New Training Schedule */}
      {/* <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">
          Add New Training Schedule
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-4 rounded shadow"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name || department._id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (days)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Schedule
          </button>
        </form>
      </div> */}

      {/* Gantt Chart */}
      <div className="overflow-x-auto mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">{`${new Date(
          selectedYear,
          selectedMonth - 1
        ).toLocaleString("default", { month: "long" })} ${selectedYear}`}</h2>
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {trainingSchedules.length > 0 ? (
          <Chart
            chartType="Gantt"
            width="100%"
            height="100%"
            data={chartData}
            options={options}
          />
        ) : (
          !loading && (
            <p className="text-gray-600">No training schedules available.</p>
          )
        )}
      </div>

      {/* Monthly Data Summary */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">
          Monthly Data Summary
        </h2>
        {monthlyData.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Task</th>
                <th className="border p-2">Departments</th>
                <th className="border p-2">Start Date</th>
                <th className="border p-2">Total Classes</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-100" : ""}
                >
                  <td className="border p-2">{data.task}</td>
                  <td className="border p-2">{data.departments}</td>
                  <td className="border p-2">{data.startDate}</td>
                  <td className="border p-2">{data.totalClasses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No data for the selected month.</p>
        )}
      </div>
    </div>
  );
};

export default TrainingSchedule;
