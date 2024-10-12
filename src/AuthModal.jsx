// AuthModal.js
import React, { useState } from 'react';
import { Modal, Button, TextInput } from 'flowbite-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, checkAdmin } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

function AuthModal({ isModalOpen, toggleModal, setIsAdmin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const isAdmin = await checkAdmin(user.uid);
      setIsAdmin(isAdmin);
      toggleModal();
    } catch (error) {
      setAuthError('Login gagal: ' + error.message);
    }
    setAuthLoading(false);
  };

  // Handle user registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (password !== confirmPassword) {
      setAuthError("Password tidak cocok!");
      return;
    }
    setAuthLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan username ke Firestore
      await setDoc(doc(db, "usernames", username), { email });

      // Cek jika user adalah admin
      const isAdmin = await checkAdmin(user.uid);
      setIsAdmin(isAdmin);

      toggleModal();
    } catch (error) {
      setAuthError('Registrasi gagal: ' + error.message);
    }
    setAuthLoading(false);
  };

  return (
    <Modal show={isModalOpen} onClose={toggleModal} size="lg">
      <Modal.Header>{isLogin ? "Login" : "Register"}</Modal.Header>
      <Modal.Body>
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {authError && <p className="text-red-500">{authError}</p>}
          {!isLogin && (
            <TextInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <TextInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <TextInput
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <Button type="submit" color="blue" disabled={authLoading}>
            {authLoading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
          </Button>
        </form>
        <div className="text-center mt-4">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setIsLogin(false)} className="text-blue-500">Register</button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => setIsLogin(true)} className="text-blue-500">Login</button>
            </p>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AuthModal;
