import { useState, useCallback } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Markdown parser and renderer
interface MarkdownNode {
  type: string;
  content?: string;
  children?: MarkdownNode[];
  language?: string;
  level?: number;
  href?: string;
  alt?: string;
}

const parseMarkdown = (text: string): MarkdownNode[] => {
  const lines = text.split('\n');
  const nodes: MarkdownNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push({ type: 'codeblock', content: codeLines.join('\n'), language });
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const content = line.replace(/^#+\s*/, '');
      nodes.push({ type: 'heading', level, content: parseInline(content) });
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      nodes.push({ type: 'hr' });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const content = line.replace(/^>\s*/, '');
      nodes.push({ type: 'blockquote', content: parseInline(content) });
      i++;
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s*/, ''));
        i++;
      }
      nodes.push({ type: 'orderedlist', children: items.map(item => ({ type: 'listitem', content: parseInline(item) })) });
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(lines[i].replace(/^[-*]\s*/, ''));
        i++;
      }
      nodes.push({ type: 'unorderedlist', children: items.map(item => ({ type: 'listitem', content: parseInline(item) })) });
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    nodes.push({ type: 'paragraph', content: parseInline(line) });
    i++;
  }

  return nodes;
};

const parseInline = (text: string): string => {
  return text;
};

const highlightCode = (code: string, language: string): JSX.Element[] => {
  const lines = code.split('\n');
  
  const tokenize = (line: string, lang: string): JSX.Element[] => {
    const tokens: JSX.Element[] = [];
    let remaining = line;
    let key = 0;

    const patterns: { [key: string]: RegExp[] } = {
      javascript: [
        /^(function|const|let|var|return|if|else|for|while|class|import|export|from|default|async|await|new|this|typeof|instanceof)\b/,
        /^(true|false|null|undefined)\b/,
        /^"([^"\\]|\\.)*"/,
        /^'([^'\\]|\\.)*'/,
        /^`([^`\\]|\\.)*`/,
        /^\/\/.*$/,
        /^\/\*[\s\S]*?\*\//,
        /^\d+/,
        /^[a-zA-Z_$][a-zA-Z0-9_$]*/,
        /^[+\-*/%=<>!&|^~?:]+/,
        /^[{}[\]();,.]/,
      ],
      python: [
        /^(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|async|await)\b/,
        /^(True|False|None)\b/,
        /^"([^"\\]|\\.)*"/,
        /^'([^'\\]|\\.)*'/,
        /^#.*$/,
        /^\d+/,
        /^[a-zA-Z_][a-zA-Z0-9_]*/,
        /^[+\-*/%=<>!&|^~]+/,
        /^[{}[\]();:,.]/,
      ],
    };

    const langPatterns = patterns[lang] || patterns.javascript;

    while (remaining.length > 0) {
      let matched = false;

      for (let i = 0; i < langPatterns.length; i++) {
        const match = remaining.match(langPatterns[i]);
        if (match) {
          const token = match[0];
          let className = 'text-gray-300';

          if (i === 0) className = 'text-[#C586C0]'; // keywords
          else if (i === 1) className = 'text-[#569CD6]'; // constants
          else if (i >= 2 && i <= 4) className = 'text-[#CE9178]'; // strings
          else if (i === 5 || i === 6) className = 'text-[#6A9955]'; // comments
          else if (i === 7) className = 'text-[#B5CEA8]'; // numbers
          else if (i === 8) className = 'text-[#DCDCAA]'; // functions/identifiers
          else if (i === 9) className = 'text-[#D4D4D4]'; // operators
          else if (i === 10) className = 'text-[#D4D4D4]'; // punctuation

          tokens.push(<span key={key++} className={className}>{token}</span>);
          remaining = remaining.slice(token.length);
          matched = true;
          break;
        }
      }

      if (!matched) {
        tokens.push(<span key={key++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  };

  return lines.map((line, idx) => (
    <div key={idx} className="table-row">
      <span className="table-cell pr-4 text-right select-none text-gray-600 border-r border-[#30363d]" style={{ minWidth: '3em' }}>
        {idx + 1}
      </span>
      <span className="table-cell pl-4">
        {line.trim() === '' ? <span>&nbsp;</span> : tokenize(line, language)}
      </span>
    </div>
  ));
};

const renderInlineMarkdown = (text: string): JSX.Element[] => {
  const elements: JSX.Element[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      elements.push(<strong key={key++} className="font-bold text-blue-400">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      elements.push(<em key={key++} className="italic text-purple-400">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline code
    const codeMatch = remaining.match(/^`(.+?)`/);
    if (codeMatch) {
      elements.push(
        <code key={key++} className="bg-[#161b22] text-[#79c0ff] px-1.5 py-0.5 rounded text-sm font-mono border border-[#30363d]">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Links
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      elements.push(
        <a key={key++} href={linkMatch[2]} className="text-[#58a6ff] hover:underline" target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Images
    const imageMatch = remaining.match(/^!\[(.+?)\]\((.+?)\)/);
    if (imageMatch) {
      elements.push(
        <img key={key++} src={imageMatch[2]} alt={imageMatch[1]} className="max-w-full h-auto rounded-lg border border-[#30363d] my-2" />
      );
      remaining = remaining.slice(imageMatch[0].length);
      continue;
    }

    // Regular text
    elements.push(<span key={key++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return elements;
};

const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  const nodes = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <div className="prose prose-invert max-w-none">
      {nodes.map((node, idx) => {
        switch (node.type) {
          case 'heading':
            const HeadingTag = `h${node.level}` as keyof JSX.IntrinsicElements;
            const headingClasses = [
              'text-4xl font-bold mb-4 mt-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500',
              'text-3xl font-bold mb-3 mt-5 text-gray-100 border-b border-[#30363d] pb-2',
              'text-2xl font-semibold mb-3 mt-4 text-gray-200',
              'text-xl font-semibold mb-2 mt-3 text-gray-300',
              'text-lg font-medium mb-2 mt-2 text-gray-300',
              'text-base font-medium mb-2 mt-2 text-gray-400',
            ];
            return (
              <HeadingTag key={idx} className={headingClasses[(node.level || 1) - 1]}>
                {renderInlineMarkdown(node.content || '')}
              </HeadingTag>
            );

          case 'paragraph':
            return (
              <p key={idx} className="mb-4 text-gray-300 leading-relaxed">
                {renderInlineMarkdown(node.content || '')}
              </p>
            );

          case 'codeblock':
            return (
              <div key={idx} className="mb-4 rounded-lg overflow-hidden bg-[#161b22] border border-[#30363d]">
                <div className="bg-[#1f2937] px-4 py-2 text-xs text-gray-400 font-mono border-b border-[#30363d] flex items-center justify-between">
                  <span>{node.language}</span>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <pre className="p-4 overflow-x-auto">
                  <code className="font-mono text-sm table">
                    {highlightCode(node.content || '', node.language || 'text')}
                  </code>
                </pre>
              </div>
            );

          case 'unorderedlist':
            return (
              <ul key={idx} className="mb-4 ml-6 space-y-2 list-disc marker:text-blue-400">
                {node.children?.map((child, childIdx) => (
                  <li key={childIdx} className="text-gray-300 pl-2">
                    {renderInlineMarkdown(child.content || '')}
                  </li>
                ))}
              </ul>
            );

          case 'orderedlist':
            return (
              <ol key={idx} className="mb-4 ml-6 space-y-2 list-decimal marker:text-purple-400 marker:font-semibold">
                {node.children?.map((child, childIdx) => (
                  <li key={childIdx} className="text-gray-300 pl-2">
                    {renderInlineMarkdown(child.content || '')}
                  </li>
                ))}
              </ol>
            );

          case 'blockquote':
            return (
              <blockquote key={idx} className="mb-4 pl-4 border-l-4 border-blue-500 bg-[#161b22] py-3 pr-4 rounded-r-lg">
                <p className="text-gray-300 italic">
                  {renderInlineMarkdown(node.content || '')}
                </p>
              </blockquote>
            );

          case 'hr':
            return <hr key={idx} className="my-6 border-[#30363d]" />;

          default:
            return null;
        }
      })}
    </div>
  );
};

interface ToolbarButton {
  id: string;
  icon: any;
  label: string;
  action: string;
}

const toolbarButtons: ToolbarButton[] = [
  { id: 'bold', icon: Bold, label: 'Bold', action: '**text**' },
  { id: 'italic', icon: Italic, label: 'Italic', action: '*text*' },
  { id: 'code', icon: Code, label: 'Code', action: '`code`' },
  { id: 'list', icon: List, label: 'Bullet List', action: '- item' },
  { id: 'ordered', icon: ListOrdered, label: 'Numbered List', action: '1. item' },
  { id: 'link', icon: Link, label: 'Link', action: '[text](url)' },
  { id: 'image', icon: Image, label: 'Image', action: '![alt](url)' }
];


const mockMarkdownContent = `# Welcome to Premium Markdown Editor

