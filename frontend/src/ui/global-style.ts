import { injectGlobal } from "@emotion/css";
import { theme } from "./theme";

import "normalize.css";

injectGlobal(`
  @import url('fonts/pixel-operator/font-face.css');
  @import url('fonts/pokemon-emerald/font-face.css');

  :root {
    font-family: 'Pixel Operator', sans-serif;
    // line-height: 1.5;

    color: ${theme.text.default};
    text-shadow: ${theme.shadow.text};

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    background-color: ${theme.bg.app};
    background-image: radial-gradient(${theme.bg.appdark} 4px, ${theme.bg.app} 4px);
    background-size: 40px 40px;
  }

  * {
    box-sizing: border-box;
    scrollbar-width: thin;
  }

  body {
    margin: 0;
  }

  a {
    text-decoration: none;
  }
`);
