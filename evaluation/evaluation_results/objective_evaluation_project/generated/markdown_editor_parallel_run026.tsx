import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

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

const calculateStats = (text: string) => {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const characters = text.length;
  const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute
  
  return { words, characters, readingTime };
};

// Markdown parser component
const MarkdownPreview = ({ content }: { content: string }) => {
  const parsedContent = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  return <div className="markdown-preview prose prose-invert max-w-none">{parsedContent}</div>;
};

// Parse markdown to React elements
const parseMarkdown = (markdown: string): React.ReactNode[] => {
  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let codeBlock: { language: string; code: string[] } | null = null;
  let blockquoteLines: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-4 text-gray-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="ml-4">{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const flushOrderedList = () => {
    if (orderedListItems.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-4 text-gray-300">
          {orderedListItems.map((item, idx) => (
            <li key={idx} className="ml-4">{parseInline(item)}</li>
          ))}
        </ol>
      );
      orderedListItems = [];
    }
  };

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      elements.push(
        <blockquote key={`bq-${elements.length}`} className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-gray-400 bg-[#161b22] rounded-r">
          {blockquoteLines.map((line, idx) => (
            <p key={idx}>{parseInline(line)}</p>
          ))}
        </blockquote>
      );
      blockquoteLines = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Code block detection
    if (line.trim().startsWith('```')) {
      flushList();
      flushOrderedList();
      flushBlockquote();
      
      const language = line.trim().substring(3).trim() || 'text';
      const codeLines: string[] = [];
      i++;
      
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      elements.push(
        <div key={`code-${elements.length}`} className="my-4 rounded-lg overflow-hidden border border-[#30363d] bg-[#161b22]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-[#30363d]">
            <span className="text-xs font-mono text-gray-400">{language}</span>
            <Code className="w-3 h-3 text-gray-500" />
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm font-mono">{highlightCode(codeLines.join('\n'), language)}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      flushList();
      flushOrderedList();
      blockquoteLines.push(line.trim().substring(1).trim());
      i++;
      continue;
    } else if (blockquoteLines.length > 0) {
      flushBlockquote();
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      flushList();
      flushOrderedList();
      elements.push(<hr key={`hr-${elements.length}`} className="my-6 border-[#30363d]" />);
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      flushList();
      flushOrderedList();
      elements.push(<h1 key={`h1-${i}`} className="text-4xl font-bold mb-4 mt-6 text-blue-400">{parseInline(line.substring(2))}</h1>);
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      flushOrderedList();
      elements.push(<h2 key={`h2-${i}`} className="text-3xl font-bold mb-3 mt-5 text-purple-400">{parseInline(line.substring(3))}</h2>);
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      flushList();
      flushOrderedList();
      elements.push(<h3 key={`h3-${i}`} className="text-2xl font-semibold mb-3 mt-4 text-pink-400">{parseInline(line.substring(4))}</h3>);
      i++;
      continue;
    }

    // Unordered list
    if (line.trim().startsWith('- ')) {
      flushOrderedList();
      listItems.push(line.trim().substring(2));
      i++;
      continue;
    } else if (listItems.length > 0) {
      flushList();
    }

    // Ordered list
    const orderedMatch = line.trim().match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushList();
      orderedListItems.push(orderedMatch[1]);
      i++;
      continue;
    } else if (orderedListItems.length > 0) {
      flushOrderedList();
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      flushOrderedList();
      i++;
      continue;
    }

    // Paragraph
    flushList();
    flushOrderedList();
    elements.push(<p key={`p-${i}`} className="mb-4 text-gray-300 leading-relaxed">{parseInline(line)}</p>);
    i++;
  }

  flushList();
  flushOrderedList();
  flushBlockquote();

  return elements;
};

// Parse inline markdown (bold, italic, code, links, images)
const parseInline = (text: string): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      elements.push(<strong key={key++} className="font-bold text-blue-300">{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }

    // Italic *text*
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      elements.push(<em key={key++} className="italic text-purple-300">{italicMatch[1]}</em>);
      remaining = remaining.substring(italicMatch[0].length);
      continue;
    }

    // Inline code `code`
    const codeMatch = remaining.match(/^`(.+?)`/);
    if (codeMatch) {
      elements.push(
        <code key={key++} className="px-2 py-0.5 bg-[#161b22] border border-[#30363d] rounded text-sm font-mono text-pink-400">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(codeMatch[0].length);
      continue;
    }

    // Links [text](url)
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      elements.push(
        <a key={key++} href={linkMatch[2]} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(linkMatch[0].length);
      continue;
    }

    // Images ![alt](url)
    const imageMatch = remaining.match(/^!\[(.+?)\]\((.+?)\)/);
    if (imageMatch) {
      elements.push(
        <img key={key++} src={imageMatch[2]} alt={imageMatch[1]} className="max-w-full h-auto rounded-lg my-2 border border-[#30363d]" />
      );
      remaining = remaining.substring(imageMatch[0].length);
      continue;
    }

    // Regular text
    elements.push(remaining[0]);
    remaining = remaining.substring(1);
  }

  return elements;
};

// Syntax highlighting for code blocks
const highlightCode = (code: string, language: string): React.ReactNode[] => {
  const lines = code.split('\n');
  
  return lines.map((line, idx) => {
    const highlighted = highlightLine(line, language);
    return (
      <div key={idx} className="leading-relaxed">
        {highlighted}
      </div>
    );
  });
};

