import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { Button, TextInput } from 'flowbite-react';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle antara login dan register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Untuk registrasi
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Arahkan ke halaman utama atau lakukan tindakan setelah login
    } catch (error) {
      setError('Login failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Arahkan ke halaman utama atau lakukan tindakan setelah registrasi
    } catch (error) {
      setError('Registration failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          {isLogin ? "Login to Your Account" : "Create a New Account"}
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          <TextInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="dark:bg-gray-700 dark:text-white text-gray-900"
          />
          <TextInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="dark:bg-gray-700 dark:text-white text-gray-900"
          />
          {!isLogin && (
            <TextInput
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="dark:bg-gray-700 dark:text-white text-gray-900"
            />
          )}
          <Button type="submit" color="blue" className="w-full" disabled={loading}>
            {loading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
          </Button>
        </form>
        <div className="text-center text-gray-600 dark:text-gray-300 mt-4">
          {isLogin ? (
            <p>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-blue-500">Register</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setIsLogin(true)} className="text-blue-500">Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
