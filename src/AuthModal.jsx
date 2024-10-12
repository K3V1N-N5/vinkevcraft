import React, { useState } from 'react';
import { Modal, Button, TextInput, Label } from 'flowbite-react';
import { auth, db, checkAdmin } from './firebase'; // Firebase imports
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; 
import { doc, setDoc } from 'firebase/firestore';

function AuthModal({ showModal, onClose, setIsAdmin }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For registration
  const [error, setError] = useState('');

  // Switch between login and registration
  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    setError(''); // Clear errors when switching forms
  };

  // Registration handler
  const handleRegister = async () => {
    if (!email || !password || !username) {
      setError('All fields are required.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username,
        email: user.email,
        isAdmin: false, // Default role is non-admin
      });

      const adminStatus = await checkAdmin(user.uid); // Check admin status
      setIsAdmin(adminStatus); // Set admin state

      onClose(); // Close modal after success
    } catch (error) {
      setError(error.message); // Display Firebase error
    }
  };

  // Login handler
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const adminStatus = await checkAdmin(user.uid); // Check admin status
      setIsAdmin(adminStatus); // Set admin state

      onClose(); // Close modal after success
    } catch (error) {
      setError(error.message); // Display Firebase error
    }
  };

  return (
    <Modal show={showModal} onClose={onClose}>
      <Modal.Header>{isLogin ? 'Login' : 'Register'}</Modal.Header>
      <Modal.Body>
        {!isLogin && (
          <div className="mb-4">
            <Label htmlFor="username" value="Username" />
            <TextInput
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
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
