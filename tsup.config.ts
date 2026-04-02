import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // 同时支持 require 和 import
  dts: true,              // 自动生成 TypeScript 类型声明文件 (.d.ts)
  minify: true,           // 压缩代码
  clean: true,            // 每次打包前清空旧文件
  external: [
    'react',
    'react-dom',
    '@emotion/react',
    '@emotion/styled',
    '@mui/material',
    '@mui/icons-material',
    '@mui/x-date-pickers',
    'framer-motion',
    'ogl',
  ], // 告诉打包工具：这些包由使用者的项目提供，不要打包进去
  treeshake: true,
  // 关键：保留你的 "use client" 指令，这对于 Next.js 使用者非常重要
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
