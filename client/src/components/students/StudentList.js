import React from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { useNavigate } from 'react-router-dom';
import { customStyles } from "../util/Constants";

const StudentList = () => {
    const navigate = useNavigate();
    const { students, loading, error } = useSelector(
        (state) => state.admin
    );

    const columns = [
        {name:"Id", selector: row => row.studentId, sortable: true },
        {name:"Name", selector: row => row.name, sortable: true },
        {name:"Email", selector: row => row.email, sortable: true },
        {name:"College", selector: row => row.college, sortable: true },
        {name:"Branch", selector: row => row.branch, sortable: true },
        {name:"CGPA", selector: row => row.cgpa, sortable: true }
    ];

    const handleRowClick = (row) => {
        navigate(`/student/${row._id}`);
    }

    return (<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Student List
        </h2>
        {loading && (
            <p className="text-blue-500 dark:text-blue-400 mb-4">Loading...</p>
        )}
        {error && (
            <p className="text-red-500 dark:text-red-400 mb-4">Error: {error}</p>
        )}
      <DataTable
        columns={columns}
        data={students}
        customStyles={customStyles}
        pagination
        fixedHeader
        striped
        onRowClicked={handleRowClick}
        highlightOnHover
      />
    </div>)

}

export default StudentList;