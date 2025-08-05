import Navbar from "./components/Navbar";
import AppRoutes from "./AppRoutes";
import { useUser } from "./context/UserContext";

function App() {
  const { user, loading } = useUser();

  if (loading) return <div className="text-white p-10 text-center">Loading...</div>;

  return (
    <>
      {user && <Navbar />}
      <AppRoutes user={user} />
    </>
  );
}

export default App;
