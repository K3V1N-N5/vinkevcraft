// Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { Button, TextInput } from 'flowbite-react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); // Panggil callback setelah login berhasil
    } catch (error) {
      setError("Login failed: " + error.message);
    }
  };

  return (
    <div className="container mx-auto max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
        <Button type="submit" color="blue" className="w-full">
          Login
        </Button>
      </form>
    </div>
  );
}

export default Login;
