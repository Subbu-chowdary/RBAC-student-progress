import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchStudents = createAsyncThunk(
  "admin/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/students");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch students" }
      );
    }
  }
);

export const fetchTeachers = createAsyncThunk(
  "admin/fetchTeachers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/teachers");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch teachers" }
      );
    }
  }
);

export const fetchSubjects = createAsyncThunk(
  "admin/fetchSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/subjects");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch subjects" }
      );
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  "admin/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/departments");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch departments" }
      );
    }
  }
);

export const addStudent = createAsyncThunk(
  "admin/addStudent",
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/students", studentData);
      return response.data.student;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add student" }
      );
    }
  }
);

export const addTeacher = createAsyncThunk(
  "admin/addTeacher",
  async (teacherData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/teachers", teacherData);
      return response.data.teacher;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add teacher" }
      );
    }
  }
);

export const addDepartment = createAsyncThunk(
  "admin/addDepartment",
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/departments", departmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add department" }
      );
    }
  }
);

export const addSubject = createAsyncThunk(
  "admin/addSubject",
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/subjects", subjectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add subject" }
      );
    }
  }
);

export const assignTeacherToSubject = createAsyncThunk(
  "admin/assignTeacherToSubject",
  async ({ subjectId, teacherId }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/subjects/${subjectId}/assign-teacher`,
        { teacherId }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to assign teacher" }
      );
    }
  }
);

export const addMarks = createAsyncThunk(
  "admin/addMarks",
  async (marksData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/marks", marksData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add marks" }
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    students: [],
    teachers: [],
    subjects: [],
    departments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch students";
      })
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch teachers";
      })
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch subjects";
      })
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch departments";
      })
      .addCase(addStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students.push(action.payload);
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to add student";
      })
      .addCase(addTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers.push(action.payload);
      })
      .addCase(addTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to add teacher";
      })
      .addCase(addDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments.push(action.payload);
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to add department";
      })
      .addCase(addSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects.push(action.payload);
      })
      .addCase(addSubject.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to add subject";
      })
      .addCase(assignTeacherToSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTeacherToSubject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subjects.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) state.subjects[index] = action.payload;
      })
      .addCase(assignTeacherToSubject.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to assign teacher";
      })
      .addCase(addMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMarks.fulfilled, (state, action) => {
        state.loading = false;
        const { studentId, subjectId } = action.meta.arg;
        const studentIndex = state.students.findIndex(
          (s) => s._id === studentId
        );
        if (
          studentIndex !== -1 &&
          !state.students[studentIndex].enrolledSubjects?.includes(subjectId)
        ) {
          state.students[studentIndex].enrolledSubjects = [
            ...(state.students[studentIndex].enrolledSubjects || []),
            subjectId,
          ];
        }
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

export default adminSlice.reducer;
