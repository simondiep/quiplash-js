require("ignore-styles");

require("@babel/register")({
  plugins: ["@babel/plugin-proposal-class-properties"],
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: 12,
        },
      },
    ],
    "@babel/preset-react",
  ],
});
require("./index");
