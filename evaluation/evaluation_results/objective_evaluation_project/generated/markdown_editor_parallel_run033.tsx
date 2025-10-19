import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
<style jsx global>{`
  .markdown-preview {
    color: #d4d4d4;
    line-height: 1.8;
  }

  .markdown-h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 1.5rem 0 1rem 0;
    background: linear-gradient(to right, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    border-bottom: 2px solid #30363d;
    padding-bottom: 0.5rem;
  }

  .markdown-h2 {
    font-size: 2rem;
    font-weight: 600;
    margin: 1.25rem 0 0.75rem 0;
    color: #60a5fa;
    border-bottom: 1px solid #30363d;
    padding-bottom: 0.4rem;
  }

  .markdown-h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
    color: #a78bfa;
  }

  .markdown-p {
    margin: 0.75rem 0;
    color: #d4d4d4;
  }

  .markdown-bold {
    font-weight: 700;
    color: #fbbf24;
  }

  .markdown-italic {
    font-style: italic;
    color: #60a5fa;
  }

  .inline-code {
    background: #1f2937;
    color: #f472b6;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    border: 1px solid #374151;
  }

  .code-block {
    background: #1e1e1e;
    border: 1px solid #30363d;
    border-radius: 0.5rem;
    margin: 1.5rem 0;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }

  .code-header {
    background: #161b22;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #30363d;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .code-lang {
    font-size: 0.75rem;
    font-weight: 600;
    color: #60a5fa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .code-block code {
    display: block;
    padding: 1.25rem;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.7;
    color: #d4d4d4;
    overflow-x: auto;
    white-space: pre;
  }

  .token-keyword {
    color: var(--color-keyword, #c586c0);
    font-weight: 500;
  }

  .token-string {
    color: var(--color-string, #ce9178);
  }

  .token-function {
    color: var(--color-function, #dcdcaa);
    font-weight: 500;
  }

  .token-comment {
    color: var(--color-comment, #6a9955);
    font-style: italic;
  }

  .token-number {
    color: var(--color-number, #b5cea8);
  }

  .markdown-ul, .markdown-ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  .markdown-li, .markdown-li-ordered {
    margin: 0.5rem 0;
    color: #d4d4d4;
  }

  .markdown-ul .markdown-li {
    list-style-type: disc;
  }

  .markdown-ol .markdown-li-ordered {
    list-style-type: decimal;
  }

  .markdown-link {
    color: #60a5fa;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
  }

  .markdown-link:hover {
    color: #93c5fd;
    border-bottom-color: #60a5fa;
  }

  .markdown-image {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1.5rem 0;
    border: 1px solid #30363d;
  }

  .markdown-blockquote {
    border-left: 4px solid #60a5fa;
    padding: 0.75rem 1.25rem;
    margin: 1.5rem 0;
    background: #1f2937;
    border-radius: 0 0.375rem 0.375rem 0;
    color: #93c5fd;
    font-style: italic;
  }

  .markdown-hr {
    border: none;
    border-top: 2px solid #30363d;
    margin: 2rem 0;
  }
`}</style>

// Markdown parser utility
const parseMarkdown = (text: string): string => {
  let html = text;

  // Code blocks with syntax highlighting
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    const highlightedCode = highlightCode(code.trim(), language);
    return `<pre class="code-block"><div class="code-header"><span class="code-lang">${language}</span></div><code class="language-${language}">${highlightedCode}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="markdown-bold">$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em class="markdown-italic">$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="markdown-image" />');

  // Blockquotes
  html = html.replace(/^> (.+)/gim, '<blockquote class="markdown-blockquote">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="markdown-hr" />');

  // Unordered lists
  html = html.replace(/^\- (.+)/gim, '<li class="markdown-li">$1</li>');
  html = html.replace(/(<li class="markdown-li">.*<\/li>)/s, '<ul class="markdown-ul">$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)/gim, '<li class="markdown-li-ordered">$1</li>');
  html = html.replace(/(<li class="markdown-li-ordered">.*<\/li>)/s, '<ol class="markdown-ol">$1</ol>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (!para.match(/^<(h[1-3]|pre|ul|ol|blockquote|hr)/)) {
      return `<p class="markdown-p">${para}</p>`;
    }
    return para;
  }).join('\n');

  return html;
};

// Syntax highlighter for code blocks
const highlightCode = (code: string, language: string): string => {
  const escapeHtml = (str: string) => 
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;');

  let highlighted = escapeHtml(code);

  if (language === 'javascript' || language === 'typescript') {
    // Keywords
    highlighted = highlighted.replace(/\b(function|const|let|var|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new)\b/g, '<span class="token-keyword">$1</span>');
    
    // Strings
    highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="token-string">$1$2$1</span>');
    
    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="token-function">$1</span>(');
    
    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
  } else if (language === 'python') {
    // Keywords
    highlighted = highlighted.replace(/\b(def|class|return|if|else|elif|for|while|import|from|as|try|except|with|lambda|pass|break|continue)\b/g, '<span class="token-keyword">$1</span>');
    
    // Strings
    highlighted = highlighted.replace(/(['"])(.*?)\1/g, '<span class="token-string">$1$2$1</span>');
    
    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="token-function">$1</span>(');
    
    // Comments
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="token-comment">$1</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
  }

  return highlighted;
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

// MarkdownPreview Component
function MarkdownPreview({ content }: { content: string }) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div 
      className="markdown-preview prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        '--color-keyword': '#c586c0',
        '--color-string': '#ce9178',
        '--color-function': '#dcdcaa',
        '--color-comment': '#6a9955',
        '--color-number': '#b5cea8',
      } as React.CSSProperties}
    />
  );
}

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

  const calculateStats = useCallback(() => {
    const words = markdown.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = markdown.length;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute
    
    return { words, characters, readingTime };
  }, [markdown]);

  const stats = calculateStats();

  const handleToolbarAction = useCallback((action: string) => {
    const textareaElement = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textareaElement) return;

    const start = cursorPosition;
    const end = cursorPosition;
    const textBefore = markdown.substring(0, start);
    const textAfter = markdown.substring(end);
    
    const newMarkdown = textBefore + action + textAfter;
    setMarkdown(newMarkdown);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos = start + action.length;
      textareaElement.focus();
      textareaElement.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
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
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-4"
        >
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Words:</span>
              <span className="font-semibold text-blue-400">{stats.words}</span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Characters:</span>
              <span className="font-semibold text-purple-400">{stats.characters}</span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Reading Time:</span>
              <span className="font-semibold text-green-400">{stats.readingTime} min</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}