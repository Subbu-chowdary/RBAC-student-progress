import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../util/Constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentDetails = () => {
  const { id } = useParams();
  const { students, subjects } = useSelector(
    (state) => state.admin
  );
  const thisstudent = students.find((student) => student._id === id);
    const [selectedSubject, setSelectedSubject] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const filterMarks = (marks) => {
    let filteredMarks = marks;
    if (selectedSubject) {
      filteredMarks = filteredMarks.filter(
        (mark) => mark.subjectId?.name === selectedSubject.value
      );
    }
    if (startDate) {
      filteredMarks = filteredMarks.filter(
        (mark) => new Date(mark.testDate) >= startDate
      );
    }
    if (endDate) {
      filteredMarks = filteredMarks.filter(
        (mark) => new Date(mark.testDate) <= endDate
      );
    }
    return filteredMarks;
  };

  const getChartData = () => {
    if (!thisstudent) return { lineData: null, barData: null };

    const student = students.find((s) => s.studentId === thisstudent.studentId);
    if (!student || !student.marks) return { lineData: null, barData: null };

    const filteredMarks = filterMarks(student.marks);

    // For Line Chart: Marks over time for the selected subject
    if (selectedSubject) {
      const dates = filteredMarks.map((mark) => {
        const testDate = new Date(mark.testDate);
        return testDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      });
      const marks = filteredMarks.map((mark) => mark.marks);
      const percentages = filteredMarks.map((mark) =>
        ((mark.marks / mark.totalMarks) * 100).toFixed(0)
      );

      const lineData = {
        labels: dates,
        datasets: [
          {
            label: "Marks",
            data: marks,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
          },
          {
            label: "Percentage",
            data: percentages,
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            fill: true,
          },
        ],
      };

      return { lineData, barData: null };
    }

    // For Bar Chart: Average marks across subjects (if no subject is selected)
    const subjects = [
      ...new Set(filteredMarks.map((mark) => mark.subjectId?.name || "N/A")),
    ];
    const averageMarks = subjects.map((subject) => {
      const subjectMarks = filteredMarks.filter(
        (mark) => mark.subjectId?.name === subject
      );
      const totalMarks = subjectMarks.reduce(
        (sum, mark) => sum + mark.marks,
        0
      );
      return subjectMarks.length > 0 ? totalMarks / subjectMarks.length : 0;
    });

    const barData = {
      labels: subjects,
      datasets: [
        {
          label: "Average Marks",
          data: averageMarks,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };

    return { lineData: null, barData };
  };

  const getTableData = () => {
    if (!thisstudent) return [];
    const student = students.find((s) => s.studentId === thisstudent.value);
    if (!student || !student.marks) return [];

    const filteredMarks = filterMarks(student.marks);

    return filteredMarks.map((mark) => {
      const testDate = new Date(mark.testDate);
      const dateString = testDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const percentage =
        ((mark.marks / mark.totalMarks) * 100).toFixed(0) + "%";
      return {
        date: dateString,
        subject: mark.subjectId?.name || "N/A",
        marks: mark.marks,
        totalMarks: mark.totalMarks,
        percentage,
      };
    });
  };

  const getStudentSubjects = (student) => {
    if (!student.department?._id) return [];
    return subjects.filter(
        (subject) => subject.departmentId?._id === student.department?._id
    );
};

const columns = [ {name:"Date", selector: row => row.date, sortable: true },
  {name:"Subject", selector: row => row.subject, sortable: true },
  {name:"Marks", selector: row => row.marks, sortable: true },
  {name:"Total Marks", selector: row => row.totalMarks, sortable: true },
  {name:"Percentage", selector: row => row.percentage, sortable: true },
]
;

  const { lineData, barData } = getChartData();
  const tableData = getTableData();

  return (
    <div style={{ paddingTop: "60px" }}>
      <h1><strong>Student Details</strong></h1>
      <hr />
      <br />
      <div>
        {thisstudent ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <p><strong>Name:</strong> {thisstudent.name}</p>
              <p><strong>Student ID:</strong> {thisstudent.studentId}</p>
              <p><strong>Email:</strong> {thisstudent.email}</p>
              <p><strong>CGPA:</strong> {thisstudent.cgpa}</p>
              <p><strong>Degree:</strong> {thisstudent.degree}</p>
              <p><strong>Branch:</strong> {thisstudent.branch}</p>
              <p><strong>College:</strong> {thisstudent.college}</p>
            </div>
            <br />
            <hr />
            <br />
            <div>
              <h2><strong>Department</strong> {thisstudent.department? thisstudent.department.name: 'No Department assigned'}</h2>
              <hr />
              <br/>
              <h2><strong>Subjects</strong></h2>
              <hr />
              <div>
                {getStudentSubjects(thisstudent).length > 0 ? (<ul>
                  {getStudentSubjects(thisstudent).map(subject => <li>{subject.name}</li>) }               
                </ul>  ): 'No Subjects assigned'}
              </div>
                          
              <br/>

            </div>
            <div className="space-y-8">
              {lineData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Marks Over Time ({selectedSubject?.label})
                  </h3>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <Line
                      data={lineData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "top" },
                          title: { display: true, text: "Marks Trend" },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: { display: true, text: "Value" },
                          },
                          x: {
                            title: { display: true, text: "Test Date" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {barData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Average Marks Across Subjects
                  </h3>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <Bar
                      data={barData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "top" },
                          title: {
                            display: true,
                            text: "Average Marks by Subject",
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: { display: true, text: "Average Marks" },
                          },
                          x: {
                            title: { display: true, text: "Subject" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detailed Marks
                </h3>
                
                <div className="overflow-x-auto">
                  <DataTable
                    columns={columns}
                    data={tableData}
                    customStyles={customStyles}
                    pagination
                    fixedHeader
                    striped
                    highlightOnHover
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>Student not found.</p>
        )}
      </div>
    </div>
  );
}

export default StudentDetails;
