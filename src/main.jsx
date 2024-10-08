import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Ganti dengan file CSS yang kamu gunakan
import App from './App';
import { ThemeProvider } from './ThemeContext';

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

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
