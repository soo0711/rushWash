/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["산돌광수체", "YoonSSH", "system-ui", "sans-serif"],
      },
      backgroundColor: {
        "blue-200": "#b3e5fc", // 헤더 및 메뉴 항목 배경색
      },
      borderRadius: {
        full: "9999px", // 동그란 메뉴 아이템
      },
      aspectRatio: {
        square: "1 / 1",
      },
    },
  },
  plugins: [],
};