## Features

This is a **bold** statement and this is *italic* text.

### Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}
\`\`\`

\`\`\`python
def calculate(x, y):
    result = x + y
    return result
\`\`\`

### Lists

- First item
- Second item
- Third item

1. Numbered one
2. Numbered two
3. Numbered three

### Inline Code

Use \`const variable = 'value'\` for inline code.

### Links and Images

[Visit Example](https://example.com)

> This is a blockquote with important information.

---

**End of document**
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(mockMarkdownContent);
  const [showPreview, setShowPreview] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
  // Calculate stats
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCursorPosition(e.target.selectionStart);
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const handleToolbarAction = useCallback((action: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);

    let newText = '';
    let newCursorPos = start;

    // Handle different markdown syntax patterns
    if (action.includes('**text**')) {
      // Bold
      if (selectedText) {
        newText = `${beforeText}**${selectedText}**${afterText}`;
        newCursorPos = end + 4;
      } else {
        newText = `${beforeText}**text**${afterText}`;
        newCursorPos = start + 2;
      }
    } else if (action.includes('*text*')) {
      // Italic
      if (selectedText) {
        newText = `${beforeText}*${selectedText}*${afterText}`;
        newCursorPos = end + 2;
      } else {
        newText = `${beforeText}*text*${afterText}`;
        newCursorPos = start + 1;
      }
    } else if (action.includes('`code`')) {
      // Inline code
      if (selectedText) {
        newText = `${beforeText}\`${selectedText}\`${afterText}`;
        newCursorPos = end + 2;
      } else {
        newText = `${beforeText}\`code\`${afterText}`;
        newCursorPos = start + 1;
      }
    } else if (action.includes('[text](url)')) {
      // Link
      if (selectedText) {
        newText = `${beforeText}[${selectedText}](url)${afterText}`;
        newCursorPos = end + selectedText.length + 3;
      } else {
        newText = `${beforeText}[text](url)${afterText}`;
        newCursorPos = start + 1;
      }
    } else if (action.includes('![alt](url)')) {
      // Image
      if (selectedText) {
        newText = `${beforeText}![${selectedText}](url)${afterText}`;
        newCursorPos = end + selectedText.length + 4;
      } else {
        newText = `${beforeText}![alt](url)${afterText}`;
        newCursorPos = start + 2;
      }
    } else if (action.includes('- item')) {
      // Bullet list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      newText = `${beforeText.substring(0, lineStart === 0 ? 0 : beforeText.length)}${lineStart === start ? '' : '\n'}${action}${afterText}`;
      newCursorPos = start + (lineStart === start ? 0 : 1) + action.length;
    } else if (action.includes('1. item')) {
      // Numbered list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      newText = `${beforeText.substring(0, lineStart === 0 ? 0 : beforeText.length)}${lineStart === start ? '' : '\n'}${action}${afterText}`;
      newCursorPos = start + (lineStart === start ? 0 : 1) + action.length;
    } else {
      // Default: insert action as-is
      newText = `${beforeText}${action}${afterText}`;
      newCursorPos = start + action.length;
    }

    setMarkdown(newText);
    
    // Update cursor position and focus textarea
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }
    }, 0);
  }, [markdown, cursorPosition]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Premium Markdown Editor
          </h1>
          <Button
            onClick={togglePreview}
            variant="outline"
            className="bg-[#161b22] border-[#30363d] hover:bg-[#1f2937] text-gray-300"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>

        {/* Floating Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-[#161b22] border border-[#30363d] rounded-lg p-3 shadow-xl"
        >
          <div className="flex flex-wrap gap-2">
            {toolbarButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleToolbarAction(button.action)}
                  variant="ghost"
                  size="sm"
                  className="bg-[#0d1117] border border-[#30363d] hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-400/50 text-gray-300 hover:text-white transition-all duration-200 group relative"
                  title={button.label}
                >
                  <button.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors duration-200" />
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-[#1f2937] px-2 py-1 rounded border border-[#30363d] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {button.label}
                  </motion.span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <motion.div
            layout
            className="relative"
          >
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Editor</span>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <textarea
                value={markdown}
                onChange={handleMarkdownChange}
                className="w-full h-[600px] bg-[#0d1117] text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none"
                placeholder="Start writing your markdown..."
                spellCheck={false}
              />
            </div>
          </motion.div>

          {/* Preview Panel */}
          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-2xl">
                  <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d]">
                    <span className="text-sm font-medium text-gray-400">Preview</span>
                  </div>
                  <div className="p-6 h-[600px] overflow-y-auto">
                    <MarkdownRenderer markdown={markdown} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-4"
        >
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Words:</span>
              <span className="font-semibold text-blue-400">{wordCount}</span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Characters:</span>
              <span className="font-semibold text-purple-400">{charCount}</span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Reading Time:</span>
              <span className="font-semibold text-green-400">
                {readingTime} {readingTime === 1 ? 'min' : 'mins'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}