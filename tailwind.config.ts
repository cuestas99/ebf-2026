import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        roxo: {
          DEFAULT: '#8B3FBE',
          escuro:  '#6B2F96',
          claro:   '#F0E4FA',
        },
        amarelo: {
          DEFAULT: '#F5C518',
          escuro:  '#D4A800',
          claro:   '#FFFBEA',
        },
        fundo: '#FAF3E0',
        turma: {
          bebes:    '#EC4899',
          jardim:   '#22C55E',
          juniores: '#3B82F6',
          pre:      '#8B3FBE',
        },
      },
      fontFamily: {
        fredoka: ['var(--font-fredoka)', 'cursive'],
        nunito:  ['var(--font-nunito)', 'sans-serif'],
      },
      borderRadius: {
        btn:  '99px',
        card: '14px',
      },
      boxShadow: {
        cartoon:        '4px 4px 0px #5a2680',
        'cartoon-sm':   '3px 3px 0px #5a2680',
        'cartoon-amarelo': '4px 4px 0px #D4A800',
        'cartoon-verde':   '4px 4px 0px #15803d',
        'cartoon-red':     '4px 4px 0px #b91c1c',
        card:           '0 2px 0px #c8b49a',
      },
    },
  },
  plugins: [],
}
export default config
