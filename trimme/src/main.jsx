// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Scheduler from "./components/Scheduler.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu.jsx";
import Customers from "./components/Customers.jsx";
import Employees from "./components/Employees.jsx";
import Timetable from "./components/Timetable.jsx";
import Services from "./components/Services.jsx";
import Products from "./components/Products.jsx";
import VisitsHistory from "./components/VisitsHistory.jsx";


createRoot(document.getElementById("root")).render(
  <Router>
    <Menu />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/scheduler" element={<Scheduler />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/products" element={<Products />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/timetable" element={<Timetable />} />
      <Route path="/services" element={<Services />} />
      <Route path="/history" element={<VisitsHistory />} />
    </Routes>
  </Router>
);
