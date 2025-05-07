import "./App.css";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthContainer } from "./features/auth/AuthContainer";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";

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
