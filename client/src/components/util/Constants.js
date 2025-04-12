

export const customStyles = {
    title: {
      style: {
        fontWeight: "bold",
      },
    },
    headCells: {
      style: {
        fontSize: "15px",
        fontWeight: "bold",
        backgroundColor: "#3982d7",
        color: "white",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        fontWeight: "500",
      },
    },
    rows: {
      style: {
        "&:hover": {
          backgroundColor: "#f5f5f5",
          cursor: "pointer",
        },
      },
    },
  };


  export const getCustomStyles = (isDarkMode) => ({
    title: {
      style: {
        fontWeight: "bold",
      },
    },
    headCells: {
      style: {
        fontSize: "15px",
        fontWeight: "bold",
        backgroundColor: "#3982d7",
        color: "white",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        fontWeight: "500",
      },
    },
    rows: {
      style: {
        "&:hover": {
          backgroundColor: "#f5f5f5",
          cursor: "pointer",
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: isDarkMode ? "#000000" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#000000",
      },
      pageButtonsStyle: {
        color: isDarkMode ? "#ffffff" : "#000000",
        fill: isDarkMode ? "#ffffff" : "#000000",
        "&:hover": {
          backgroundColor: isDarkMode ? "#1f2937" : "#e5e7eb",
        },
      },
    },
  });
  