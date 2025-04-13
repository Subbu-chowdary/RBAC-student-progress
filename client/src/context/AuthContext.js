// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../redux/slices/authSlice";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    const runAuthCheck = async () => {
      await dispatch(checkAuth());
      setAuthCheckComplete(true);
    };
    runAuthCheck();
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, authCheckComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
};
