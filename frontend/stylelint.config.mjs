export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-css-modules",
  ],
  rules: {
    "declaration-block-no-duplicate-properties": true,
    "color-no-invalid-hex": true,
    "declaration-no-important": true,
  },
};
