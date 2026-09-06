import { rem, type CSSVariablesResolver, type MantineThemeOverride } from '@mantine/core';

const customTheme = {
  game: {
    blue: "#2446A1",
    red: "#A14624",
    yellow: "#EAB000",
    gold: "#9C8B65",
    silver: "#747A78",
    crystal: "#6B4777",
    sapphire: "#104070",
    emerald: "#457865",
    ruby: "#781810",
    za: "#32796B",
  },
  type: {
    normal: '#9FA19F',
    fighting: '#FF8000',
    fly: '#81B9EF',
    poison: '#9141CB',
    ground: '#915121',
    rock: '#AFA981',
    bug: '#91A119',
    ghost: '#704170',
    steel: '#60A1B8',
    fire: '#E62829',
    water: '#2980EF',
    grass: '#3FA129',
    electric: '#FAC000',
    psychic: '#EF4179',
    ice: '#3FD8FF',
    dragon: '#5060E1',
    dark: '#50413F',
    fairy: '#EF70EF',
    stellar: '#F6A516',
    unknown: '#64A894',
  },
  stats: {
    hp: '#4caf70',
    atk: '#f08030',
    def: '#f0c030',
    spa: '#6890f0',
    spd: '#78c850',
    spe: '#f85888',
  },
  contest: {
    cool: '#EA7254',
    beauty: '#63B9D6',
    cute: '#E681B3',
    smart: '#5DC27B',
    tough: '#DEC02C',
  },
  misc: {
    genderMale: '#00C6AD',
    genderFemale: '#FF4273',
    markBlue: '#7077E4',
    markPink: '#F681DD',
  },
};

type CustomTheme = typeof customTheme;

declare module '@mantine/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface MantineThemeOther extends CustomTheme {
  }
}

export const baseTheme = {
  fontFamily: "'Pixel Operator', sans-serif",
  primaryShade: { light: 6, dark: 6 },
  primaryColor: 'primary',
  white: '#f4eae0', // --mantine-color-white, card/body bg (light) #f0e9e0 '#fef4ea',
  black: '#3a1e08', // --mantine-color-text, text color (dark)
  // autoContrast: true,
  colors: {
    white: [
      '#f4f4f4',
      '#f5f4f2',
      '#f8f3ee',
      '#fbf3eb',
      '#faf6f0',  // --mantine-color-white-4, --mantine-color-body (light)
      '#f4eae0',  // --mantine-color-white-5
      '#f0e9e0',  // --mantine-color-white-6
      '#e4dbd0',
      '#874605',
      '#190c00'
    ],
    gray: [
      '#ede2d8',  // Button hover
      '#e4d9d0',
      '#ded9cf',  // Progress bg
      '#cfc4b8',  // --mantine-color-gray-3, card border
      '#bfb4a8',
      '#9c9587',
      '#7b7467',
      '#565249',
      '#322f2b',
      '#0d0d0d'
    ],
    // #B6634E / #934E3D
    primary: [
      '#f5e5e4',
      '#f0e8e2',
      '#ecdeda',
      '#d5a89d',
      '#cd9688',
      '#cd9688',
      '#B6634E',
      '#934E3D',
      '#814435',
      '#150905'
    ],
    red: [
      "#ffeeea",
      "#f9ddd9",
      "#e9bab3",
      "#da958a",
      "#cd7668",
      "#c96b5c",
      "#c35746",
      "#ac4737",
      "#9a3e2f",
      "#883226"
    ],
    blue: [
      "#eaf5ff",
      "#dae7f6",
      "#b8cbe3",
      "#92aed1",
      "#7395c2",
      "#5c84b8",
      "#527eb6",
      "#426ca1",
      "#376091",
      "#275382"
    ],
  },
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(20),
    xl: rem(24),
  },
  shadows: {
    xs: `0 ${rem(1)} 0 rgba(0, 0, 0, 0.05)`,
    sm: `0 ${rem(2)} 0 rgba(0, 0, 0, 0.05)`,
    md: `0 ${rem(3)} 0 rgba(0, 0, 0, 0.05)`,
    lg: `0 ${rem(4)} 0 rgba(0, 0, 0, 0.05)`,
    xl: `0 ${rem(5)} 0 rgba(0, 0, 0, 0.05)`,
  },
  spacing: {
    xs: rem(2),
    sm: rem(4),
    md: rem(10),
    lg: rem(16),
    xl: rem(32)
  },
  radius: {
    xs: rem(2),
    sm: rem(4),
    md: rem(6),
    lg: rem(10),
    xl: rem(20),
  },
  breakpoints: {
    xs: '36rem', // rem(576),
    sm: '48rem', // rem(768),
    md: '64rem', // rem(1024),
    lg: '80rem', // rem(1280),
    xl: '93rem', // rem(1488),
  },
  other: customTheme,
} satisfies MantineThemeOverride;

export const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
  variables: {
  },
  light: {
    '--button-hover': 'var(--mantine-color-gray-0)',
    '--mantine-color-disabled': 'var(--mantine-color-white-5)',
  },
  dark: {
    '--mantine-color-disabled-color': 'var(--mantine-color-dark-1)',
  },
});
