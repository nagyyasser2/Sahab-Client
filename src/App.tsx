import "./App.css";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
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
    </Routes>
  );
}

export default App;
