import React, { useState } from 'react';
import { Modal, Button, TextInput } from 'flowbite-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function AuthModal({ isModalOpen, toggleModal, setIsAdmin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Fungsi untuk handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      // Autentikasi menggunakan email dan password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Cek apakah user adalah admin di Firestore
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      const isAdmin = adminDoc.exists(); // Jika dokumen ada, berarti user adalah admin
      setIsAdmin(isAdmin); // Set status admin di state

      toggleModal(); // Tutup modal setelah berhasil login
    } catch (error) {
      setAuthError('Login gagal: ' + error.message); // Tampilkan pesan error jika login gagal
    }
    setAuthLoading(false); // Matikan loading state
  };

  // Fungsi untuk handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);

    // Cek apakah password dan konfirmasi password cocok
    if (password !== confirmPassword) {
      setAuthError("Password tidak cocok!");
      return;
    }
    setAuthLoading(true);

    try {
      // Buat user baru dengan email dan password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profil user dengan username
      await updateProfile(user, { displayName: username });

      // Simpan username ke Firestore
      await setDoc(doc(db, "usernames", username), { email });

      // Tidak perlu cek admin saat register
      setIsAdmin(false); // Set status admin ke false setelah register

      toggleModal(); // Tutup modal setelah berhasil register
    } catch (error) {
      setAuthError('Registrasi gagal: ' + error.message); // Tampilkan pesan error jika registrasi gagal
    }
    setAuthLoading(false); // Matikan loading state
  };

  return (
    <Modal show={isModalOpen} onClose={toggleModal} size="lg" className="flex justify-center items-center h-screen">
      <Modal.Header>{isLogin ? "Login" : "Register"}</Modal.Header>
      <Modal.Body className="p-8">
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
