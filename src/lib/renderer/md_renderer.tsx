import type { ReactNode } from 'react';
import { MarkdownRenderer, type MarkdownRendererProps } from './MarkdownRenderer';

export { MarkdownRenderer } from './MarkdownRenderer';
export type { MarkdownRendererProps } from './MarkdownRenderer';
export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps } from './CodeBlock';
export { MathBlock } from './MathBlock';
export type { MathBlockProps } from './MathBlock';
export { MermaidBlock } from './MermaidBlock';
export type { MermaidBlockProps } from './MermaidBlock';
export { TableBlock, parseMarkdownTable } from './TableBlock';
export type { TableBlockProps, ParsedMarkdownTable, TableAlign } from './TableBlock';
export { ThinkBlock } from './ThinkBlock';
export type { ThinkBlockProps } from './ThinkBlock';

export const renderMarkdown = (markdown: string, options?: Omit<MarkdownRendererProps, 'markdown' | 'content'>): ReactNode => {
  return <MarkdownRenderer markdown={markdown} {...options} />;
};

export default MarkdownRenderer;
