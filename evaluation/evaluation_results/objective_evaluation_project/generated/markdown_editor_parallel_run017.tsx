import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface MarkdownComponents {
  code?: any;
  h1?: any;
  h2?: any;
  h3?: any;
  p?: any;
  ul?: any;
  ol?: any;
  li?: any;
  blockquote?: any;
  a?: any;
  img?: any;
  hr?: any;
  strong?: any;
  em?: any;
}

const markdownComponents: MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="rounded-md my-4 text-sm"
        customStyle={{
          background: '#1e1e1e',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #30363d',
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-[#1e1e1e] text-[#d4d4d4] px-2 py-1 rounded text-sm font-mono border border-[#30363d]"
        {...props}
      >
        {children}
      </code>
    );
  },
  h1({ children }: any) {
    return (
      <h1 className="text-4xl font-bold mb-4 mt-6 text-gray-100 border-b border-[#30363d] pb-2">
        {children}
      </h1>
    );
  },
  h2({ children }: any) {
    return (
      <h2 className="text-3xl font-bold mb-3 mt-5 text-gray-100 border-b border-[#30363d] pb-2">
        {children}
      </h2>
    );
  },
  h3({ children }: any) {
    return (
      <h3 className="text-2xl font-semibold mb-3 mt-4 text-gray-200">
        {children}
      </h3>
    );
  },
  p({ children }: any) {
    return <p className="mb-4 text-gray-300 leading-7">{children}</p>;
  },
  ul({ children }: any) {
    return <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">{children}</ul>;
  },
  ol({ children }: any) {
    return <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">{children}</ol>;
  },
  li({ children }: any) {
    return <li className="ml-4 text-gray-300">{children}</li>;
  },
  blockquote({ children }: any) {
    return (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-[#161b22] text-gray-300 italic">
        {children}
      </blockquote>
    );
  },
  a({ href, children }: any) {
    return (
      <a
        href={href}
        className="text-blue-400 hover:text-blue-300 underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  img({ src, alt }: any) {
    return (
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg border border-[#30363d] my-4"
      />
    );
  },
  hr() {
    return <hr className="my-6 border-[#30363d]" />;
  },
  strong({ children }: any) {
    return <strong className="font-bold text-gray-100">{children}</strong>;
  },
  em({ children }: any) {
    return <em className="italic text-gray-200">{children}</em>;
  },
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

  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCursorPosition(e.target.selectionStart);
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  // Calculate stats
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

  const handleToolbarAction = useCallback((action: string) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;
    
    // Handle different markdown syntax insertions
    if (action.includes('**text**')) {
      // Bold
      newText = selectedText ? `**${selectedText}**` : '**text**';
      cursorOffset = selectedText ? newText.length : 2;
    } else if (action.includes('*text*')) {
      // Italic
      newText = selectedText ? `*${selectedText}*` : '*text*';
      cursorOffset = selectedText ? newText.length : 1;
    } else if (action.includes('`code`')) {
      // Inline code
      newText = selectedText ? `\`${selectedText}\`` : '`code`';
      cursorOffset = selectedText ? newText.length : 1;
    } else if (action.includes('[text](url)')) {
      // Link
      newText = selectedText ? `[${selectedText}](url)` : '[text](url)';
      cursorOffset = selectedText ? selectedText.length + 3 : 1;
    } else if (action.includes('![alt](url)')) {
      // Image
      newText = selectedText ? `![${selectedText}](url)` : '![alt](url)';
      cursorOffset = selectedText ? selectedText.length + 4 : 2;
    } else if (action.includes('- item')) {
      // Bullet list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const isNewLine = start === lineStart || start === 0;
      newText = isNewLine ? '- ' : '\n- ';
      cursorOffset = newText.length;
    } else if (action.includes('1. item')) {
      // Numbered list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const isNewLine = start === lineStart || start === 0;
      newText = isNewLine ? '1. ' : '\n1. ';
      cursorOffset = newText.length;
    }
    
    // Insert the new text
    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + cursorOffset;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
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
          transition={{ duration: 0.5 }}
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
                  className="bg-[#0d1117] border border-[#30363d] hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-400/50 text-gray-300 hover:text-white transition-all duration-300 group relative"
                  title={button.label}
                >
                  <button.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors duration-300" />
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-[#1f2937] px-2 py-1 rounded border border-[#30363d] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                    <ReactMarkdown components={markdownComponents}>
                      {markdown}
                    </ReactMarkdown>
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
          transition={{ delay: 0.2, duration: 0.3 }}
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
              <span className="font-semibold text-green-400">{readingTime} min</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}