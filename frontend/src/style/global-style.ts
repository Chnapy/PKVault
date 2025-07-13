import { injectGlobal } from "@emotion/css";
import { theme } from "../ui/theme";

import "normalize.css";

injectGlobal(`
  @import url('fonts/pixel-operator/font-face.css');
  @import url('fonts/pokemon-emerald/font-face.css');

  :root {
    font-family: 'Pixel Operator', sans-serif;
    // line-height: 1.5;

    color: ${theme.text.default};
    text-shadow: 1px 1px 0px rgba(0,0,0,0.2);

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    background-color: #F3F4F4;
    background-image: radial-gradient(#C4C6C8 2px, #F3F4F4 2px);
    background-size: 40px 40px;
  }

  a {
    text-decoration: none;
  }
`);
