import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Ganti dengan file CSS yang kamu gunakan
import App from './App';
import { ThemeProvider } from './ThemeContext';
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// Cek apakah tema tersimpan di localStorage
const savedTheme = localStorage.getItem('theme');

// Jika ada tema tersimpan, tambahkan kelas 'dark' ke elemen <html>
if (savedTheme) {
  document.documentElement.classList.add(savedTheme);
} else {
  // Jika tidak ada, default ke dark mode dan simpan di localStorage
  localStorage.setItem('theme', 'dark');
  document.documentElement.classList.add('dark');
}

exports.listUsers = functions.https.onCall(async (data, context) => {
  let users = [];
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    listUsersResult.users.forEach((userRecord) => {
      users.push(userRecord.toJSON());
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }
  return { users };
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
  try {
    await admin.auth().deleteUser(data.uid);
    console.log(`Successfully deleted user with UID: ${data.uid}`);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
});

exports.deleteUserData = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();
  const userId = data.uid;

  // Hapus komentar dari user ini
  const commentsRef = db.collection('comments').where('userId', '==', userId);
  const snapshot = await commentsRef.get();
  if (!snapshot.empty) {
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
    console.log(`Deleted comments for user: ${userId}`);
  }
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
