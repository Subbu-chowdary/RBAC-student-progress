// college-portal/client/src/redux/slices/adminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch all users (admins, teachers, students)
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/users");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch users" }
      );
    }
  }
);

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
// Add fetchTrainingSchedules thunk
export const fetchTrainingSchedules = createAsyncThunk(
  "admin/fetchTrainingSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/training-schedules");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch training schedules",
        }
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
    users: [],
    departments: [],
    trainingSchedules: [], // Add trainingSchedules to the state
    loading: false,
    error: null,
  },
  reducers: {
    // Optional: Add a reducer to clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      });

    // Fetch Students
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch students";
      });

    // Fetch Teachers
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch teachers";
      });

    // Fetch Subjects
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch subjects";
      });

    // Fetch Departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch departments";
      });

    // Add Student
    builder
      .addCase(addStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.loading = false;
        // Avoid duplicates by checking if the student already exists
        const existingIndex = state.students.findIndex(
          (s) => s._id === action.payload._id
        );
        if (existingIndex !== -1) {
          state.students[existingIndex] = action.payload;
        } else {
          state.students.push(action.payload);
        }
        // Optionally update users array if needed
        const userExists = state.users.some(
          (u) => u._id === action.payload.userId?._id
        );
        if (!userExists && action.payload.userId) {
          state.users.push(action.payload.userId);
        }
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add student";
      });

    // Add Teacher
    builder
      .addCase(addTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeacher.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.teachers.findIndex(
          (t) => t._id === action.payload._id
        );
        if (existingIndex !== -1) {
          state.teachers[existingIndex] = action.payload;
        } else {
          state.teachers.push(action.payload);
        }
        // Optionally update users array
        const userExists = state.users.some(
          (u) => u._id === action.payload.userId?._id
        );
        if (!userExists && action.payload.userId) {
          state.users.push(action.payload.userId);
        }
      })
      .addCase(addTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add teacher";
      });

    // Add Department
    builder
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
        state.error = action.payload?.message || "Failed to add department";
      });

    // Add Subject
    builder
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
        state.error = action.payload?.message || "Failed to add subject";
      });

    // Assign Teacher to Subject
    builder
      .addCase(assignTeacherToSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTeacherToSubject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subjects.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
      })
      .addCase(assignTeacherToSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to assign teacher";
      });

    // Add Marks
    builder
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
        state.error = action.payload?.message || "Failed to add marks";
      });

    // Fetch Training Schedules
    builder
      .addCase(fetchTrainingSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.trainingSchedules = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchTrainingSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch training schedules";
      });
  },
});

// Export the clearError action for use in components
export const { clearError } = adminSlice.actions;

export default adminSlice.reducer;
