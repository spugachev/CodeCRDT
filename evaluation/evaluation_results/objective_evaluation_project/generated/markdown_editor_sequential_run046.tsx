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

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Ordered lists
    html = html.replace(/^\d+\.\s+(.*)$/gim, '<li class="ordered">$1</li>');
    html = html.replace(/(<li class="ordered">.*<\/li>)/s, '<ol>$1</ol>');

    // Unordered lists
    html = html.replace(/^[-*]\s+(.*)$/gim, '<li class="unordered">$1</li>');
    html = html.replace(/(<li class="unordered">.*<\/li>)/s, '<ul>$1</ul>');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const highlightCode = (code: string, lang: string): string => {
    const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'import', 'export', 'default', 'async', 'await', 'new', 'this', 'extends', 'implements'];
    const types = ['string', 'number', 'boolean', 'void', 'any', 'unknown', 'never', 'User', 'Array'];
    
    let highlighted = code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');

    // Strings
    highlighted = highlighted.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="token-string">$1</span>');

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

    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="token-function">$1</span>(');

    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');

    // Operators
    highlighted = highlighted.replace(/([+\-*/%=<>!&|^~?:])/g, '<span class="token-operator">$1</span>');

    return highlighted;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <style>{`
        .markdown-editor {
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        }

        .markdown-editor textarea {
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          line-height: 1.6;
          tab-size: 2;
        }

        .markdown-editor textarea::selection {
          background: rgba(88, 166, 255, 0.3);
        }

        .preview-content {
          line-height: 1.8;
        }

        .preview-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 1.5rem 0;
          color: #58a6ff;
          border-bottom: 2px solid #30363d;
          padding-bottom: 0.5rem;
        }

        .preview-content h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 1.25rem 0;
          color: #79c0ff;
        }

        .preview-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0;
          color: #a5d6ff;
        }

        .preview-content strong {
          color: #ffa657;
          font-weight: 600;
        }

        .preview-content em {
          color: #ff7b72;
          font-style: italic;
        }

        .preview-content a {
          color: #58a6ff;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
        }

        .preview-content a:hover {
          border-bottom-color: #58a6ff;
        }

        .preview-content blockquote {
          border-left: 4px solid #58a6ff;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #8b949e;
          font-style: italic;
        }

        .preview-content ul, .preview-content ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .preview-content li {
          margin: 0.5rem 0;
          color: #c9d1d9;
        }

        .preview-content img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .inline-code {
          background: #1f2937;
          color: #ff7b72;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
          border: 1px solid #30363d;
        }

        .code-block {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          overflow-x: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          position: relative;
        }

        .code-block::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #58a6ff, #a371f7, #ff7b72);
        }

        .code-block code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #c9d1d9;
        }

        .token-keyword {
          color: #ff7b72;
          font-weight: 600;
        }

        .token-string {
          color: #a5d6ff;
        }

        .token-function {
          color: #d2a8ff;
        }

        .token-comment {
          color: #8b949e;
          font-style: italic;
        }

        .token-number {
          color: #79c0ff;
        }

        .token-operator {
          color: #ff7b72;
        }

        .token-type {
          color: #ffa657;
        }

        .toolbar-button {
          transition: all 0.2s;
        }

        .toolbar-button:hover {
          background: #30363d;
          transform: translateY(-2px);
        }

        .toolbar-button:active {
          transform: translateY(0);
        }

        .floating-toolbar {
          backdrop-filter: blur(12px);
          background: rgba(22, 27, 34, 0.95);
          border: 1px solid #30363d;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .editor-container {
          scrollbar-width: thin;
          scrollbar-color: #30363d #0d1117;
        }

        .editor-container::-webkit-scrollbar {
          width: 8px;
        }

        .editor-container::-webkit-scrollbar-track {
          background: #0d1117;
        }

        .editor-container::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 4px;
        }

        .editor-container::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>

      <div className="border-b border-gray-800 bg-[#161b22] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Premium Markdown Editor
            </h1>
            <p className="text-sm text-gray-400 mt-1">Write with style, preview in real-time</p>
          </div>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-[#238636] hover:bg-[#2ea043] text-white"
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
      </div>

      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 floating-toolbar rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('# ', '')}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('## ', '')}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-700" />
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('**', '**')}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('*', '*')}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('`', '`')}
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-700" />
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('> ', '')}
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('- ', '')}
                title="Unordered List"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('1. ', '')}
                title="Ordered List"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-700" />
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('[', '](url)')}
                title="Link"
              >
                <Link2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="toolbar-button h-9 w-9 p-0"
                onClick={() => insertMarkdown('![alt](', ')')}
                title="Image"
              >
                <Image className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-6">
        <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="markdown-editor">
            <div className="bg-[#161b22] rounded-lg border border-gray-800 overflow-hidden">
              <div className="bg-[#0d1117] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">Editor</span>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                className="w-full h-[calc(100vh-250px)] bg-[#0d1117] text-gray-100 p-6 resize-none focus:outline-none editor-container"
                placeholder="Start writing your markdown..."
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="markdown-editor"
              >
                <div className="bg-[#161b22] rounded-lg border border-gray-800 overflow-hidden">
                  <div className="bg-[#0d1117] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                    <span className="text-sm text-gray-400 font-medium">Preview</span>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <div className="w-3 h-3 rounded-full bg-pink-500" />
                    </div>
                  </div>
                  <motion.div
                    key={markdown}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="preview-content p-6 h-[calc(100vh-250px)] overflow-y-auto editor-container"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-[#161b22] rounded-lg border border-gray-800 p-4"
        >
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-6">
              <span>Lines: {markdown.split('\n').length}</span>
              <span>Words: {markdown.split(/\s+/).filter(Boolean).length}</span>
              <span>Characters: {markdown.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Auto-saved</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}