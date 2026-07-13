export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["dist/**", "node_modules/**"],
  rules: {
    "custom-property-pattern": null,
    "selector-class-pattern": null,
    "no-descending-specificity": null
  }
};
