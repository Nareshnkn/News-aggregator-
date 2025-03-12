import { Routes, Route } from "react-router-dom"; // ✅ No need to import Router here
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NavbarComponent from "./components/NavbarComponent";
import Preferences from "./pages/Preferences";
import Dashboard from "./pages/Dashboard.js";
import Search from "./pages/Search";
import PrivateRoute from "./components/PrivateRoute"; // ✅ Private Route for Protected Pages

function App() {
  return (
    <>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/search" element={<Search />} />

        {/* ✅ Protect Dashboard using PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
