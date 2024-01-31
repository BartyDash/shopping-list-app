/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        redbowl: {
          light: '#E4322B',
          dark: '#cc211a'
        },
        brown: '#4F2612',
        'brown-derby': '#532A16',
        'yellow-soup': {
          light:'#fcebbb',
          dark: '#fad878'
        },
        'carolina-blue': '#87bcdeff',
        charcoal: '#2d4654ff'
      },
      fontFamily: {
        'caveat_brush': ['Caveat Brush', 'cursive'],
        'pangolin': ['Pangolin', 'cursive']
      }
    },
  },
  plugins: [],
}

