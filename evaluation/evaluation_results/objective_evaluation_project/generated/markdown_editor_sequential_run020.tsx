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
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Ordered lists
    html = html.replace(/^\d+\.\s+(.*)$/gim, '<li class="ordered">$1</li>');
    html = html.replace(/(<li class="ordered">.*<\/li>)/s, '<ol>$1</ol>');

    // Unordered lists
    html = html.replace(/^[-*]\s+(.*)$/gim, '<li class="unordered">$1</li>');
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
    const builtins = ['console', 'log', 'document', 'window', 'Math', 'Date', 'Object', 'Array', 'String', 'Number'];

    let highlighted = code;

    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');

    // Strings
    highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="token-string">$1</span>');

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
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="token-function">$1</span>(');

    return highlighted;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Premium Markdown Editor
            </h1>
            <p className="text-gray-400 mt-1">Write beautiful markdown with live preview</p>
          </div>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-[#21262d] hover:bg-[#30363d] text-gray-100 border border-[#30363d]"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="relative">
            <AnimatePresence>
              {showToolbar && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 left-4 right-4 z-10 bg-[#161b22] border border-[#30363d] rounded-lg p-2 flex items-center gap-1 shadow-2xl"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('**', '**')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-blue-400 transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('*', '*')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-purple-400 transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('`', '`')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-green-400 transition-colors"
                    title="Inline Code"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-[#30363d] mx-1" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('# ', '')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-yellow-400 transition-colors"
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('## ', '')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-yellow-400 transition-colors"
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('> ', '')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-orange-400 transition-colors"
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-[#30363d] mx-1" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('- ', '')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-cyan-400 transition-colors"
                    title="Unordered List"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('1. ', '')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-cyan-400 transition-colors"
                    title="Ordered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('[', '](url)')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-pink-400 transition-colors"
                    title="Link"
                  >
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown('![alt](', ')')}
                    className="hover:bg-[#21262d] text-gray-300 hover:text-pink-400 transition-colors"
                    title="Image"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-sm text-gray-400 ml-4">editor.md</span>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-[calc(100vh-280px)] bg-[#0d1117] text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                placeholder="Start writing your markdown..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview */}
          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-2xl"
              >
                <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-sm text-gray-400 ml-4">preview.html</span>
                </div>
                <div
                  className="p-6 h-[calc(100vh-280px)] overflow-y-auto prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .prose h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          background: linear-gradient(to right, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .prose h2 {
          font-size: 2rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #60a5fa;
        }

        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #a78bfa;
        }

        .prose strong {
          color: #fbbf24;
          font-weight: 600;
        }

        .prose em {
          color: #f472b6;
          font-style: italic;
        }

        .prose a {
          color: #60a5fa;
          text-decoration: none;
          border-bottom: 1px solid #60a5fa;
          transition: all 0.2s;
        }

        .prose a:hover {
          color: #93c5fd;
          border-bottom-color: #93c5fd;
        }

        .prose blockquote {
          border-left: 4px solid #a78bfa;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #9ca3af;
          font-style: italic;
          background: #161b22;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .prose ul {
          list-style: none;
          padding-left: 0;
          margin: 1rem 0;
        }

        .prose ul li {
          position: relative;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .prose ul li::before {
          content: "→";
          position: absolute;
          left: 0;
          color: #34d399;
          font-weight: bold;
        }

        .prose ol {
          list-style: none;
          counter-reset: item;
          padding-left: 0;
          margin: 1rem 0;
        }

        .prose ol li {
          position: relative;
          padding-left: 2rem;
          margin: 0.5rem 0;
          counter-increment: item;
        }

        .prose ol li::before {
          content: counter(item) ".";
          position: absolute;
          left: 0;
          color: #60a5fa;
          font-weight: bold;
        }

        .prose img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          border: 1px solid #30363d;
          max-width: 100%;
        }

        .inline-code {
          background: #161b22;
          color: #f472b6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          border: 1px solid #30363d;
        }

        .code-block {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
          overflow-x: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }

        .code-block code {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #e6edf3;
        }

        .token-keyword {
          color: #ff7b72;
          font-weight: 600;
        }

        .token-string {
          color: #a5d6ff;
        }

        .token-number {
          color: #79c0ff;
        }

        .token-comment {
          color: #8b949e;
          font-style: italic;
        }

        .token-function {
          color: #d2a8ff;
          font-weight: 500;
        }

        .token-type {
          color: #ffa657;
        }

        .token-builtin {
          color: #79c0ff;
        }

        .prose br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #0d1117;
        }

        ::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 6px;
          border: 2px solid #0d1117;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
}