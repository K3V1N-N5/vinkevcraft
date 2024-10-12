import React, { useState } from 'react';
import { Modal, Button, TextInput, Label } from 'flowbite-react';
import { auth, db, checkAdmin } from './firebase'; // Firebase imports
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function AuthModal({ showModal, onClose, setIsAdmin }) {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Only used in registration
  const [error, setError] = useState('');

  // Toggle between Login and Register form
  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    setError(''); // Clear error on form switch
  };

  // Handle Registration
  const handleRegister = async () => {
    if (!email || !password || !username) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save the user to Firestore with additional username and admin status
      await setDoc(doc(db, "users", user.uid), {
        username,
        email: user.email,
        isAdmin: false, // Default to non-admin
      });

      // Check admin status after registration
      const adminStatus = await checkAdmin(user.uid);
      setIsAdmin(adminStatus); // Set admin status in parent state

      onClose(); // Close modal on successful registration
    } catch (error) {
      setError(error.message); // Display error from Firebase
    }
  };

  // Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check admin status after login
      const adminStatus = await checkAdmin(user.uid);
      setIsAdmin(adminStatus); // Set admin status in parent state

      onClose(); // Close modal on successful login
    } catch (error) {
      setError(error.message); // Display error from Firebase
    }
  };

  return (
    <Modal show={showModal} onClose={onClose}>
      <Modal.Header>{isLogin ? 'Login' : 'Register'}</Modal.Header>
      <Modal.Body>
        {/* If user is registering, show username field */}
        {!isLogin && (
          <div className="mb-4">
            <Label htmlFor="username" value="Username" />
            <TextInput
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
        )}
        <div className="mb-4">
          <Label htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={isLogin ? handleLogin : handleRegister}>
          {isLogin ? 'Login' : 'Register'}
        </Button>
        <Button onClick={handleToggleForm}>
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AuthModal;
