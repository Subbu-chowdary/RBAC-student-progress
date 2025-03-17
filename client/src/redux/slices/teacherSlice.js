import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api"; // Ensure this path is correct

export const fetchAssignedSubjects = createAsyncThunk(
  "teacher/fetchAssignedSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/teacher/subjects");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch subjects" }
      );
    }
  }
);

export const fetchStudentsForSubject = createAsyncThunk(
  "teacher/fetchStudentsForSubject",
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teacher/subjects/${subjectId}/students`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch students" }
      );
    }
  }
);

export const addMarks = createAsyncThunk(
  "teacher/addMarks",
  async (marksData, { rejectWithValue }) => {
    try {
      const response = await api.post("/teacher/marks", marksData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add marks" }
      );
    }
  }
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    subjects: [],
    studentsForSubject: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchAssignedSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch subjects";
      })
      .addCase(fetchStudentsForSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsForSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.studentsForSubject = action.payload;
      })
      .addCase(fetchStudentsForSubject.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch students";
      })
      .addCase(addMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMarks.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addMarks.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to add marks";
      });
  },
});

// Export the reducer as default
export default teacherSlice.reducer;
