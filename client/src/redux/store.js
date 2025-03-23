import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import teacherReducer from "./slices/teacherSlice";
import studentReducer from "./slices/studentSlice";
import alluserReducer from "./slices/alluserSlice"; // New slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    teacher: teacherReducer,
    student: studentReducer,
    user: alluserReducer,
  },
});
