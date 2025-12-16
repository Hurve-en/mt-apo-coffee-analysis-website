// Note: avoid importing `tailwindcss` types here to prevent TypeScript errors
// when dependencies are not yet installed. Use an untyped `config` value.

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf7f4',
          100: '#f4ede5',
          200: '#e8d9ca',
          300: '#d7bea5',
          400: '#c49d7a',
          500: '#b6825d',
          600: '#a96f51',
          700: '#8d5945',
          800: '#72493c',
          900: '#5d3d32',
        },
      },
    },
  },
  plugins: [],
}
export default config
