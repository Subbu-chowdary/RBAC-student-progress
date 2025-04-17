import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrainingSchedules,
  fetchSubjects,
  fetchDepartments,
} from "../../redux/slices/adminSlice";
import Timeline, {
  TimelineMarkers,
  TodayMarker,
} from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import { Chart } from "react-google-charts";
import Spinner from "../../components/Spinner";

// Color palette for subjects using themecolor shades
const subjectColors = [
  "#8EB8FF", // Blue - themecolor-400
  "#74FFBF", // Mint Green
  "#FFD36E", // Soft Yellow/Orange
  "#FF8E9E", // Coral Pink
  "#B28DFF", // Light Purple
  "#5AD4FF", // Sky Blue
  "#FFA45B", // Warm Orange
  "#A3FFD6", // Aqua
  "#D07DFF", // Lavender
  "#8BFF92", // Soft Green
];

// Utility to darken colors for borders
const darkenColor = (hex, amount) => {
  let color = hex.replace("#", "");
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = Math.max(0, parseInt(color.slice(0, 2), 16) * (1 - amount));
  const g = Math.max(0, parseInt(color.slice(2, 4), 16) * (1 - amount));
  const b = Math.max(0, parseInt(color.slice(4, 6), 16) * (1 - amount));
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g)
    .toString(16)
    .padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
};

const daysToMilliseconds = (days) => days * 24 * 60 * 60 * 1000;

