import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { Button, TextInput } from 'flowbite-react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Set loading saat login dimulai
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); // Callback setelah login berhasil
    } catch (error) {
      setError('Login failed: ' + error.message);
    }
    setLoading(false); // Stop loading setelah login selesai
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Login to Your Account</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
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
          <Button type="submit" color="blue" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="text-center text-gray-600 dark:text-gray-300 mt-4">
          <p>Don't have an account? Contact admin to register.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
