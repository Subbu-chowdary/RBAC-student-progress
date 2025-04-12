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
import { Chart } from "react-google-charts";

function daysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

const TrainingSchedule = () => {
  const dispatch = useDispatch();
  const { trainingSchedules, subjects, departments, loading, error } =
    useSelector((state) => state.admin);

  // Use current date (dynamic)
  const today = moment(); // Replace with moment() for real-time date

  const [visibleTimeStart, setVisibleTimeStart] = useState(
    today.clone().startOf("week").startOf("day").valueOf() // Start of the week (Sunday)
  );
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(
    today.clone().endOf("week").add(1, "day").startOf("day").valueOf() // End of the week (Sunday) + 1 day to include Saturday
  );
  const [zoomLevel, setZoomLevel] = useState(7); // Initial zoom level for one week

  const minZoomDays = 7;
  const maxZoomDays = 120;
  const zoomStep = 7;
  const moveStepDays = 7;

  useEffect(() => {
    dispatch(fetchTrainingSchedules());
    dispatch(fetchSubjects());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Adjust timeline range based on fetched data (optional)
  useEffect(() => {
    if (trainingSchedules.length > 0) {
      const allDates = trainingSchedules.flatMap((s) => s.classDates || []);
      if (allDates.length > 0) {
        const minDate = moment.min(allDates.map((d) => moment(d)));
        const maxDate = moment.max(allDates.map((d) => moment(d)));
        // Uncomment to override the default week view with full data range
        // setVisibleTimeStart(minDate.startOf("day").valueOf());
        // setVisibleTimeEnd(maxDate.add(1, "day").startOf("day").valueOf());
      }
    }
  }, [trainingSchedules]);

  const groups = subjects.map((subject) => ({
    id: subject._id,
    title: subject.name || "Unknown Subject",
  }));

  const items = trainingSchedules.flatMap((schedule) => {
    const classDates = schedule.classDates || [];
    return classDates.map((classDate, index) => {
      const start = moment(classDate).startOf("day").valueOf();
      const end = moment(classDate).endOf("day").valueOf();
      return {
        id: `${schedule._id}-${index}`,
        group: schedule.subjectId._id || schedule.subjectId,
        title: `D-${index + 1}`, // Sequential day numbering
        start_time: start,
        end_time: end,
        canMove: false,
        canResize: false,
      };
    });
  });

  const handleZoomIn = () => {
    const newZoomLevel = Math.max(minZoomDays, zoomLevel - zoomStep);
    setZoomLevel(newZoomLevel);
    const newEnd = moment(visibleTimeStart)
      .add(newZoomLevel, "days")
      .startOf("day")
      .valueOf();
    setVisibleTimeEnd(newEnd);
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.min(maxZoomDays, zoomLevel + zoomStep);
    setZoomLevel(newZoomLevel);
    const newEnd = moment(visibleTimeStart)
      .add(newZoomLevel, "days")
      .startOf("day")
      .valueOf();
    setVisibleTimeEnd(newEnd);
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
  };

  const timeSteps = {
    second: 0,
    minute: 0,
    hour: 0,
    day: 1,
    month: 1,
    year: 1,
  };

  // Gantt Chart Data Preparation with Completion Tracking using number of classes
  const groupedSchedules = trainingSchedules.reduce((acc, schedule) => {
    const subjectName =
      subjects.find(
        (s) => s._id === (schedule.subjectId._id || schedule.subjectId)
      )?.name || "Unknown Subject";
    const deptName =
      departments.find(
        (d) => d._id === (schedule.departmentId._id || schedule.departmentId)
      )?.name || "Unknown Dept";
    const classDates = schedule.classDates || [];

    if (classDates.length > 0) {
      const startDate = new Date(classDates[0]);
      const endDate = new Date(classDates[classDates.length - 1]);
      endDate.setDate(endDate.getDate() + 1); // Include the last day

      if (!acc[subjectName]) {
        acc[subjectName] = {
          startDate,
          endDate,
          departments: new Set(),
          totalClasses: 0,
          completedClasses: 0,
        };
      }

      if (startDate < acc[subjectName].startDate) {
        acc[subjectName].startDate = startDate;
      }
      if (endDate > acc[subjectName].endDate) {
        acc[subjectName].endDate = endDate;
      }

      acc[subjectName].departments.add(deptName);
      acc[subjectName].totalClasses += classDates.length;
      acc[subjectName].completedClasses += classDates.filter((date) =>
        moment(date).isSameOrBefore(today, "day")
      ).length;
    }
    return acc;
  }, {});

  const ganttData = [
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
      const durationInClasses = data.totalClasses; // Use number of classes as duration
      const percentComplete =
        data.totalClasses > 0
          ? ((data.completedClasses / data.totalClasses) * 100).toFixed(2)
          : 0;
      return [
        `${subjectName}-${index}`,
        `${subjectName} (${departmentsArray.join(", ")})`,
        data.startDate,
        data.endDate,
        daysToMilliseconds(durationInClasses), // Convert number of classes to milliseconds
        Number(percentComplete), // Percent complete for the Gantt bar
        null,
      ];
    }),
  ];

  const ganttOptions = {
    height: Math.max(100, (ganttData.length - 1) * 40 + 50),
    gantt: {
      trackHeight: 30,
      defaultStyle: {
        fill: "#4CAF50",
        stroke: "#388E3C",
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
      sortTasks: true,
      percentCompleteStyle: {
        fill: "#1976D2", // Color for the completed portion
      },
    },
  };

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
                  minZoom={daysToMilliseconds(minZoomDays)}
                  maxZoom={daysToMilliseconds(maxZoomDays)}
                  lineHeight={60}
                  itemHeightRatio={0.9}
                  sidebarWidth={300}
                  sidebarContent={
                    <div className="p-4 bg-gray-100 text-gray-800 font-semibold dark:bg-gray-700 dark:text-gray-200">
                      Subjects
                    </div>
                  }
                  stackItems={false}
                  timeSteps={timeSteps}
                  dragSnap={daysToMilliseconds(1)}
                  traditionalZoom={false}
                  canMove={false}
                  canResize={false}
                  className="rounded-md border border-gray-200"
                  key={`${visibleTimeStart}-${visibleTimeEnd}`}
                />
                <style jsx global>{`
                  .rct-timeline {
                    border: 1px solid #e5e7eb !important;
                    user-select: none !important;
                    overflow-x: hidden !important;
                    pointer-events: none !important;
                    background-color: #ffffff !important;
                  }
                  .rct-scroller {
                    overflow-x: hidden !important;
                    pointer-events: none !important;
                  }
                  .rct-header {
                    background-color: #f9fafb !important;
                    border-bottom: 2px solid #e5e7eb !important;
                    font-weight: 600 !important;
                    color: #374151 !important;
                    padding: 8px !important;
                    min-height: 40px !important;
                  }
                  .rct-sidebar {
                    background-color: #f3f4f6 !important;
                    border-right: 2px solid #e5e7eb !important;
                    font-size: 14px !important;
                    padding: 8px !important;
                  }
                  .rct-item {
                    background-color: #4f46e5 !important;
                    color: white !important;
                    border: 1px solid #4338ca !important;
                    border-radius: 4px !important;
                    font-size: 12px !important;
                    padding: 4px 8px !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                    margin: 4px 0 !important;
                    pointer-events: none !important;
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
                  }
                  .rct-vertical-lines {
                    border-left: 1px solid #e5e7eb !important;
                  }
                  .rct-horizontal-lines {
                    border-top: 1px solid #e5e7eb !important;
                  }
                  .rct-canvas {
                    pointer-events: none !important;
                  }
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

        {/* Gantt Chart Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 dark:text-gray-300">
              Gantt Chart Overview (Completion Progress by Classes)
            </h2>
            {loading && (
              <p className="text-gray-500 text-center py-4 dark:text-gray-400">
                Loading Gantt chart...
              </p>
            )}
            {error && (
              <p className="text-red-600 text-center py-4 font-medium dark:text-red-400">
                {error}
              </p>
            )}
            {ganttData.length > 1 ? (
              <div className="overflow-x-auto">
                <Chart
                  chartType="Gantt"
                  width="100%"
                  height="100%"
                  data={ganttData}
                  options={ganttOptions}
                />
              </div>
            ) : (
              !loading && (
                <p className="text-gray-500 text-center py-4 dark:text-gray-400">
                  No data available for Gantt chart.
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
//creared a brannch 1 and testing
