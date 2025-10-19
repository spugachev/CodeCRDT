import { useState, useCallback } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const MarkdownPreview = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      className="prose prose-invert max-w-none"
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mb-4 mt-6 text-blue-400 border-b border-gray-700 pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-bold mb-3 mt-5 text-purple-400">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-bold mb-2 mt-4 text-green-400">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-gray-300 leading-relaxed">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-yellow-400">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-pink-400">
            {children}
          </em>
        ),
        code: ({ inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          return !inline && language ? (
            <div className="my-4 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
              <div className="bg-[#2d2d2d] px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase">{language}</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  background: '#1e1e1e',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-[#2d2d2d] text-orange-400 px-2 py-1 rounded text-sm font-mono border border-gray-700">
              {children}
            </code>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="ml-4 text-gray-300">
            {children}
          </li>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-[#2d2d2d] rounded-r text-gray-300 italic">
            {children}
          </blockquote>
        ),
        hr: () => (
          <hr className="my-6 border-gray-700" />
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg border border-gray-700 my-4"
          />
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
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

const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleToolbarAction = useCallback((action: string) => {
    const textareaRef = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);

    let newText = '';
    let newCursorPosition = start;

    // Handle different markdown syntax patterns
    if (action.includes('**text**')) {
      // Bold
      if (selectedText) {
        newText = `${beforeText}**${selectedText}**${afterText}`;
        newCursorPosition = start + selectedText.length + 4;
      } else {
        newText = `${beforeText}**text**${afterText}`;
        newCursorPosition = start + 2;
      }
    } else if (action.includes('*text*')) {
      // Italic
      if (selectedText) {
        newText = `${beforeText}*${selectedText}*${afterText}`;
        newCursorPosition = start + selectedText.length + 2;
      } else {
        newText = `${beforeText}*text*${afterText}`;
        newCursorPosition = start + 1;
      }
    } else if (action.includes('`code`')) {
      // Inline code
      if (selectedText) {
        newText = `${beforeText}\`${selectedText}\`${afterText}`;
        newCursorPosition = start + selectedText.length + 2;
      } else {
        newText = `${beforeText}\`code\`${afterText}`;
        newCursorPosition = start + 1;
      }
    } else if (action.includes('[text](url)')) {
      // Link
      if (selectedText) {
        newText = `${beforeText}[${selectedText}](url)${afterText}`;
        newCursorPosition = start + selectedText.length + 3;
      } else {
        newText = `${beforeText}[text](url)${afterText}`;
        newCursorPosition = start + 1;
      }
    } else if (action.includes('![alt](url)')) {
      // Image
      if (selectedText) {
        newText = `${beforeText}![${selectedText}](url)${afterText}`;
        newCursorPosition = start + selectedText.length + 4;
      } else {
        newText = `${beforeText}![alt](url)${afterText}`;
        newCursorPosition = start + 2;
      }
    } else if (action.includes('- item')) {
      // Bullet list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      newText = `${beforeText}\n- item${afterText}`;
      newCursorPosition = start + 3;
    } else if (action.includes('1. item')) {
      // Numbered list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      newText = `${beforeText}\n1. item${afterText}`;
      newCursorPosition = start + 4;
    } else {
      return;
    }

    setMarkdown(newText);
    setCursorPosition(newCursorPosition);

    // Set cursor position after state update
    setTimeout(() => {
      textareaRef.focus();
      textareaRef.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  }, [markdown, cursorPosition]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Premium Markdown Editor
          </h1>
          <Button
            onClick={togglePreview}
            variant="outline"
            className="bg-[#2d2d2d] border-gray-700 hover:bg-[#3d3d3d] text-gray-100"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-[#2d2d2d] border border-gray-700 rounded-lg p-3 shadow-lg"
        >
          <div className="flex flex-wrap gap-2">
            {toolbarButtons.map((button) => {
              const Icon = button.icon;
              return (
                <motion.div
                  key={button.id}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => handleToolbarAction(button.action)}
                    variant="ghost"
                    size="sm"
                    className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-gray-600 hover:border-blue-500 text-gray-100 transition-all duration-200 group relative"
                    title={button.label}
                  >
                    <Icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 px-2 py-1 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {button.label}
                    </motion.span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <motion.div
            layout
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-[#2d2d2d] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
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
                className="w-full h-[600px] bg-[#1e1e1e] text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Start typing your markdown..."
                spellCheck={false}
              />
            </div>
          </motion.div>

          {/* Preview Panel */}
          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
                  <div className="bg-[#2d2d2d] px-4 py-2 border-b border-gray-800">
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
          transition={{ delay: 0.2 }}
          className="mt-6 bg-[#2d2d2d] border border-gray-800 rounded-lg p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Words</span>
                <span className="text-lg font-semibold text-blue-400">
                  {markdown.trim().split(/\s+/).filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-700"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Characters</span>
                <span className="text-lg font-semibold text-purple-400">
                  {markdown.length}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-700"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Lines</span>
                <span className="text-lg font-semibold text-green-400">
                  {markdown.split('\n').length}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-700"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Reading Time</span>
                <span className="text-lg font-semibold text-orange-400">
                  {Math.ceil(markdown.trim().split(/\s+/).filter(word => word.length > 0).length / 200)} min
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Cursor: {cursorPosition}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}