/**
 * Side-effect CSS imports — declare the `*.css` module shape so the
 * `dts` type build stops complaining that `import "./X.css"` has no
 * type declarations. These imports are stripped at build time (see
 * tsup.config.ts), but the types need to type-check.
 */
declare module "*.css";
