import {
  createTheme,
  MantineColorsTuple,     // helper type for better autocompletion
} from '@mantine/core';

// -- 10-shade palettes (light ➜ dark) --------------------------
const brand: MantineColorsTuple = [
  '#fcefe7', '#f9d2be', '#f5b694', '#f1996b', '#ed7d41',
  '#e96118', '#c24f11', '#993e0e', '#6f2d0a', '#461c06',
];

const secondary: MantineColorsTuple = [
  '#ebf2f8', '#c9dbed', '#a7c5e2', '#85aed7', '#6298cc',
  '#4081c1', '#346aa0', '#28547e', '#1d3d5c', '#122639',
];

// -- Mantine v7 theme -----------------------------------------
export const theme = createTheme({
  primaryColor: 'brand',          // use our orange palette everywhere
  colors: {
    brand,
    secondary,                    // optional – for component-level use
  },
  components: {
    // example of global default props
    Button: {
      defaultProps: { radius: 'md' },
    },
    Text: {
      defaultProps: { color: '#28547e' },
    },
  },
});