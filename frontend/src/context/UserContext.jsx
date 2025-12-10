// src/context/UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axiosInstance from "../api/axiosInstance";

export const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Robust, circular-safe error stringifier
  const safeStringifyError = (err) => {
    if (!err) return "Unknown error";
    if (err instanceof Error) return err.message;
    if (err?.response?.data) {
      try {
        return JSON.stringify(err.response.data);
      } catch {
        return String(err.response.data);
      }
    }
    if (err?.message) return err.message;
    try {
      const seen = new WeakSet();
      return JSON.stringify(err, (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
        }
        return value;
      });
    } catch {
      return String(err);
    }
  };

  // Always log errors as strings
  const logError = (prefix, err) => {
    // Always pass a single string to console.error
    console.error(String(prefix) + " " + String(safeStringifyError(err)));
  };

  const fetchUserProfile = async (userId) => {
    try {
      const res = await axiosInstance.get(`/users/profile/${userId}`);
      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (err) {
      logError("Failed to fetch user profile:", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      axiosInstance
        .get(`/users/profile/${parsedUser._id}`)
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          setLoading(false);
        })
        .catch((err) => {
          logError("Failed to fetch user profile from localStorage:", err);
          setUser(parsedUser);
          setLoading(false);
        });
    } else {
      const unsub = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          await fetchUserProfile(currentUser.uid);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const res = await axiosInstance.post("/users/auth/google", {
        _id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photo: firebaseUser.photoURL,
        googleId: firebaseUser.providerData[0]?.uid || firebaseUser.uid,
      });

      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        // Redirect based on onboarded status
        if (!res.data.user.onboarded) {
          navigate("/setup/step1");
        } else {
          navigate("/dashboard");
        }
      } else {
        setUser(firebaseUser);
      }
    } catch (err) {
      alert("Google login failed. Check console for details.");
      logError("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      if (user?.providerData?.length) {
        await signOut(auth);
      }
      setUser(null);
      navigate("/");
    } catch (err) {
      logError("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, signInWithGoogle, signOut: signOutUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
