// src/context/UserContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import axiosInstance from '../api/axiosInstance';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // Firebase user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data from email/password login
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      // Check Firebase auth state
      const unsub = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  // Google sign-in logic
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      // Send user data to backend to create/find user
      await axiosInstance.post('/users/auth/google', {
        _id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photo: firebaseUser.photoURL,
        googleId: firebaseUser.providerData[0]?.uid || firebaseUser.uid,
      });
      setUser(firebaseUser);
    } catch (err) {
      alert('Google login failed. Check console.');
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Logout logic
  const signOutUser = async () => {
    setLoading(true);
    try {
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Sign out from Firebase if user was logged in via Google
      if (user && user.providerData && user.providerData.length > 0) {
        await signOut(auth);
      }
      
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </UserContext.Provider>
  );
};
