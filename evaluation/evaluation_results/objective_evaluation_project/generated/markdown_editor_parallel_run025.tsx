import { useState, useCallback } from 'react';
import { useRef } from 'react';
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

// Custom markdown components with VS Code styling
const MarkdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-4xl font-bold mb-4 mt-6 pb-2 border-b border-[#30363d] text-gray-100">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-3xl font-bold mb-3 mt-5 pb-2 border-b border-[#30363d] text-gray-100">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-2xl font-bold mb-3 mt-4 text-gray-100">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-xl font-bold mb-2 mt-3 text-gray-100">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="text-lg font-bold mb-2 mt-3 text-gray-100">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="text-base font-bold mb-2 mt-3 text-gray-300">
      {children}
    </h6>
  ),
  p: ({ children }: any) => (
    <p className="mb-4 text-gray-300 leading-7">
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-blue-400">
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-purple-400">
      {children}
    </em>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    return !inline && language ? (
      <div className="my-4 rounded-lg overflow-hidden border border-[#30363d] shadow-lg">
        <div className="bg-[#1e1e1e] px-4 py-2 border-b border-[#30363d] flex items-center justify-between">
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
            lineHeight: '1.5',
          }}
          codeTagProps={{
            style: {
              fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
            }
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-[#1e1e1e] text-pink-400 px-2 py-1 rounded text-sm font-mono border border-[#30363d]" {...props}>
        {children}
      </code>
    );
  },
  ul: ({ children }: any) => (
    <ul className="mb-4 ml-6 list-disc text-gray-300 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="mb-4 ml-6 list-decimal text-gray-300 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-7">
      {children}
    </li>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-[#161b22] pl-4 py-2 my-4 italic text-gray-400">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-t border-[#30363d]" />
  ),
  img: ({ src, alt }: any) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg border border-[#30363d] my-4 shadow-lg"
    />
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-[#30363d] rounded-lg">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-[#161b22]">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-[#30363d]">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="border-b border-[#30363d]">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2 text-left text-gray-300 font-semibold border-r border-[#30363d] last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 text-gray-400 border-r border-[#30363d] last:border-r-0">
      {children}
    </td>
  ),
};

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
    
    // Update cursor position
    const newCursorPos = start + cursorOffset;
    setCursorPosition(newCursorPos);
    
    // Focus and set cursor position in textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
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
          <div className="flex flex-wrap gap-2 items-center justify-center">
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
                    <ReactMarkdown
                      components={MarkdownComponents}
                      className="prose prose-invert max-w-none"
                    >
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