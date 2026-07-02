/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Mirror CSS custom properties so Tailwind classes work alongside them
        bg:          '#0f0d17',
        surface:     '#1a1726',
        'surface-alt':'#231f33',
        border:      '#2e2a42',
        primary:     '#a78bfa',
        'primary-dim':'#7c3aed',
        success:     '#34d399',
        warning:     '#fbbf24',
        danger:      '#f87171',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
    },
  },
  plugins: [],
};
