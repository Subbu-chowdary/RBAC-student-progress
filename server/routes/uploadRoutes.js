const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();
const { uploadExcelData } = require("../controllers/uploadController");

router.post("/excel", upload.single("excelFile"), uploadExcelData);

module.exports = router;