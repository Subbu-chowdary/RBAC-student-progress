const XLSX = require("xlsx");
const { generateStudentId } = require("../utils/generateStudentId");
const Student = require("../models/Student");
const fs = require("fs");

const uploadExcelData = async (req, res) => {
    try {

        if (!req.file) {
            console.log("No file received");
            return res.status(400).json({ message: "No file uploaded" });
          }
        const workbook = XLSX.readFile(req.file.path);
        console.log("Sheet names:", workbook.SheetNames);
        const sheetName = workbook.SheetNames.includes("StudentMarks")
        ? "StudentMarks"
        : workbook.SheetNames[0];
        if (!sheetName) {
            console.log("No sheets found in the Excel file");
            return res
            .status(400)
            .json({ message: "No sheets found in the Excel file" });
        }
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
              header: 1, // Use the first row as headers
              defval: null,
              raw: false, // Convert dates to strings
        });
        if (sheet.length === 0) {
            console.log(`No data found in sheet: ${sheetName}`);
            return res
              .status(400)
              .json({ message: `No valid data found in sheet: ${sheetName}` });
        }
        const headers = sheet[0];
        console.log("Headers:", headers);
    
        // Convert remaining rows to objects using the headers
        const data = sheet.slice(1).map((row) => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        });
    
        console.log("Parsed data from Excel sheet:", data);
    
        if (data.length === 0) {
          console.log(`No data rows found in sheet: ${sheetName}`);
          return res
            .status(400)
            .json({ message: `No data rows found in sheet: ${sheetName}` });
        }

        let processedRows = 0;
        let failedRows = 0;
        for (const row of data) {
            const { email, reg_no, name, college, degree, branch, cgpa, resume_file } = row;
            if (!email || !reg_no || !name || !college || !degree || !branch || !cgpa) {
                failedRows++;
                console.log("Missing required fields in row:", row);
                continue;
            }
            const studentId = await generateStudentId(); 
            let student = await Student.findOne({ studentId });
            if (!student) {
                student = new Student({
                    studentId,
                    name,
                    email,
                    reg_no,
                    college,
                    degree,
                    branch,
                    cgpa,
                    resume_file
                });
                await student.save();
                console.log(
                    "Created student:",
                    student.studentId,
                    "ID:",
                    student._id
                );
                processedRows++;
            }
        }

            

    } catch (error) {
        console.error("Error processing Excel file:", error);
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log("Deleted uploaded file on error:", req.file.path);
        }
        res
          .status(500)
          .json({ message: "Error processing Excel file", error: error.message });
    }
}

module.exports = {
    uploadExcelData,
};