const TrainingSchedule = () => {
  const dispatch = useDispatch();
  const { trainingSchedules, subjects, departments, loading, error } =
    useSelector((state) => state.admin);

  const today = moment().startOf("day");
  const [visibleTimeStart, setVisibleTimeStart] = useState(
    today.clone().startOf("week").valueOf()
  );
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(
    today.clone().endOf("week").add(1, "day").valueOf()
  );
  const [zoomLevel, setZoomLevel] = useState(7);
  const timelineRef = useRef(null);

  const minZoomDays = 7;
  const maxZoomDays = 120;
  const zoomStep = 7;
  const moveStepDays = 7;
  const buffer = 2;

  useEffect(() => {
    dispatch(fetchTrainingSchedules());
    dispatch(fetchSubjects());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (trainingSchedules.length > 0) {
      const allDates = trainingSchedules.flatMap((s) => s.classDates || []);
      if (allDates.length > 0) {
        const minDate = moment.min(allDates.map((d) => moment(d)));
        const maxDate = moment.max(allDates.map((d) => moment(d)));
        // Optional: Adjust visible range to data bounds
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
    const subject = subjects.find(
      (s) => s._id === (schedule.subjectId._id || schedule.subjectId)
    );
    const subjectIndex = subject ? subjects.indexOf(subject) : 0;
    const subjectColor =
      subjectColors[subjectIndex % subjectColors.length] || "#8EB8FF";
    const classDates = schedule.classDates || [];

    return classDates.map((classDate, index) => {
      const start = moment(classDate).startOf("day").valueOf();
      const end = moment(classDate).endOf("day").valueOf();
      return {
        id: `${schedule._id}-${index}`,
        group: schedule.subjectId._id || schedule.subjectId,
        title: ``,
        start_time: start,
        end_time: end,
        canMove: false,
        canResize: false,
        itemProps: {
          style: {
            background: subjectColor,
            borderColor: darkenColor(subjectColor, 0.1),
          },
        },
      };
    });
  });

  const itemRenderer = ({ item, itemContext, getItemProps }) => {
    const backgroundColor = item.itemProps.style.background;
    const borderColor = item.itemProps.style.borderColor;
    return (
      <div
        {...getItemProps({
          style: {
            background: backgroundColor,
            color: "white",
            border: `1px solid ${borderColor}`,
            borderRadius: "4px",
            fontSize: "12px",
            padding: "4px 8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            boxSizing: "border-box",
            fontFamily: "Poppins, sans-serif",
          },
        })}
      >
        {itemContext.title}
      </div>
    );
  };

  const handleZoomIn = () => {
    const newZoomLevel = Math.max(minZoomDays, zoomLevel - zoomStep);
    setZoomLevel(newZoomLevel);
    setVisibleTimeEnd(
      moment(visibleTimeStart).add(newZoomLevel, "days").valueOf()
    );
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.min(maxZoomDays, zoomLevel + zoomStep);
    setZoomLevel(newZoomLevel);
    setVisibleTimeEnd(
      moment(visibleTimeStart).add(newZoomLevel, "days").valueOf()
    );
  };

  const handleMoveLeft = () => {
    const newStart = moment(visibleTimeStart)
      .subtract(moveStepDays, "days")
      .valueOf();
    const newEnd = moment(visibleTimeEnd)
      .subtract(moveStepDays, "days")
      .valueOf();
    setVisibleTimeStart(newStart);
    setVisibleTimeEnd(newEnd);
  };

  const handleMoveRight = () => {
    const newStart = moment(visibleTimeStart)
      .add(moveStepDays, "days")
      .valueOf();
    const newEnd = moment(visibleTimeEnd).add(moveStepDays, "days").valueOf();
    setVisibleTimeStart(newStart);
    setVisibleTimeEnd(newEnd);
  };

  const handleTimeChange = (
    newVisibleTimeStart,
    newVisibleTimeEnd,
    updateScrollCanvas
  ) => {
    const duration = newVisibleTimeEnd - newVisibleTimeStart;
    if (
      duration >= daysToMilliseconds(minZoomDays) &&
      duration <= daysToMilliseconds(maxZoomDays)
    ) {
      setVisibleTimeStart(newVisibleTimeStart);
      setVisibleTimeEnd(newVisibleTimeEnd);
      setZoomLevel(Math.round(duration / daysToMilliseconds(1)));
    } else {
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    }
  };

  const timeSteps = {
    second: 0,
    minute: 0,
    hour: 0,
    day: 1,
    month: 1,
    year: 1,
  };

  // Gantt Chart Data Preparation
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
      endDate.setDate(endDate.getDate() + 1);

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
      const durationInClasses = data.totalClasses;
      const percentComplete =
        data.totalClasses > 0
          ? ((data.completedClasses / data.totalClasses) * 100).toFixed(2)
          : 0;
      return [
        `${subjectName}-${index}`,
        `${subjectName} (${departmentsArray.join(", ")})`,
        data.startDate,
        data.endDate,
        daysToMilliseconds(durationInClasses),
        Number(percentComplete),
        null,
      ];
    }),
  ];

  const ganttOptions = {
    height: Math.max(100, (ganttData.length - 1) * 40 + 50),
    gantt: {
      trackHeight: 30,
      barCornerRadius: 3,
      labelStyle: {
        fontName: "Roboto",
        fontSize: 12,
        color: "#000000", // themecolor-120
      },
      criticalPathEnabled: false,
      innerGridTrack: { fill: "#DBE9FA" }, // themecolor-100
      innerGridDarkTrack: { fill: "#C2D6FF" }, // themecolor-200
      arrow: {
        color: "#8EB8FF", // themecolor-400
        width: 2,
      },
      sortTasks: true,
      percentCompleteStyle: {
        fill: "#4A8CFF", // themecolor-600
      },
    },
  };

  return (
    <div className="min-h-screen bg-themecolor-50 p-14">
      <div>
        <h1 className="text-3xl font-bold text-themecolor-900 mb-14 border-b pb-2 font-display">
          Training Schedule
        </h1>

        <div className="flex justify-end mb-14 space-x-4">
          <button
            onClick={handleMoveLeft}
            className="px-4 py-2 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 transition duration-200 font-sans"
          >
            ← Move Left
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel <= minZoomDays}
            className="px-4 py-2 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 disabled:bg-themecolor-300 disabled:cursor-not-allowed transition duration-200 font-sans"
          >
            Zoom In
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel >= maxZoomDays}
            className="px-4 py-2 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 disabled:bg-themecolor-300 disabled:cursor-not-allowed transition duration-200 font-sans"
          >
            Zoom Out
          </button>
          <button
            onClick={handleMoveRight}
            className="px-4 py-2 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 transition duration-200 font-sans"
          >
            Move Right →
          </button>
        </div>

        <div className="bg-themecolor-50 rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-themecolor-900 mb-4 font-display">
              Schedule: {moment(visibleTimeStart).format("MMMM D, YYYY")} -{" "}
              {moment(visibleTimeEnd).format("MMMM D, YYYY")}
            </h2>

            {loading && <Spinner />}
            {error && (
              <p className="text-red-500 text-center py-4 font-medium font-sans">
                {error}
              </p>
            )}

            {groups.length > 0 && items.length > 0 ? (
              <Timeline
                ref={timelineRef}
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
                  <div className="p-4 bg-themecolor-100 text-themecolor-120 font-semibold font-sans">
                    Subjects
                  </div>
                }
                stackItems={false}
                timeSteps={timeSteps}
                dragSnap={daysToMilliseconds(1)}
                traditionalZoom={false}
                canMove={false}
                canResize={false}
                itemRenderer={itemRenderer}
                buffer={buffer}
                onTimeChange={handleTimeChange}
                className="rounded-2xl border border-themecolor-400"
              >
                <TimelineMarkers>
                  <TodayMarker />
                </TimelineMarkers>
              </Timeline>
            ) : (
              !loading && (
                <p className="text-themecolor-120 text-center py-4 font-sans">
                  No training schedules available.
                </p>
              )
            )}
          </div>
        </div>

        <div className="mt-14 bg-themecolor-50 rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-themecolor-900 mb-4 font-display">
              Gantt Chart Overview (Completion Progress by Classes)
            </h2>
            {loading && <Spinner />}
            {error && (
              <p className="text-red-500 text-center py-4 font-medium font-sans">
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
                <p className="text-themecolor-120 text-center py-4 font-sans">
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
