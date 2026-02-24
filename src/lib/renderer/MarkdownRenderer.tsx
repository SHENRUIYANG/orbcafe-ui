'use client';

import { Fragment, type ReactNode, useMemo } from 'react';
import { Box, Divider, Link, Paper, Typography } from '@mui/material';
import { CodeBlock } from './CodeBlock';
import { MathBlock } from './MathBlock';
import { MermaidBlock } from './MermaidBlock';
import { TableBlock, parseMarkdownTable } from './TableBlock';
import { ThinkBlock } from './ThinkBlock';

export interface MarkdownRendererProps {
  markdown?: string;
  content?: string;
  className?: string;
  enableMath?: boolean;
  enableMermaid?: boolean;
  enableThinkBlock?: boolean;
  codeCopyable?: boolean;
  codeLineNumbers?: boolean;
}

interface InlineOptions {
  enableMath: boolean;
}

const inlineTokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|\$[^$\n]+\$)/g;

const isFenceStart = (line: string) => line.trim().startsWith('```');
const isHeading = (line: string) => /^#{1,6}\s+/.test(line.trim());
const isUnorderedItem = (line: string) => /^[-*+]\s+/.test(line.trim());
const isOrderedItem = (line: string) => /^\d+\.\s+/.test(line.trim());
const isHr = (line: string) => /^(?:-{3,}|\*{3,}|_{3,})$/.test(line.trim());
const isBlockquote = (line: string) => line.trim().startsWith('>');

const isPotentialTable = (lines: string[], index: number): boolean => {
  if (index + 1 >= lines.length) return false;
  const first = lines[index];
  const second = lines[index + 1];
  if (!first.includes('|') || !second.includes('|')) return false;
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(second.trim());
};

const isThinkStart = (line: string) => line.trim().startsWith('<think>') || line.trim() === ':::think';

