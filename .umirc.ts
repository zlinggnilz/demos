import { defineConfig } from "umi";

export default defineConfig({
  npmClient: 'yarn',
  publicPath:process.env.NODE_ENV === 'production' ? '/demos/' : '/',
  base:process.env.NODE_ENV === 'production' ? '/demos/' : '/',
  inlineLimit:10,
  // mfsu:false,
  extraBabelPlugins: process.env.NODE_ENV === 'production' ? ['babel-plugin-dynamic-import-node'] : [],
  hash:true,
});
