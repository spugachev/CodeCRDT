import { useState, useCallback } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

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

// Custom components for markdown rendering with VS Code styling
const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    return !inline && language ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="rounded-md my-4 text-sm"
        customStyle={{
          background: '#1e1e1e',
          padding: '1rem',
          border: '1px solid #3d3d3d',
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-[#2d2d2d] text-[#ce9178] px-1.5 py-0.5 rounded text-sm font-mono border border-gray-800"
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: ({ children }: any) => (
    <h1 className="text-4xl font-bold mb-4 mt-6 text-gray-100 border-b border-gray-800 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-3xl font-bold mb-3 mt-5 text-gray-100 border-b border-gray-800 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-2xl font-bold mb-3 mt-4 text-gray-200">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-xl font-bold mb-2 mt-3 text-gray-200">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="text-lg font-bold mb-2 mt-3 text-gray-300">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="text-base font-bold mb-2 mt-2 text-gray-300">
      {children}
    </h6>
  ),
  p: ({ children }: any) => (
    <p className="mb-4 text-gray-300 leading-relaxed">
      {children}
    </p>
  ),
  a: ({ children, href }: any) => (
    <a
      href={href}
      className="text-[#4fc3f7] hover:text-[#81d4fa] underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-4 text-gray-300 space-y-1 ml-4">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-1 ml-4">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-gray-300 leading-relaxed">
      {children}
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-[#4fc3f7] pl-4 py-2 my-4 bg-[#2d2d2d] text-gray-300 italic rounded-r">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-gray-800" />
  ),
  img: ({ src, alt }: any) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg my-4 border border-gray-800"
    />
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-800 rounded-lg">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-[#2d2d2d]">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-gray-800">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="border-b border-gray-800">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2 text-left text-gray-200 font-semibold border border-gray-800">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 text-gray-300 border border-gray-800">
      {children}
    </td>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-gray-100">
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-gray-200">
      {children}
    </em>
  ),
};

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(mockMarkdownContent);
  const [showPreview, setShowPreview] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
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
  const calculateStats = useCallback(() => {
    const charCount = markdown.length;
    const wordCount = markdown.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lineCount = markdown.split('\n').length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
    
    return { charCount, wordCount, lineCount, readingTime };
  }, [markdown]);

  const stats = calculateStats();

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
                  whileHover={{ scale: 1.05, y: -2 }}
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
                className="w-full h-[600px] bg-[#1e1e1e] text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none"
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
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {markdown}
                      </ReactMarkdown>
                    </div>
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
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Characters:</span>
              <span className="font-semibold text-blue-400">{stats.charCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Words:</span>
              <span className="font-semibold text-purple-400">{stats.wordCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Lines:</span>
              <span className="font-semibold text-green-400">{stats.lineCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Reading Time:</span>
              <span className="font-semibold text-orange-400">
                {stats.readingTime} {stats.readingTime === 1 ? 'min' : 'mins'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}