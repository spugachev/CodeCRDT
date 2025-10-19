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

const MarkdownPreview = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      className="prose prose-invert prose-slate max-w-none"
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-4xl font-bold mb-4 mt-6 text-blue-400 border-b border-[#30363d] pb-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-3xl font-bold mb-3 mt-5 text-purple-400 border-b border-[#30363d] pb-2" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-2xl font-bold mb-2 mt-4 text-cyan-400" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-xl font-bold mb-2 mt-3 text-green-400" {...props} />
        ),
        h5: ({ node, ...props }) => (
          <h5 className="text-lg font-bold mb-2 mt-3 text-yellow-400" {...props} />
        ),
        h6: ({ node, ...props }) => (
          <h6 className="text-base font-bold mb-2 mt-3 text-pink-400" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-4 leading-7 text-gray-300" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-bold text-orange-400" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-yellow-300" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          return !inline && language ? (
            <div className="my-4 rounded-lg overflow-hidden border border-[#30363d]">
              <div className="bg-[#161b22] px-4 py-2 text-xs text-gray-400 font-mono border-b border-[#30363d]">
                {language}
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: '#0d1117',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                  }
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code
              className="bg-[#161b22] text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono border border-[#30363d]"
              {...props}
            >
              {children}
            </code>
          );
        },
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-7 ml-4" {...props} />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-[#161b22] text-gray-400 italic rounded-r"
            {...props}
          />
        ),
        hr: ({ node, ...props }) => (
          <hr className="my-6 border-[#30363d]" {...props} />
        ),
        img: ({ node, ...props }) => (
          <img
            className="max-w-full h-auto rounded-lg border border-[#30363d] my-4"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-[#30363d]" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-[#161b22]" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="border border-[#30363d] px-4 py-2 text-left font-bold text-gray-300" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="border border-[#30363d] px-4 py-2 text-gray-300" {...props} />
        ),
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
  // Calculate stats
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

  const handleToolbarAction = useCallback((action: string) => {
    const textareaRef = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textareaRef) return;

    const start = cursorPosition;
    const end = cursorPosition;
    const textBefore = markdown.substring(0, start);
    const textAfter = markdown.substring(end);
    
    // Insert the markdown syntax at cursor position
    const newMarkdown = textBefore + action + textAfter;
    setMarkdown(newMarkdown);
    
    // Calculate new cursor position (after inserted text)
    const newCursorPos = start + action.length;
    
    // Update cursor position and focus textarea
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
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
          <div className="flex items-center gap-2 flex-wrap">
            {toolbarButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <Button
                  onClick={() => handleToolbarAction(button.action)}
                  variant="ghost"
                  size="sm"
                  className="relative group bg-[#0d1117] hover:bg-[#1f2937] border border-[#30363d] hover:border-blue-500/50 text-gray-300 hover:text-blue-400 transition-all duration-200"
                  title={button.label}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <button.icon className="w-4 h-4" />
                  </motion.div>
                  
                  {/* Tooltip */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#1f2937] border border-[#30363d] px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  >
                    {button.label}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1f2937] border-l border-t border-[#30363d] rotate-45" />
                  </motion.div>
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
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-4 shadow-lg"
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