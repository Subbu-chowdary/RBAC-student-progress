import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrainingSchedules,
  fetchSubjects,
  fetchDepartments,
} from "../../redux/slices/adminSlice";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";

function daysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

const TrainingSchedule = () => {
  const dispatch = useDispatch();
  const { trainingSchedules, subjects, departments, loading, error } =
    useSelector((state) => state.admin);

  const [visibleTimeStart, setVisibleTimeStart] = useState(
    moment("2025-04-01").startOf("day").valueOf()
  );
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(
    moment("2025-07-31").startOf("day").valueOf()
  );
  const [zoomLevel, setZoomLevel] = useState(90);

  const minZoomDays = 7;
  const maxZoomDays = 120;
  const zoomStep = 7;
  const moveStepDays = 7; // Constant movement step

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchTrainingSchedules());
    dispatch(fetchSubjects());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Dynamically adjust timeline range based on data (only on initial load)
  useEffect(() => {
    if (trainingSchedules.length > 0) {
      const allDates = trainingSchedules.flatMap((s) => s.classDates || []);
      console.log("All Dates:", allDates); // Debug: Check classDates
      if (allDates.length > 0) {
        const minDate = moment.min(allDates.map((d) => moment(d)));
        const maxDate = moment.max(allDates.map((d) => moment(d)));
        setVisibleTimeStart(minDate.startOf("day").valueOf());
        setVisibleTimeEnd(maxDate.add(1, "day").startOf("day").valueOf());
      }
    }
  }, [trainingSchedules]);

  // Prepare groups (subjects)
  const groups = subjects.map((subject) => ({
    id: subject._id,
    title: subject.name || "Unknown Subject",
  }));
  console.log("Groups:", groups); // Debug: Check subjects

  // Prepare items (one item per class date) with enforced canMove: false
  const items = trainingSchedules.flatMap((schedule) => {
    const subjectName =
      subjects.find(
        (s) => s._id === (schedule.subjectId._id || schedule.subjectId)
      )?.name || "Unknown";
    const classDates = schedule.classDates || [];
    console.log("Schedule:", schedule); // Debug: Check each schedule
    console.log("Class Dates:", classDates); // Debug: Check classDates array
    return classDates.map((classDate, index) => {
      const start = moment(classDate).startOf("day").valueOf();
      const end = moment(classDate).endOf("day").valueOf();
      return {
        id: `${schedule._id}-${index}`,
        group: schedule.subjectId._id || schedule.subjectId,
        title: `${subjectName} - Day ${index + 1}`,
        start_time: start,
        end_time: end,
        canMove: false, // Explicitly set to false for each item
        canResize: false, // Explicitly set to false for each item
      };
    });
  });
  console.log("Items:", items); // Debug: Check generated items

  const handleZoomIn = () => {
    const newZoomLevel = Math.max(minZoomDays, zoomLevel - zoomStep);
    setZoomLevel(newZoomLevel);
    const newEnd = moment(visibleTimeStart)
      .add(newZoomLevel, "days")
      .startOf("day")
      .valueOf();
    setVisibleTimeEnd(newEnd);
    console.log(
      "Zoom In - New Range:",
      moment(visibleTimeStart).format("MMMM D, YYYY"),
      moment(newEnd).format("MMMM D, YYYY")
    ); // Debug range
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.min(maxZoomDays, zoomLevel + zoomStep);
    setZoomLevel(newZoomLevel);
    const newEnd = moment(visibleTimeStart)
      .add(newZoomLevel, "days")
      .startOf("day")
      .valueOf();
    setVisibleTimeEnd(newEnd);
    console.log(
      "Zoom Out - New Range:",
      moment(visibleTimeStart).format("MMMM D, YYYY"),
      moment(newEnd).format("MMMM D, YYYY")
    ); // Debug range
  };

  const handleMoveLeft = () => {
    const currentCenter = (visibleTimeStart + visibleTimeEnd) / 2;
    const newCenter = moment(currentCenter)
      .subtract(moveStepDays, "days")
      .valueOf();
    const newRange = visibleTimeEnd - visibleTimeStart;
    const newStart = moment(newCenter - newRange / 2)
      .startOf("day")
      .valueOf();
    const newEnd = moment(newCenter + newRange / 2)
      .startOf("day")
      .valueOf();
    setVisibleTimeStart(newStart);
    setVisibleTimeEnd(newEnd);
    console.log(
      "Move Left - New Range:",
      moment(newStart).format("MMMM D, YYYY"),
      moment(newEnd).format("MMMM D, YYYY")
    ); // Debug range
  };

  const handleMoveRight = () => {
    const currentCenter = (visibleTimeStart + visibleTimeEnd) / 2;
    const newCenter = moment(currentCenter).add(moveStepDays, "days").valueOf();
    const newRange = visibleTimeEnd - visibleTimeStart;
    const newStart = moment(newCenter - newRange / 2)
      .startOf("day")
      .valueOf();
    const newEnd = moment(newCenter + newRange / 2)
      .startOf("day")
      .valueOf();
    setVisibleTimeStart(newStart);
    setVisibleTimeEnd(newEnd);
    console.log(
      "Move Right - New Range:",
      moment(newStart).format("MMMM D, YYYY"),
      moment(newEnd).format("MMMM D, YYYY")
    ); // Debug range
  };

  const timeSteps = {
    second: 0,
    minute: 0,
    hour: 0,
    day: 1, // Ensures daily alignment for headers
    month: 1,
    year: 1,
  }; // Daily granularity

  return (
    <div
      className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900"
      style={{ overflowX: "hidden" }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-2 dark:text-white">
          Training Schedule
        </h1>

        <div className="flex justify-end mb-6 space-x-3">
          <button
            onClick={handleMoveLeft}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition duration-200"
          >
            ← Move Left
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel <= minZoomDays}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
          >
            Zoom In
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel >= maxZoomDays}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
          >
            Zoom Out
          </button>
          <button
            onClick={handleMoveRight}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition duration-200"
          >
            Move Right →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 dark:text-gray-300">
              Schedule: {moment(visibleTimeStart).format("MMMM D, YYYY")} -{" "}
              {moment(visibleTimeEnd).format("MMMM D, YYYY")}
            </h2>

            {loading && (
              <p className="text-gray-500 text-center py-4 dark:text-gray-400">
                Loading schedules...
              </p>
            )}
            {error && (
              <p className="text-red-600 text-center py-4 font-medium dark:text-red-400">
                {error}
              </p>
            )}

            {groups.length > 0 && items.length > 0 ? (
              <div className="relative" style={{ overflowX: "hidden" }}>
                <Timeline
                  groups={groups}
                  items={items}
                  visibleTimeStart={visibleTimeStart}
                  visibleTimeEnd={visibleTimeEnd}
                  // Removed onTimeChange to disable drag-based movement
                  minZoom={daysToMilliseconds(minZoomDays)}
                  maxZoom={daysToMilliseconds(maxZoomDays)}
                  lineHeight={60} // Increased for better row height
                  itemHeightRatio={0.9}
                  sidebarWidth={300}
                  sidebarContent={
                    <div className="p-4 bg-gray-100 text-gray-800 font-semibold dark:bg-gray-700 dark:text-gray-200">
                      Subjects
                    </div>
                  }
                  stackItems={false}
                  timeSteps={timeSteps}
                  dragSnap={daysToMilliseconds(1)} // Ensures snapping to day boundaries
                  traditionalZoom={false} // Disable mouse wheel zooming
                  canMove={false} // Disable item movement at timeline level
                  canResize={false} // Disable item resizing at timeline level
                  className="rounded-md border border-gray-200"
                  key={`${visibleTimeStart}-${visibleTimeEnd}`} // Force re-render on range change
                />
                <style jsx global>{`
                  .rct-timeline {
                    border: 1px solid #e5e7eb !important;
                    user-select: none !important; /* Prevent text selection during drag */
                    overflow-x: hidden !important; /* Prevent horizontal scrolling */
                    pointer-events: none !important; /* Disable all mouse events on timeline */
                    background-color: #ffffff !important;
                    dark: bg-gray-800 !important; /* Dark mode background */
                  }
                  .rct-scroller {
                    overflow-x: hidden !important; /* Explicitly disable scroller movement */
                    pointer-events: none !important; /* Disable mouse interactions on scroller */
                  }
                  .rct-header {
                    background-color: #f9fafb !important;
                    border-bottom: 2px solid #e5e7eb !important;
                    font-weight: 600 !important;
                    color: #374151 !important;
                    padding: 8px !important;
                    min-height: 40px !important;
                    dark: bg-gray-700 !important;
                    dark: border-b-gray-600 !important;
                    dark: text-gray-300 !important;
                  }
                  .rct-sidebar {
                    background-color: #f3f4f6 !important;
                    border-right: 2px solid #e5e7eb !important;
                    font-size: 14px !important;
                    padding: 8px !important;
                    dark: bg-gray-700 !important;
                    dark: border-r-gray-600 !important;
                    dark: text-gray-300 !important;
                  }
                  .rct-item {
                    background-color: #4f46e5 !important;
                    color: white !important;
                    border: 1px solid #4338ca !important;
                    border-radius: 4px !important;
                    font-size: 12px !important;
                    padding: 4px 8px !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                    margin: 4px 0 !important; /* Increased spacing between items */
                    -webkit-user-drag: none !important;
                    -khtml-user-drag: none !important;
                    -moz-user-drag: none !important;
                    -o-user-drag: none !important;
                    user-drag: none !important;
                    pointer-events: none !important; /* Disable all pointer events on items */
                  }
                  .rct-item:hover {
                    background-color: #4338ca !important;
                  }
                  .rct-dateHeader {
                    background-color: #ffffff !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    font-size: 12px !important;
                    color: #6b7280 !important;
                    padding: 4px !important;
                    min-height: 30px !important;
                    transition: transform 0.3s ease !important; /* Smooth movement with scroller */
                    dark: bg-gray-700 !important;
                    dark: border-b-gray-600 !important;
                    dark: color-gray-300 !important;
                  }
                  .rct-vertical-lines {
                    border-left: 1px solid #e5e7eb !important;
                    dark: border-left-gray-600 !important;
                  }
                  .rct-horizontal-lines {
                    border-top: 1px solid #e5e7eb !important;
                    dark: border-top-gray-600 !important;
                  }
                  .rct-canvas {
                    pointer-events: none !important; /* Disable all mouse interactions on canvas */
                  }
                  /* Ensure buttons remain interactive */
                  button {
                    pointer-events: auto !important;
                  }
                `}</style>
              </div>
            ) : (
              !loading && (
                <p className="text-gray-500 text-center py-4 dark:text-gray-400">
                  No training schedules available.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingSchedule;
// // Uncomment the following code if you want to use the Gantt chart instead of the timeline below
// //import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchTrainingSchedules,
//   fetchSubjects,
//   fetchDepartments,
// } from "../../redux/slices/adminSlice";
// import { Chart } from "react-google-charts";
// import api from "../../services/api";

// // Utility function to convert days to milliseconds, as in the reference
// //function daysToMilliseconds(days) {
//   //return days * 24 * 60 * 60 * 1000;
// //}

// //const TrainingSchedule = () => {
// // const dispatch = useDispatch();
//  // const { trainingSchedules, subjects, loading, error, departments } =
// //    useSelector((state) => state.admin);

//   // State for form data and selected month
//  //const [formData, setFormData] = useState({
//     subjectId: "",
//     startDate: "",
//     duration: "",
//     departmentId: "",
//   });
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month (1-12)
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

//   // Log the state for debugging
//   useEffect(() => {
//     console.log("Training Schedules:", trainingSchedules);
//     console.log("Subjects:", subjects);
//     console.log("Departments:", departments);
//     console.log("Loading:", loading);
//     console.log("Error:", error);
//   }, [trainingSchedules, subjects, departments, loading, error]);

//   // Fetch data on component mount
//   useEffect(() => {
//     dispatch(fetchTrainingSchedules());
//     dispatch(fetchSubjects());
//     dispatch(fetchDepartments());
//   }, [dispatch]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleMonthChange = (e) => {
//     setSelectedMonth(parseInt(e.target.value, 10));
//   };

//   const handleYearChange = (e) => {
//     setSelectedYear(parseInt(e.target.value, 10));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post("/admin/training-schedules", formData);
//       console.log("Response from POST:", response.data);
//       dispatch(fetchTrainingSchedules());
//       setFormData({
//         subjectId: "",
//         startDate: "",
//         duration: "",
//         departmentId: "",
//       });
//     } catch (error) {
//       console.error(
//         "Error adding training schedule:",
//         error.response?.data || error.message
//       );
//     }
//   };

//   // Group schedules by subject and aggregate into a single task per subject
//   const groupedSchedules = trainingSchedules.reduce((acc, schedule) => {
//     const subjectName = schedule.subjectId?.name || "Unknown Subject";
//     const deptName = schedule.departmentId?.name || "Unknown Dept";
//     const filteredDates = schedule.classDates.filter((classDate) => {
//       const date = new Date(classDate);
//       return (
//         date.getMonth() + 1 === selectedMonth &&
//         date.getFullYear() === selectedYear
//       );
//     });

//     if (filteredDates.length > 0) {
//       const startDate = new Date(filteredDates[0]);
//       const endDate = new Date(filteredDates[filteredDates.length - 1]);
//       endDate.setDate(endDate.getDate() + 1); // Include the last day

//       if (!acc[subjectName]) {
//         acc[subjectName] = {
//           startDate,
//           endDate,
//           departments: new Set(),
//           totalClasses: 0,
//         };
//       }

//       // Update the earliest start date and latest end date
//       if (startDate < acc[subjectName].startDate) {
//         acc[subjectName].startDate = startDate;
//       }
//       if (endDate > acc[subjectName].endDate) {
//         acc[subjectName].endDate = endDate;
//       }

//       // Add department and increment total classes
//       acc[subjectName].departments.add(deptName);
//       acc[subjectName].totalClasses += filteredDates.length;
//     }
//     return acc;
//   }, {});

//   // Prepare data for the Gantt chart (one bar per subject, matching reference structure)
//   const chartData = [
//     [
//       { type: "string", label: "Task ID" },
//       { type: "string", label: "Task Name" },
//       { type: "date", label: "Start Date" },
//       { type: "date", label: "End Date" },
//       { type: "number", label: "Duration" },
//       { type: "number", label: "Percent Complete" },
//       { type: "string", label: "Dependencies" },
//     ],
//     ...Object.entries(groupedSchedules).map(([subjectName, data], index) => {
//       const departmentsArray = Array.from(data.departments);
//       const durationInDays = Math.ceil(
//         (data.endDate - data.startDate) / (24 * 60 * 60 * 1000)
//       ); // Calculate duration in days
//       return [
//         `${subjectName}-${index}`, // Unique ID per subject
//         `${subjectName} (${departmentsArray.join(", ")})`,
//         data.startDate,
//         data.endDate,
//         daysToMilliseconds(durationInDays), // Convert duration to milliseconds
//         100,
//         null,
//       ];
//     }),
//   ];

//   // Log chartData for debugging
//   useEffect(() => {
//     console.log("Chart Data:", chartData);
//   }, [chartData, selectedMonth, selectedYear]);

//   // Prepare monthly data summary (one row per subject)
//   const monthlyData = Object.entries(groupedSchedules).map(
//     ([subjectName, data]) => ({
//       task: subjectName,
//       departments: Array.from(data.departments).join(", "),
//       startDate: data.startDate.toLocaleDateString(),
//       totalClasses: data.totalClasses,
//     })
//   );

//   const options = {
//     height: Math.max(100, (chartData.length - 1) * 40 + 50),
//     gantt: {
//       trackHeight: 30,
//       defaultStyle: {
//         fill: "#4CAF50", // Single color for all bars (green, as an example)
//         stroke: "#388E3C", // Slightly darker border for contrast
//         label: { color: "#333333" },
//       },
//       barCornerRadius: 3,
//       labelStyle: {
//         fontName: "Arial",
//         fontSize: 12,
//         color: "#333333",
//       },
//       criticalPathEnabled: false,
//       innerGridTrack: { fill: "#F5F5F5" },
//       innerGridDarkTrack: { fill: "#E0E0E0" },
//       arrow: {
//         color: "#666666",
//         width: 2,
//       },
//       sortTasks: true, // Sort tasks to group by subject
//     },
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         Training Schedule
//       </h1>

//       {/* Month and Year Selector */}
//       <div className="mb-6 flex space-x-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Month
//           </label>
//           <select
//             value={selectedMonth}
//             onChange={handleMonthChange}
//             className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             {Array.from({ length: 12 }, (_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {new Date(0, i).toLocaleString("default", { month: "long" })}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Year
//           </label>
//           <select
//             value={selectedYear}
//             onChange={handleYearChange}
//             className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             {Array.from({ length: 5 }, (_, i) => {
//               const year = new Date().getFullYear() + i - 2;
//               return (
//                 <option key={year} value={year}>
//                   {year}
//                 </option>
//               );
//             })}
//           </select>
//         </div>
//       </div>

//       {/* Form to Add New Training Schedule */}
//       {/* <div className="mb-6">
//         <h2 className="text-xl font-semibold mb-2 text-gray-700">
//           Add New Training Schedule
//         </h2>
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-4 bg-white p-4 rounded shadow"
//         >
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Subject
//             </label>
//             <select
//               name="subjectId"
//               value={formData.subjectId}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             >
//               <option value="">Select a subject</option>
//               {subjects.map((subject) => (
//                 <option key={subject._id} value={subject._id}>
//                   {subject.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Department
//             </label>
//             <select
//               name="departmentId"
//               value={formData.departmentId}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             >
//               <option value="">Select a department</option>
//               {departments.map((department) => (
//                 <option key={department._id} value={department._id}>
//                   {department.name || department._id}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Start Date
//             </label>
//             <input
//               type="date"
//               name="startDate"
//               value={formData.startDate}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Duration (days)
//             </label>
//             <input
//               type="number"
//               name="duration"
//               value={formData.duration}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             Add Schedule
//           </button>
//         </form>
//       </div> */}

//       {/* Gantt Chart */}
//       <div className="overflow-x-auto mb-6 bg-white p-4 rounded shadow">
//         <h2 className="text-xl font-semibold mb-2 text-gray-700">{`${new Date(
//           selectedYear,
//           selectedMonth - 1
//         ).toLocaleString("default", { month: "long" })} ${selectedYear}`}</h2>
//         {loading && <p className="text-gray-600">Loading...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         {trainingSchedules.length > 0 ? (
//           <Chart
//             chartType="Gantt"
//             width="100%"
//             height="100%"
//             data={chartData}
//             options={options}
//           />
//         ) : (
//           !loading && (
//             <p className="text-gray-600">No training schedules available.</p>
//           )
//         )}
//       </div>

//       {/* Monthly Data Summary */}
//       <div className="mt-6 bg-white p-4 rounded shadow">
//         <h2 className="text-xl font-semibold mb-2 text-gray-700">
//           Monthly Data Summary
//         </h2>
//         {monthlyData.length > 0 ? (
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border p-2">Task</th>
//                 <th className="border p-2">Departments</th>
//                 <th className="border p-2">Start Date</th>
//                 <th className="border p-2">Total Classes</th>
//               </tr>
//             </thead>
//             <tbody>
//               {monthlyData.map((data, index) => (
//                 <tr
//                   key={index}
//                   className={index % 2 === 0 ? "bg-gray-100" : ""}
//                 >
//                   <td className="border p-2">{data.task}</td>
//                   <td className="border p-2">{data.departments}</td>
//                   <td className="border p-2">{data.startDate}</td>
//                   <td className="border p-2">{data.totalClasses}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-600">No data for the selected month.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TrainingSchedule;