const highlightLine = (line: string, language: string): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Keywords by language
  const keywords: Record<string, string[]> = {
    javascript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'try', 'catch'],
    python: ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'class', 'import', 'from', 'as', 'try', 'except', 'with', 'lambda', 'yield'],
    typescript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'interface', 'type', 'async', 'await'],
  };

  const langKeywords = keywords[language] || [];

  while (remaining.length > 0) {
    // String literals
    const stringMatch = remaining.match(/^(['"`]).*?\1/);
    if (stringMatch) {
      elements.push(<span key={key++} className="text-green-400">{stringMatch[0]}</span>);
      remaining = remaining.substring(stringMatch[0].length);
      continue;
    }

    // Template literals
    const templateMatch = remaining.match(/^`[^`]*`/);
    if (templateMatch) {
      elements.push(<span key={key++} className="text-green-400">{templateMatch[0]}</span>);
      remaining = remaining.substring(templateMatch[0].length);
      continue;
    }

    // Comments
    const commentMatch = remaining.match(/^(\/\/.*|#.*)/);
    if (commentMatch) {
      elements.push(<span key={key++} className="text-gray-500 italic">{commentMatch[0]}</span>);
      remaining = remaining.substring(commentMatch[0].length);
      continue;
    }

    // Numbers
    const numberMatch = remaining.match(/^\d+(\.\d+)?/);
    if (numberMatch) {
      elements.push(<span key={key++} className="text-orange-400">{numberMatch[0]}</span>);
      remaining = remaining.substring(numberMatch[0].length);
      continue;
    }

    // Keywords
    let keywordFound = false;
    for (const keyword of langKeywords) {
      if (remaining.startsWith(keyword) && (remaining.length === keyword.length || !/[a-zA-Z0-9_]/.test(remaining[keyword.length]))) {
        elements.push(<span key={key++} className="text-purple-400 font-semibold">{keyword}</span>);
        remaining = remaining.substring(keyword.length);
        keywordFound = true;
        break;
      }
    }
    if (keywordFound) continue;

    // Function calls
    const functionMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*(?=\()/);
    if (functionMatch) {
      elements.push(<span key={key++} className="text-yellow-400">{functionMatch[0]}</span>);
      remaining = remaining.substring(functionMatch[0].length);
      continue;
    }

    // Operators and punctuation
    if (/^[+\-*/%=<>!&|^~?:;,.()\[\]{}]/.test(remaining)) {
      elements.push(<span key={key++} className="text-cyan-400">{remaining[0]}</span>);
      remaining = remaining.substring(1);
      continue;
    }

    // Regular text
    const textMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (textMatch) {
      elements.push(<span key={key++} className="text-gray-300">{textMatch[0]}</span>);
      remaining = remaining.substring(textMatch[0].length);
      continue;
    }

    // Whitespace and other characters
    elements.push(remaining[0]);
    remaining = remaining.substring(1);
  }

  return elements;
};

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(mockMarkdownContent);
  const [showPreview, setShowPreview] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCursorPosition(e.target.selectionStart);
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const handleToolbarAction = useCallback((action: string) => {
    const textareaElement = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textareaElement) return;

    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;

    // Handle different markdown syntax patterns
    if (action.includes('**text**')) {
      newText = selectedText ? `**${selectedText}**` : '**text**';
      cursorOffset = selectedText ? newText.length : 2;
    } else if (action.includes('*text*')) {
      newText = selectedText ? `*${selectedText}*` : '*text*';
      cursorOffset = selectedText ? newText.length : 1;
    } else if (action.includes('`code`')) {
      newText = selectedText ? `\`${selectedText}\`` : '`code`';
      cursorOffset = selectedText ? newText.length : 1;
    } else if (action.includes('[text](url)')) {
      newText = selectedText ? `[${selectedText}](url)` : '[text](url)';
      cursorOffset = selectedText ? selectedText.length + 3 : 1;
    } else if (action.includes('![alt](url)')) {
      newText = selectedText ? `![${selectedText}](url)` : '![alt](url)';
      cursorOffset = selectedText ? selectedText.length + 4 : 2;
    } else if (action.includes('- item')) {
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const isNewLine = start === lineStart || start === 0;
      newText = isNewLine ? '- ' : '\n- ';
      cursorOffset = newText.length;
    } else if (action.includes('1. item')) {
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const isNewLine = start === lineStart || start === 0;
      newText = isNewLine ? '1. ' : '\n1. ';
      cursorOffset = newText.length;
    }

    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);

    // Update cursor position after state update
    setTimeout(() => {
      textareaElement.focus();
      const newCursorPos = start + cursorOffset;
      textareaElement.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    }, 0);</parameter>
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
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 bg-[#161b22] border border-[#30363d] rounded-lg p-3 shadow-xl"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {toolbarButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleToolbarAction(button.action)}
                  variant="ghost"
                  size="sm"
                  className="bg-[#0d1117] border border-[#30363d] hover:bg-[#1f2937] hover:border-blue-500/50 text-gray-300 hover:text-blue-400 transition-all duration-200 group relative"
                  title={button.label}
                >
                  <button.icon className="w-4 h-4" />
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
                    <MarkdownPreview content={markdown} />
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
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-4 shadow-xl"
        >
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Words:</span>
              <span className="font-semibold text-blue-400">{calculateStats(markdown).words}</span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Characters:</span>
              <span className="font-semibold text-purple-400">{calculateStats(markdown).characters}</span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Reading Time:</span>
              <span className="font-semibold text-green-400">
                {calculateStats(markdown).readingTime} min
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}