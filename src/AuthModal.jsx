import React, { useState } from 'react';
import { Modal, Button, TextInput } from 'flowbite-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db, checkAdmin } from './firebase';  // Import checkAdmin
import { doc, setDoc, getDoc } from 'firebase/firestore';

function AuthModal({ isModalOpen, toggleModal, setIsAdmin }) {  // Tambahkan setIsAdmin di props
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    let loginEmail = email;

    const usernameDoc = await getDoc(doc(db, "usernames", email));
    if (usernameDoc.exists()) {
      loginEmail = usernameDoc.data().email;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
      const user = userCredential.user;

      // Cek apakah user adalah admin
      const isAdmin = await checkAdmin(user.uid);
      setIsAdmin(isAdmin);  // Simpan status admin di state aplikasi

      toggleModal();
    } catch (error) {
      setAuthError('Login gagal: ' + error.message);
    }
    setAuthLoading(false);
  };

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

      await updateProfile(user, { displayName: username });
      await setDoc(doc(db, "usernames", username), { email });

      // Jika user baru login, cek apakah dia admin
      const isAdmin = await checkAdmin(user.uid);
      setIsAdmin(isAdmin);

      toggleModal();
    } catch (error) {
      setAuthError('Registrasi gagal: ' + error.message);
    }
    setAuthLoading(false);
  };

  return (
    <Modal show={isModalOpen} onClose={toggleModal} size="lg" className="flex justify-center items-center h-screen">
      <Modal.Header>{isLogin ? "Login" : "Register"}</Modal.Header>
      <Modal.Body className="p-8">
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {authError && <p className="text-red-500 text-center">{authError}</p>}
          {!isLogin && (
            <TextInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full"
            />
          )}
          <TextInput
            type="email"
            placeholder="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
          <TextInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
          {!isLogin && (
            <TextInput
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
            />
          )}

          <Button type="submit" color="blue" className="w-full" disabled={authLoading}>
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
