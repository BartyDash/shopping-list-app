/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'caveat_brush': ['Caveat Brush', 'cursive'],
        'pangolin': ['Pangolin', 'cursive']
      }
    },
  },
  plugins: [],
}

