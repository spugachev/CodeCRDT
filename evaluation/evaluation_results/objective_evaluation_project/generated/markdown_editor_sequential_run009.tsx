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

### Lists
1. First item
2. Second item
3. Third item

- Bullet point
- Another point
  - Nested item

> This is a blockquote with **bold** text and *italic* text.

[Link to example](https://example.com)

![Image description](https://via.placeholder.com/400x200)
`);
  
  const [showPreview, setShowPreview] = useState(true);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const rect = textarea.getBoundingClientRect();
      const lineHeight = 24;
      const lines = textarea.value.substring(0, start).split('\n').length;
      
      setToolbarPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top + (lines * lineHeight) - 60
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

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
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const parseMarkdown = (text: string): string => {
    let html = text;

    // Code blocks with syntax highlighting
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
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

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

    // Ordered lists
    html = html.replace(/^\d+\.\s(.+)$/gim, '<li class="ordered">$1</li>');
    html = html.replace(/(<li class="ordered">.*<\/li>)/s, '<ol>$1</ol>');

    // Unordered lists
    html = html.replace(/^[-*]\s(.+)$/gim, '<li class="unordered">$1</li>');
    html = html.replace(/(<li class="unordered">.*<\/li>)/s, '<ul>$1</ul>');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const highlightCode = (code: string, lang: string): string => {
    const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await'];
    const strings = /(".*?"|'.*?'|`.*?`)/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    const numbers = /\b(\d+)\b/g;

    let highlighted = code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Comments
    highlighted = highlighted.replace(comments, '<span class="token-comment">$1</span>');

    // Strings
    highlighted = highlighted.replace(strings, '<span class="token-string">$1</span>');

    // Keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="token-keyword">$1</span>');
    });

    // Numbers
    highlighted = highlighted.replace(numbers, '<span class="token-number">$1</span>');

    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="token-function">$1</span>(');

    return highlighted;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Premium Markdown Editor
            </h1>
            <p className="text-gray-400 mt-2">Write with style, preview in real-time</p>
          </div>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-[#21262d] hover:bg-[#30363d] text-gray-100 border border-[#30363d]"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="relative" ref={editorRef}>
            <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden shadow-2xl">
              <div className="bg-[#0d1117] px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm text-gray-400">editor.md</span>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onSelect={handleSelection}
                onBlur={() => setTimeout(() => setShowToolbar(false), 200)}
                className="w-full h-[600px] bg-[#0d1117] text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                placeholder="Start writing your markdown..."
                style={{
                  caretColor: '#58a6ff',
                }}
              />
            </div>

            {/* Floating Toolbar */}
            <AnimatePresence>
              {showToolbar && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed z-50 bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl p-2 flex items-center gap-1"
                  style={{
                    left: `${toolbarPosition.x}px`,
                    top: `${toolbarPosition.y}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => insertMarkdown('**', '**')} />
                  <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => insertMarkdown('*', '*')} />
                  <ToolbarButton icon={<Code className="w-4 h-4" />} onClick={() => insertMarkdown('`', '`')} />
                  <div className="w-px h-6 bg-[#30363d] mx-1"></div>
                  <ToolbarButton icon={<Heading1 className="w-4 h-4" />} onClick={() => insertMarkdown('# ')} />
                  <ToolbarButton icon={<Heading2 className="w-4 h-4" />} onClick={() => insertMarkdown('## ')} />
                  <div className="w-px h-6 bg-[#30363d] mx-1"></div>
                  <ToolbarButton icon={<List className="w-4 h-4" />} onClick={() => insertMarkdown('- ')} />
                  <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={() => insertMarkdown('1. ')} />
                  <ToolbarButton icon={<Quote className="w-4 h-4" />} onClick={() => insertMarkdown('> ')} />
                  <div className="w-px h-6 bg-[#30363d] mx-1"></div>
                  <ToolbarButton icon={<Link2 className="w-4 h-4" />} onClick={() => insertMarkdown('[', '](url)')} />
                  <ToolbarButton icon={<Image className="w-4 h-4" />} onClick={() => insertMarkdown('![alt](', ')')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preview */}
          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden shadow-2xl"
              >
                <div className="bg-[#0d1117] px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
                  <span className="text-sm text-gray-400">Preview</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-gray-500">Live</span>
                  </div>
                </div>
                <motion.div
                  key={markdown}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 h-[600px] overflow-y-auto markdown-preview"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .markdown-preview h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #58a6ff;
          border-bottom: 2px solid #30363d;
          padding-bottom: 0.5rem;
        }

        .markdown-preview h2 {
          font-size: 2rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #79c0ff;
          border-bottom: 1px solid #30363d;
          padding-bottom: 0.5rem;
        }

        .markdown-preview h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #a5d6ff;
        }

        .markdown-preview strong {
          color: #ffa657;
          font-weight: 600;
        }

        .markdown-preview em {
          color: #ff7b72;
          font-style: italic;
        }

        .markdown-preview a {
          color: #58a6ff;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .markdown-preview a:hover {
          color: #79c0ff;
        }

        .markdown-preview img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem 0;
          border: 1px solid #30363d;
        }

        .markdown-preview blockquote {
          border-left: 4px solid #58a6ff;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #8b949e;
          font-style: italic;
          background: #0d1117;
          padding: 1rem;
          border-radius: 4px;
        }

        .markdown-preview ul {
          list-style: none;
          margin: 1rem 0;
          padding-left: 0;
        }

        .markdown-preview ul li {
          position: relative;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
          color: #c9d1d9;
        }

        .markdown-preview ul li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #58a6ff;
          font-weight: bold;
        }

        .markdown-preview ol {
          list-style: none;
          counter-reset: item;
          margin: 1rem 0;
          padding-left: 0;
        }

        .markdown-preview ol li {
          position: relative;
          padding-left: 2rem;
          margin: 0.5rem 0;
          counter-increment: item;
          color: #c9d1d9;
        }

        .markdown-preview ol li::before {
          content: counter(item) ".";
          position: absolute;
          left: 0;
          color: #58a6ff;
          font-weight: bold;
        }

        .markdown-preview .inline-code {
          background: #1f2937;
          color: #ff7b72;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          border: 1px solid #30363d;
        }

        .markdown-preview .code-block {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          overflow-x: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .markdown-preview .code-block code {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #c9d1d9;
          display: block;
        }

        .markdown-preview .token-keyword {
          color: #ff7b72;
          font-weight: 600;
        }

        .markdown-preview .token-string {
          color: #a5d6ff;
        }

        .markdown-preview .token-comment {
          color: #8b949e;
          font-style: italic;
        }

        .markdown-preview .token-number {
          color: #79c0ff;
        }

        .markdown-preview .token-function {
          color: #d2a8ff;
          font-weight: 500;
        }

        .markdown-preview br {
          display: block;
          content: "";
          margin: 0.5rem 0;
        }

        .markdown-preview p {
          margin: 1rem 0;
          line-height: 1.7;
          color: #c9d1d9;
        }

        /* Scrollbar styling */
        .markdown-preview::-webkit-scrollbar,
        textarea::-webkit-scrollbar {
          width: 8px;
        }

        .markdown-preview::-webkit-scrollbar-track,
        textarea::-webkit-scrollbar-track {
          background: #0d1117;
        }

        .markdown-preview::-webkit-scrollbar-thumb,
        textarea::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 4px;
        }

        .markdown-preview::-webkit-scrollbar-thumb:hover,
        textarea::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: '#30363d' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-2 rounded hover:bg-[#30363d] text-gray-400 hover:text-gray-100 transition-colors"
    >
      {icon}
    </motion.button>
  );
}