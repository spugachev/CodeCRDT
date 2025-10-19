import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link2, Image, Eye, EyeOff, Heading1, Heading2, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Welcome to Premium Markdown Editor

## Features
- **Bold** and *italic* text
- \`Inline code\` with syntax highlighting
- Code blocks with VS Code styling
- Live preview with smooth transitions

### Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

const user = "Developer";
greet(user);
\`\`\`

### More Examples

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
];
\`\`\`

> This is a blockquote with **bold** text

1. First ordered item
2. Second ordered item
3. Third ordered item

- Unordered list item
- Another item
- And another

[Link to example](https://example.com)

![Image alt text](https://via.placeholder.com/400x200)
`);
  const [showPreview, setShowPreview] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (textareaRef.current && textareaRef.current.scrollTop > 50) {
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    };

    const textarea = textareaRef.current;
    textarea?.addEventListener('scroll', handleScroll);
    return () => textarea?.removeEventListener('scroll', handleScroll);
  }, []);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    
    setMarkdown(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const parseMarkdown = (text: string): string => {
    let html = text;

    // Code blocks with syntax highlighting
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const highlighted = highlightCode(code.trim(), lang || 'javascript');
      return `<pre class="code-block"><code class="language-${lang || 'javascript'}">${highlighted}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Ordered lists
    html = html.replace(/^\d+\.\s(.+)$/gim, '<li class="ordered">$1</li>');
    html = html.replace(/(<li class="ordered">.*<\/li>)/s, '<ol>$1</ol>');

    // Unordered lists
    html = html.replace(/^[-*]\s(.+)$/gim, '<li class="unordered">$1</li>');
    html = html.replace(/(<li class="unordered">.*<\/li>)/s, '<ul>$1</ul>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const highlightCode = (code: string, lang: string): string => {
    const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'import', 'export', 'default', 'async', 'await', 'new', 'this', 'extends', 'implements'];
    const types = ['string', 'number', 'boolean', 'void', 'any', 'unknown', 'never', 'User', 'Array'];
    const builtins = ['console', 'log', 'document', 'window', 'Math', 'Date', 'Object', 'Array'];

    let highlighted = code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');

    // Strings
    highlighted = highlighted.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="token-string">$1</span>');

    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');

    // Keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="token-keyword">$1</span>');
    });

    // Types
    types.forEach(type => {
      const regex = new RegExp(`\\b(${type})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="token-type">$1</span>');
    });

    // Built-ins
    builtins.forEach(builtin => {
      const regex = new RegExp(`\\b(${builtin})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="token-builtin">$1</span>');
    });

    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="token-function">$1</span>(');

    return highlighted;
  };

  const toolbarButtons = [
    { icon: Heading1, action: () => insertMarkdown('# ', ''), label: 'Heading 1' },
    { icon: Heading2, action: () => insertMarkdown('## ', ''), label: 'Heading 2' },
    { icon: Bold, action: () => insertMarkdown('**', '**'), label: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), label: 'Italic' },
    { icon: Code, action: () => insertMarkdown('`', '`'), label: 'Inline Code' },
    { icon: Quote, action: () => insertMarkdown('> ', ''), label: 'Quote' },
    { icon: List, action: () => insertMarkdown('- ', ''), label: 'Bullet List' },
    { icon: ListOrdered, action: () => insertMarkdown('1. ', ''), label: 'Numbered List' },
    { icon: Link2, action: () => insertMarkdown('[', '](url)'), label: 'Link' },
    { icon: Image, action: () => insertMarkdown('![alt](', ')'), label: 'Image' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="border-b border-gray-800 bg-[#161b22] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Premium Markdown Editor
            </h1>
            <p className="text-sm text-gray-400 mt-1">Write beautiful documentation with live preview</p>
          </div>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {showToolbar && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1c2128] border border-gray-700 rounded-lg shadow-2xl p-2 flex gap-1"
            >
              {toolbarButtons.map((btn, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.1, backgroundColor: '#2d333b' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={btn.action}
                  className="p-2 rounded hover:bg-gray-700 transition-colors group relative"
                  title={btn.label}
                >
                  <btn.icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {btn.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
              <div className="bg-[#1c2128] border-b border-gray-800 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Editor</span>
                <div className="flex gap-2">
                  {toolbarButtons.slice(0, 5).map((btn, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={btn.action}
                      className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                      title={btn.label}
                    >
                      <btn.icon className="w-3.5 h-3.5 text-gray-400 hover:text-blue-400" />
                    </motion.button>
                  ))}
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                className="w-full h-[calc(100vh-280px)] bg-[#0d1117] text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                placeholder="Start writing your markdown here..."
                spellCheck={false}
              />
              <div className="bg-[#1c2128] border-t border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                <span>{markdown.length} characters</span>
                <span>{markdown.split('\n').length} lines</span>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-[#1c2128] border-b border-gray-800 px-4 py-2">
                    <span className="text-sm font-medium text-gray-300">Live Preview</span>
                  </div>
                  <motion.div
                    key={markdown}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 h-[calc(100vh-280px)] overflow-y-auto prose-custom"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .prose-custom h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .prose-custom h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem;
          color: #58a6ff;
          border-bottom: 2px solid #21262d;
          padding-bottom: 0.5rem;
        }

        .prose-custom h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
          color: #79c0ff;
        }

        .prose-custom strong {
          color: #ffa657;
          font-weight: 600;
        }

        .prose-custom em {
          color: #a5d6ff;
          font-style: italic;
        }

        .prose-custom code.inline-code {
          background: #1c2128;
          color: #ff7b72;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          border: 1px solid #30363d;
        }

        .prose-custom pre.code-block {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 0.5rem;
          padding: 1.25rem;
          margin: 1.5rem 0;
          overflow-x: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }

        .prose-custom pre.code-block code {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #c9d1d9;
          display: block;
        }

        .prose-custom .token-keyword {
          color: #ff7b72;
          font-weight: 600;
        }

        .prose-custom .token-string {
          color: #a5d6ff;
        }

        .prose-custom .token-number {
          color: #79c0ff;
        }

        .prose-custom .token-function {
          color: #d2a8ff;
          font-weight: 500;
        }

        .prose-custom .token-comment {
          color: #8b949e;
          font-style: italic;
        }

        .prose-custom .token-type {
          color: #ffa657;
          font-weight: 500;
        }

        .prose-custom .token-builtin {
          color: #79c0ff;
        }

        .prose-custom blockquote {
          border-left: 4px solid #58a6ff;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #8b949e;
          font-style: italic;
          background: #0d1117;
          padding: 1rem;
          border-radius: 0.25rem;
        }

        .prose-custom ul, .prose-custom ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .prose-custom li {
          margin: 0.5rem 0;
          color: #c9d1d9;
          line-height: 1.6;
        }

        .prose-custom li.ordered {
          list-style-type: decimal;
        }

        .prose-custom li.unordered {
          list-style-type: disc;
        }

        .prose-custom a {
          color: #58a6ff;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
        }

        .prose-custom a:hover {
          border-bottom-color: #58a6ff;
          color: #79c0ff;
        }

        .prose-custom img {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          border: 1px solid #30363d;
        }

        .prose-custom br {
          display: block;
          content: "";
          margin: 0.5rem 0;
        }

        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #0d1117;
        }

        ::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
}