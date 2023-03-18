require('dotenv').config();
const CopyPlugin = require("copy-webpack-plugin");
const WatchExternalFilesPlugin = require('webpack-watch-files-plugin').default

const path = require("path");

const isProduction = process.env.NODE_ENV == "production";
const modName = process.env.MOD_NAME;
const distFolder = process.env.DIST_FOLDER;

const distModPath = `${distFolder}${modName}`

const config = {
  entry: `./src/ui/mods/mod_${modName}/index.ts`,
  output: {
    path: `${distModPath}/ui/mods/mod_${modName}`,
    environment: {
      arrowFunction: false
    },
    clean: true 
  },
  plugins: [
    new WatchExternalFilesPlugin({
      files: [
        './src/**/*',
      ]
    }),
    new CopyPlugin({
      patterns: [
        { from: "./**/*", to: "./../../../[path][name][ext]", context: "./src", },
      ],
    })
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
