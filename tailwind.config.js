import { content as flowbiteContent, plugin as flowbitePlugin } from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  ...flowbiteContent(), // gunakan spread operator untuk menyebarkan hasil dari flowbiteContent
];

export const theme = {
  extend: {},
};

export const darkMode = 'class'; // tambahkan dark mode support dengan menggunakan class

export const plugins = [
  flowbitePlugin(), // gunakan plugin dari flowbite-react untuk mendukung komponen Flowbite
];
