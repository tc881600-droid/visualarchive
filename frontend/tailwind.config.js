/** Theme tokens copied EXACTLY from the inline CDN config in index.html (source of truth). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#100E0C', ink2: '#191613', ink3: '#211D19', bone: '#F4F1EA', taupe: '#A79E90', vermilion: '#FC4C13', ember: '#E9A13B', paper: '#FFFFFF', cod: '#1D1D1D' },
      fontFamily: { display: ['Anton', 'Impact', 'sans-serif'], body: ['Space Grotesk', 'Helvetica Neue', 'sans-serif'], mono: ['Space Mono', 'monospace'] }
    }
  },
  corePlugins: { preflight: true },
  plugins: []
};
