/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        animation: {
          'spin-slow': 'spin 30s linear infinite',
        },
        colors: {
          // Custom colors for university cards if needed
        },
      },
    },
    plugins: [],
  }