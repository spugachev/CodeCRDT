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

> This is a blockquote with **bold** text

[Link to example](https://example.com)

![Image description](https://via.placeholder.com/400x200)
`);
  
  const [showPreview, setShowPreview] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const highlighted = highlightCode(code.trim(), lang || 'javascript');
      return `<pre class="code-block"><code class="language-${lang || 'javascript'}">${highlighted}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="header-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="header-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="header-1">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="bold-text">$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="italic-text">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="link-text" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="markdown-image" />');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote class="blockquote">$1</blockquote>');

    // Ordered lists
    html = html.replace(/^\d+\.\s(.+)$/gim, '<li class="list-item">$1</li>');
    html = html.replace(/(<li class="list-item">.*<\/li>)/s, '<ol class="ordered-list">$1</ol>');

    // Unordered lists
    html = html.replace(/^[-*]\s(.+)$/gim, '<li class="list-item">$1</li>');
    html = html.replace(/(<li class="list-item">.*<\/li>)/s, (match) => {
      if (!match.includes('<ol')) {
        return `<ul class="unordered-list">${match}</ul>`;
      }
      return match;
    });

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const highlightCode = (code: string, lang: string): string => {
    const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await'];
    const strings = /(".*?"|'.*?'|`.*?`)/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    const numbers = /\b(\d+)\b/g;
    const functions = /\b([a-zA-Z_]\w*)\s*\(/g;

    let highlighted = code;

    // Comments
    highlighted = highlighted.replace(comments, '<span class="token-comment">$1</span>');

    // Strings
    highlighted = highlighted.replace(strings, '<span class="token-string">$1</span>');

    // Keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="token-keyword">${keyword}</span>`);
    });

    // Functions
    highlighted = highlighted.replace(functions, '<span class="token-function">$1</span>(');

    // Numbers
    highlighted = highlighted.replace(numbers, '<span class="token-number">$1</span>');

    return highlighted;
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), label: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), label: 'Italic' },
    { icon: Code, action: () => insertMarkdown('`', '`'), label: 'Code' },
    { icon: Heading1, action: () => insertMarkdown('# ', ''), label: 'H1' },
    { icon: Heading2, action: () => insertMarkdown('## ', ''), label: 'H2' },
    { icon: List, action: () => insertMarkdown('- ', ''), label: 'List' },
    { icon: ListOrdered, action: () => insertMarkdown('1. ', ''), label: 'Ordered List' },
    { icon: Quote, action: () => insertMarkdown('> ', ''), label: 'Quote' },
    { icon: Link2, action: () => insertMarkdown('[', '](url)'), label: 'Link' },
    { icon: Image, action: () => insertMarkdown('![alt](', ')'), label: 'Image' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      {/* Floating Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl px-4 py-3"
          >
            <div className="flex items-center gap-2">
              {toolbarButtons.map((btn, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={btn.action}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-[#238636] hover:text-white transition-all duration-200"
                    title={btn.label}
                  >
                    <btn.icon className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              <div className="w-px h-6 bg-[#30363d] mx-2" />
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 hover:bg-[#238636] hover:text-white transition-all duration-200"
                >
                  {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] bg-clip-text text-transparent">
                Premium Markdown Editor
              </h1>
              <p className="text-sm text-gray-400 mt-1">Write beautiful documentation with live preview</p>
            </div>
            <div className="flex items-center gap-3">
              {toolbarButtons.slice(0, 5).map((btn, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={btn.action}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-[#238636] hover:text-white transition-all duration-200"
                    title={btn.label}
                  >
                    <btn.icon className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              <div className="w-px h-6 bg-[#30363d]" />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-[#238636] hover:text-white transition-all duration-200"
                >
                  {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative"
          >
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-sm text-gray-400 ml-4">editor.md</span>
                </div>
                <div className="text-xs text-gray-500">
                  {markdown.length} characters
                </div>
              </div>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                  className="w-full h-[calc(100vh-280px)] bg-[#0d1117] text-gray-100 p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                  placeholder="Start writing your markdown here..."
                  spellCheck={false}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-600 bg-[#161b22] px-3 py-1 rounded-md border border-[#30363d]">
                  Line {markdown.substring(0, cursorPosition).split('\n').length}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preview */}
          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative"
              >
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl sticky top-24">
                  <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#58a6ff]" />
                      <span className="text-sm text-gray-400">Live Preview</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
                      <span className="text-xs text-gray-500 ml-2">Live</span>
                    </div>
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
        .prose-custom {
          color: #c9d1d9;
          line-height: 1.7;
        }

        .header-1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem 0;
          color: #58a6ff;
          border-bottom: 2px solid #21262d;
          padding-bottom: 0.5rem;
        }

        .header-2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          color: #79c0ff;
        }

        .header-3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #a5d6ff;
        }

        .bold-text {
          font-weight: 700;
          color: #ffa657;
        }

        .italic-text {
          font-style: italic;
          color: #d2a8ff;
        }

        .inline-code {
          background: #161b22;
          color: #ff7b72;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
          border: 1px solid #30363d;
        }

        .code-block {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }

        .code-block code {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
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

        .token-comment {
          color: #8b949e;
          font-style: italic;
        }

        .token-function {
          color: #d2a8ff;
        }

        .token-number {
          color: #79c0ff;
        }

        .link-text {
          color: #58a6ff;
          text-decoration: underline;
          text-decoration-color: #58a6ff40;
          transition: all 0.2s;
        }

        .link-text:hover {
          color: #79c0ff;
          text-decoration-color: #79c0ff;
        }

        .markdown-image {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1rem 0;
          border: 1px solid #30363d;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }

        .blockquote {
          border-left: 4px solid #58a6ff;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #8b949e;
          font-style: italic;
          background: #161b2280;
          padding: 0.75rem 1rem;
          border-radius: 0 0.25rem 0.25rem 0;
        }

        .ordered-list,
        .unordered-list {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .list-item {
          margin: 0.5rem 0;
          color: #c9d1d9;
        }

        .ordered-list .list-item {
          list-style-type: decimal;
        }

        .unordered-list .list-item {
          list-style-type: disc;
        }

        .list-item::marker {
          color: #58a6ff;
        }

        /* Scrollbar styling */
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