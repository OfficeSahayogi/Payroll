import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Login } from "./components/Login";
import SelectOrg from "./Components/SelectOrg";
import Dashboard from "./Components/Dasboard";
import ProtectedRoute from "./utils/ProtectedRoute";
import Layout from "./pages/Layout"; // Adjust path if necessary
import EmployeeCreat from "./pages/EmployeeCreation";
import EmployeeList from "./pages/EmployeeList";
import DailyEmployeeChart from "./pages/DailyEmployeeChart";
import AttendanceMarking from "./pages/AttendanceMarking";
import ViewAttendance from "./pages/ViewAttendance";
import UpdatedSalary from "./pages/UpdatedSalary";
import NotFound from "./pages/PageNotF";
import AttendanceTable from "./pages/AttendanceTable";


const App = () => {

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/"
          element={
             <Login />
          }
        />

        {/* Organization Selection Route */}
        <Route
          path="/select-org"
          element={
            <ProtectedRoute>
              <SelectOrg />
            </ProtectedRoute>
          }
        />

        {/* Protected Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes */}
          <Route index element={<Dashboard />} />
          <Route path="createEmployee" element={<EmployeeCreat />} />
          <Route path="listEmployee" element={<EmployeeList />} />
          <Route path="dailyChart" element={<DailyEmployeeChart />} />
          <Route path="markAttendance" element={<AttendanceMarking />} />
          <Route path="viewAttendance" element={<ViewAttendance />} />
          <Route path="updateSalary" element={<UpdatedSalary />} />
          <Route path="AttendanceSheet" element={<AttendanceTable/>} />
        </Route>

        {/* Catch-All for Invalid Routes */}
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </Router>
  );
};

export default App;