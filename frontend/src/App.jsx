import React from "react";
import Navbar from "./components/Navbar";
import AppRoutes from "./AppRoutes";
import { useUser } from "./context/UserContext";
import Loader from "./components/Loader";

function App() {
  const { user, loading } = useUser();

  // Keep this loader — it's safe and required
  if (loading) return <Loader />;

  return (
    <>
      {user && <Navbar />}
      <AppRoutes user={user} />
    </>
  );
}

export default App;
