import { useState, useCallback } from 'react';
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

// Custom markdown components with VS Code styling
const MarkdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-4xl font-bold mb-4 mt-6 text-blue-400 border-b border-gray-700 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-3xl font-bold mb-3 mt-5 text-purple-400 border-b border-gray-800 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-2xl font-bold mb-3 mt-4 text-green-400">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-xl font-bold mb-2 mt-3 text-yellow-400">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="text-lg font-bold mb-2 mt-3 text-pink-400">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="text-base font-bold mb-2 mt-3 text-cyan-400">
      {children}
    </h6>
  ),
  p: ({ children }: any) => (
    <p className="mb-4 leading-7 text-gray-300">
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-orange-400">
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-yellow-300">
      {children}
    </em>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="my-4 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
        <div className="bg-[#1e1e1e] px-4 py-2 border-b border-gray-700 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 uppercase">{match[1]}</span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/70"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/70"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/70"></div>
          </div>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
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
      <code className="bg-[#2d2d2d] text-pink-400 px-2 py-1 rounded text-sm font-mono border border-gray-700">
        {children}
      </code>
    );
  },
  ul: ({ children }: any) => (
    <ul className="mb-4 ml-6 space-y-2 list-none">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="mb-4 ml-6 space-y-2 list-none counter-reset-item">
      {children}
    </ol>
  ),
  li: ({ children, ordered }: any) => (
    <li className="relative pl-6 text-gray-300">
      <span className="absolute left-0 text-blue-400 font-bold">
        {ordered ? '•' : '•'}
      </span>
      {children}
    </li>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-yellow-500 bg-yellow-500/10 pl-4 py-2 my-4 italic text-gray-300">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-t-2 border-gray-700" />
  ),
  img: ({ src, alt }: any) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg border border-gray-700 my-4 shadow-lg"
    />
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-700 rounded-lg">
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
    <tbody className="divide-y divide-gray-700">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-[#2d2d2d]/50 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2 text-left text-sm font-semibold text-purple-400 border-b border-gray-700">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 text-sm text-gray-300">
      {children}
    </td>
  ),
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
    } else if (action.includes('- item')) {
      newText = selectedText ? `- ${selectedText}` : '- item';
      cursorOffset = newText.length;
    } else if (action.includes('1. item')) {
      newText = selectedText ? `1. ${selectedText}` : '1. item';
      cursorOffset = newText.length;
    } else if (action.includes('[text](url)')) {
      newText = selectedText ? `[${selectedText}](url)` : '[text](url)';
      cursorOffset = selectedText ? selectedText.length + 3 : 1;
    } else if (action.includes('![alt](url)')) {
      newText = selectedText ? `![${selectedText}](url)` : '![alt](url)';
      cursorOffset = selectedText ? selectedText.length + 4 : 2;
    }

    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);

    // Set cursor position after insertion
    setTimeout(() => {
      textareaElement.focus();
      textareaElement.setSelectionRange(start + cursorOffset, start + cursorOffset);
      setCursorPosition(start + cursorOffset);
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

                {/* Floating Toolbar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-[#2d2d2d] border border-gray-700 rounded-lg p-2 shadow-xl"
        >
          <div className="flex items-center gap-1 flex-wrap">
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
                    className="bg-[#1e1e1e] hover:bg-[#3d3d3d] text-gray-300 hover:text-white border border-transparent hover:border-blue-500/50 transition-all duration-200 group relative"
                    title={button.label}
                  >
                    <Icon className="w-4 h-4" />
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-900 px-2 py-1 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
          transition={{ delay: 0.2 }}
          className="mt-6 bg-[#2d2d2d] border border-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Words</span>
                <span className="text-lg font-semibold text-blue-400">
                  {markdown.trim() ? markdown.trim().split(/\s+/).length : 0}
                </span>
              </div>
              
              <div className="w-px h-8 bg-gray-700"></div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Characters</span>
                <span className="text-lg font-semibold text-purple-400">
                  {markdown.length}
                </span>
              </div>
              
              <div className="w-px h-8 bg-gray-700"></div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Lines</span>
                <span className="text-lg font-semibold text-green-400">
                  {markdown.split('\n').length}
                </span>
              </div>
              
              <div className="w-px h-8 bg-gray-700"></div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Reading Time</span>
                <span className="text-lg font-semibold text-orange-400">
                  {Math.ceil((markdown.trim() ? markdown.trim().split(/\s+/).length : 0) / 200)} min
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