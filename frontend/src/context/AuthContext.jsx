import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AuthContext = createContext();

const INACTIVITY_LIMIT = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("authUser")) || null
  );
  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  const inactivityTimer = useRef(null);

  const login = (userData, userToken) => {
    setAuthUser(userData);
    setToken(userToken);
    localStorage.setItem("authUser", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const logout = useCallback(() => {
    setAuthUser(null);
    setToken(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("token");
    clearTimeout(inactivityTimer.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (!authUser) return;
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.log("Auto logout due to inactivity");
      logout();
    }, INACTIVITY_LIMIT);
  }, [authUser, logout]);

  //  Listen to user activity events
  useEffect(() => {
    if (!authUser) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    // Start timer
    resetTimer();

    // Reset on any activity
    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(inactivityTimer.current);
    };
  }, [authUser, resetTimer]);


  return (
    <AuthContext.Provider value={{ authUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);