const parseInline = (text: string, options: InlineOptions, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;
  inlineTokenRegex.lastIndex = 0;
  let match = inlineTokenRegex.exec(text);

  while (match) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    const tokenKey = `${keyPrefix}-${tokenIndex}`;

    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(<strong key={tokenKey}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(<em key={tokenKey}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <Box
          key={tokenKey}
          component="code"
          sx={{
            px: 0.45,
            py: 0.08,
            borderRadius: 0.8,
            bgcolor: 'action.hover',
            fontSize: '0.82em',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {token.slice(1, -1)}
        </Box>,
      );
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <Link key={tokenKey} href={linkMatch[2]} target="_blank" rel="noreferrer" underline="hover">
            {linkMatch[1]}
          </Link>,
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('$') && token.endsWith('$') && options.enableMath) {
      nodes.push(<MathBlock key={tokenKey} expression={token} inline allowKatex />);
    } else {
      nodes.push(token);
    }

    cursor = match.index + token.length;
    tokenIndex += 1;
    match = inlineTokenRegex.exec(text);
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes.length > 0 ? nodes : [text];
};

export const MarkdownRenderer = ({
  markdown,
  content,
  className,
  enableMath = true,
  enableMermaid = true,
  enableThinkBlock = true,
  codeCopyable = true,
  codeLineNumbers = false,
}: MarkdownRendererProps) => {
  const source = markdown ?? content ?? '';

  const nodes = useMemo(() => {
    const blocks: ReactNode[] = [];
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const inlineOptions: InlineOptions = { enableMath };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i += 1;
        continue;
      }

      if (enableThinkBlock && isThinkStart(line)) {
        if (trimmed.startsWith('<think>')) {
          const parts: string[] = [];
          let cursor = line;

          while (true) {
            const startIndex = cursor.indexOf('<think>');
            const withoutStart = startIndex >= 0 ? cursor.slice(startIndex + 7) : cursor;
            const endIndex = withoutStart.indexOf('</think>');
            if (endIndex >= 0) {
              parts.push(withoutStart.slice(0, endIndex));
              i += 1;
              break;
            }
            parts.push(withoutStart);
            i += 1;
            if (i >= lines.length) break;
            cursor = lines[i];
          }

          blocks.push(<ThinkBlock key={`think-tag-${i}`} content={parts.join('\n').trim()} />);
          continue;
        }

        i += 1;
        const body: string[] = [];
        while (i < lines.length && lines[i].trim() !== ':::') {
          body.push(lines[i]);
          i += 1;
        }
        if (i < lines.length && lines[i].trim() === ':::') {
          i += 1;
        }
        blocks.push(<ThinkBlock key={`think-fence-${i}`} content={body.join('\n').trim()} />);
        continue;
      }

      if (isFenceStart(line)) {
        const language = trimmed.slice(3).trim().toLowerCase();
        const codeLines: string[] = [];
        i += 1;
        while (i < lines.length && !isFenceStart(lines[i])) {
          codeLines.push(lines[i]);
          i += 1;
        }
        if (i < lines.length && isFenceStart(lines[i])) {
          i += 1;
        }

        const code = codeLines.join('\n');

        if (enableMermaid && language === 'mermaid') {
          blocks.push(<MermaidBlock key={`mermaid-${i}`} code={code} />);
          continue;
        }

        if (enableMath && ['math', 'latex', 'katex'].includes(language)) {
          blocks.push(<MathBlock key={`math-fence-${i}`} expression={code} allowKatex />);
          continue;
        }

        blocks.push(
          <CodeBlock
            key={`code-${i}`}
            code={code}
            language={language || 'text'}
            copyable={codeCopyable}
            showLineNumbers={codeLineNumbers}
            wrapLongLines
          />,
        );
        continue;
      }

      if (enableMath && trimmed.startsWith('$$')) {
        const collected: string[] = [];
        const sameLineClosed = trimmed.endsWith('$$') && trimmed !== '$$';

        if (sameLineClosed) {
          collected.push(trimmed.slice(2, -2));
          i += 1;
        } else {
          const first = line.slice(line.indexOf('$$') + 2);
          if (first.trim()) {
            collected.push(first);
          }
          i += 1;
          while (i < lines.length) {
            const current = lines[i];
            const closeIndex = current.indexOf('$$');
            if (closeIndex >= 0) {
              collected.push(current.slice(0, closeIndex));
              i += 1;
              break;
            }
            collected.push(current);
            i += 1;
          }
        }

        blocks.push(<MathBlock key={`math-${i}`} expression={collected.join('\n').trim()} allowKatex />);
        continue;
      }

      if (isHeading(line)) {
        const level = Math.min(6, line.match(/^#{1,6}/)?.[0]?.length || 1);
        const content = line.replace(/^#{1,6}\s+/, '');
        const variant = level === 1 ? 'h5' : level === 2 ? 'h6' : 'subtitle1';
        blocks.push(
          <Typography key={`heading-${i}`} variant={variant} sx={{ mt: level === 1 ? 1.2 : 0.8, mb: 0.5, fontWeight: 700 }}>
            {parseInline(content, inlineOptions, `h-${i}`)}
          </Typography>,
        );
        i += 1;
        continue;
      }

      if (isHr(line)) {
        blocks.push(<Divider key={`hr-${i}`} sx={{ my: 1.2 }} />);
        i += 1;
        continue;
      }

      if (isPotentialTable(lines, i)) {
        let end = i + 2;
        while (end < lines.length && lines[end].trim() && lines[end].includes('|')) {
          end += 1;
        }
        const tableMarkdown = lines.slice(i, end).join('\n');
        const parsed = parseMarkdownTable(tableMarkdown);
        if (parsed) {
          blocks.push(<TableBlock key={`table-${i}`} table={parsed} />);
          i = end;
          continue;
        }
      }

      if (isBlockquote(line)) {
        const quoteLines: string[] = [];
        while (i < lines.length && isBlockquote(lines[i])) {
          quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
          i += 1;
        }

        blocks.push(
          <Paper
            key={`quote-${i}`}
            variant="outlined"
            sx={{
              px: 1,
              py: 0.8,
              my: 0.9,
              borderLeftWidth: 3,
              borderLeftStyle: 'solid',
              borderLeftColor: 'primary.main',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {quoteLines.map((quoteLine, quoteIndex) => (
                <Fragment key={`quote-line-${quoteIndex}`}>
                  {quoteIndex > 0 && <br />}
                  {parseInline(quoteLine, inlineOptions, `q-${i}-${quoteIndex}`)}
                </Fragment>
              ))}
            </Typography>
          </Paper>,
        );
        continue;
      }

      if (isUnorderedItem(line)) {
        const items: string[] = [];
        while (i < lines.length && isUnorderedItem(lines[i])) {
          items.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
          i += 1;
        }

        blocks.push(
          <Box component="ul" key={`ul-${i}`} sx={{ my: 0.8, pl: 2.5 }}>
            {items.map((item, itemIndex) => (
              <Box component="li" key={`ul-item-${itemIndex}`} sx={{ mb: 0.45 }}>
                <Typography variant="body2">
                  {parseInline(item, inlineOptions, `ul-${i}-${itemIndex}`)}
                </Typography>
              </Box>
            ))}
          </Box>,
        );
        continue;
      }

      if (isOrderedItem(line)) {
        const items: string[] = [];
        while (i < lines.length && isOrderedItem(lines[i])) {
          items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i += 1;
        }

        blocks.push(
          <Box component="ol" key={`ol-${i}`} sx={{ my: 0.8, pl: 2.7 }}>
            {items.map((item, itemIndex) => (
              <Box component="li" key={`ol-item-${itemIndex}`} sx={{ mb: 0.45 }}>
                <Typography variant="body2">
                  {parseInline(item, inlineOptions, `ol-${i}-${itemIndex}`)}
                </Typography>
              </Box>
            ))}
          </Box>,
        );
        continue;
      }

      const paragraphLines: string[] = [];
      while (i < lines.length) {
        const candidate = lines[i];
        const candidateTrim = candidate.trim();
        if (!candidateTrim) break;
        if (
          isFenceStart(candidate) ||
          isHeading(candidate) ||
          isHr(candidate) ||
          isUnorderedItem(candidate) ||
          isOrderedItem(candidate) ||
          isBlockquote(candidate) ||
          isPotentialTable(lines, i) ||
          (enableThinkBlock && isThinkStart(candidate)) ||
          (enableMath && candidateTrim.startsWith('$$'))
        ) {
          break;
        }
        paragraphLines.push(candidate);
        i += 1;
      }

      if (paragraphLines.length > 0) {
        blocks.push(
          <Typography key={`p-${i}`} variant="body2" sx={{ my: 0.65, lineHeight: 1.65 }}>
            {paragraphLines.map((paragraphLine, paragraphIndex) => (
              <Fragment key={`p-line-${paragraphIndex}`}>
                {paragraphIndex > 0 && <br />}
                {parseInline(paragraphLine, inlineOptions, `p-${i}-${paragraphIndex}`)}
              </Fragment>
            ))}
          </Typography>,
        );
      } else {
        i += 1;
      }
    }

    return blocks;
  }, [source, enableMath, enableMermaid, enableThinkBlock, codeCopyable, codeLineNumbers]);

  return (
    <Box
      className={className}
      sx={{
        '& strong': { fontWeight: 700 },
        '& em': { fontStyle: 'italic' },
        '& a': { wordBreak: 'break-all' },
      }}
    >
      {nodes}
    </Box>
  );
};

export default MarkdownRenderer;
