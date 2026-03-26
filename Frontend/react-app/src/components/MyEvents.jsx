import React from "react";
import TeacherEvents from "../Dashboards/Teachers/Teacherevents";
import StudentEvents from "../Dashboards/Users/Studentevents";

/**
 * MyEvents — role-based router.
 *
 * Reads the user role from localStorage and renders:
 *   - TeacherEvents  →  for TEACHER / FACULTY
 *   - StudentEvents  →  for everyone else
 *
 * All business logic, state, and API calls live inside the
 * respective child components so each can evolve independently.
 */
const MyEvents = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "";
  const isTeacher = role === "TEACHER" || role === "FACULTY";

  return isTeacher ? <TeacherEvents /> : <StudentEvents />;
};

export default MyEvents;
