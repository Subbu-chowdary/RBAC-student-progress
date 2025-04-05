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
