import "./App.css";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { HomePage } from "./components/layout/HomePage";
import { AuthContainer } from "./features/auth/AuthContainer";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthContainer />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<p>have a nice day</p>} />
    </Routes>
  );
}

export default App;
