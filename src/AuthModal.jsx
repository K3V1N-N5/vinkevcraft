import React, { useState } from 'react';
import { Modal, Button, TextInput } from 'flowbite-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

function AuthModal({ isModalOpen, toggleModal }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      await createUserWithEmailAndPassword(auth, email, password);
      toggleModal();
    } catch (error) {
      setAuthError('Registrasi gagal: ' + error.message);
    }
    setAuthLoading(false);
  };

  return (
    <Modal
      show={isModalOpen}
      onClose={toggleModal}
      size="lg"
      className="flex justify-center items-center h-screen"
    >
      <Modal.Header>
        {isLogin ? "Login" : "Register"}
      </Modal.Header>
      <Modal.Body className="p-8">
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="space-y-4"
        >
          {authError && (
            <p className="text-red-500 text-center">{authError}</p>
          )}
          <TextInput
            type="email"
            placeholder="Email"
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
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-500"
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-500"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AuthModal;
