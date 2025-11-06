/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f97316",   // 主按钮（保留你"Magic Bag"橙）
          50: "#fff7ed",
          100: "#ffedd5",
          600: "#ea580c",
          700: "#c2410c"
        },
        ink: {
          900: "#0f172a",
          700: "#334155",
          500: "#64748b",
          300: "#cbd5e1"
        }
      },
      boxShadow: {
        soft: "0 6px 20px rgba(2, 8, 23, 0.06)"
      },
      borderRadius: {
        xl2: "16px",
        '2xl': "16px"  // 确保 2xl 也是 16px
      }
    },
  },
  plugins: [],
}

