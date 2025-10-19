import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

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

// Markdown parser utility
const parseMarkdown = (markdown: string): string => {
  let html = markdown;

  // Code blocks with syntax highlighting
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    const highlightedCode = highlightCode(code.trim(), language);
    return `<pre class="code-block"><div class="code-header"><span class="code-lang">${language}</span></div><code class="language-${language}">${highlightedCode}</code></pre>`;
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
  html = html.replace(/^> (.+)/gim, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr />');

  // Unordered lists
  html = html.replace(/^\- (.+)/gim, '<li class="unordered">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)/gim, '<li class="ordered">$1</li>');

  // Wrap list items
  html = html.replace(/(<li class="unordered">.*<\/li>)/s, '<ul>$1</ul>');
  html = html.replace(/(<li class="ordered">.*<\/li>)/s, '<ol>$1</ol>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.match(/^<(h[1-6]|pre|ul|ol|blockquote|hr)/)) {
      return para;
    }
    return para.trim() ? `<p>${para}</p>` : '';
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
    highlighted = highlighted.replace(/\b(function|const|let|var|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new)\b/g, '<span class="keyword">$1</span>');
    // Strings
    highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>');
    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="function">$1</span>(');
    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
  } else if (language === 'python') {
    // Keywords
    highlighted = highlighted.replace(/\b(def|return|if|else|elif|for|while|class|import|from|as|try|except|raise|with|lambda|pass|break|continue)\b/g, '<span class="keyword">$1</span>');
    // Strings
    highlighted = highlighted.replace(/(['"])(.*?)\1/g, '<span class="string">$1$2$1</span>');
    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="function">$1</span>(');
    // Comments
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
  }

  // Numbers
  highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

  return highlighted;
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

// MarkdownPreview Component
function MarkdownPreview({ markdown }: { markdown: string }) {
  const htmlContent = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <div 
      className="markdown-preview prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        // VS Code Dark+ theme colors
        '--color-text': '#d4d4d4',
        '--color-heading': '#569cd6',
        '--color-link': '#3794ff',
        '--color-code-bg': '#1e1e1e',
        '--color-code-border': '#30363d',
        '--color-inline-code-bg': '#2d2d30',
        '--color-inline-code': '#ce9178',
        '--color-blockquote-border': '#58a6ff',
        '--color-blockquote-bg': '#161b22',
        '--color-keyword': '#569cd6',
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

  const handleToolbarAction = useCallback((action: string) => {
    const textareaRef = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textareaRef) return;

    const start = cursorPosition;
    const end = cursorPosition;
    const textBefore = markdown.substring(0, start);
    const textAfter = markdown.substring(end);
    
    const newMarkdown = textBefore + action + textAfter;
    setMarkdown(newMarkdown);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos = start + action.length;
      textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.focus();
      setCursorPosition(newCursorPos);
    }, 0);
  }, [markdown, cursorPosition]);

// Add global styles for markdown preview
  const previewStyles = `
    .markdown-preview h1 {
      font-size: 2em;
      font-weight: 700;
      margin: 1em 0 0.5em 0;
      color: var(--color-heading);
      border-bottom: 1px solid #30363d;
      padding-bottom: 0.3em;
    }
    .markdown-preview h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 1em 0 0.5em 0;
      color: var(--color-heading);
      border-bottom: 1px solid #30363d;
      padding-bottom: 0.3em;
    }
    .markdown-preview h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 1em 0 0.5em 0;
      color: var(--color-heading);
    }
    .markdown-preview p {
      margin: 1em 0;
      line-height: 1.7;
      color: var(--color-text);
    }
    .markdown-preview strong {
      font-weight: 700;
      color: #f0f0f0;
    }
    .markdown-preview em {
      font-style: italic;
      color: #e0e0e0;
    }
    .markdown-preview a {
      color: var(--color-link);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }
    .markdown-preview a:hover {
      border-bottom-color: var(--color-link);
    }
    .markdown-preview code.inline-code {
      background: var(--color-inline-code-bg);
      color: var(--color-inline-code);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }
    .markdown-preview pre.code-block {
      background: var(--color-code-bg);
      border: 1px solid var(--color-code-border);
      border-radius: 6px;
      margin: 1.5em 0;
      overflow: hidden;
    }
    .markdown-preview .code-header {
      background: #161b22;
      padding: 0.5em 1em;
      border-bottom: 1px solid var(--color-code-border);
      font-size: 0.75em;
      color: #8b949e;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .markdown-preview pre.code-block code {
      display: block;
      padding: 1em;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      line-height: 1.6;
      color: #d4d4d4;
    }
    .markdown-preview .keyword {
      color: var(--color-keyword);
      font-weight: 500;
    }
    .markdown-preview .string {
      color: var(--color-string);
    }
    .markdown-preview .function {
      color: var(--color-function);
    }
    .markdown-preview .comment {
      color: var(--color-comment);
      font-style: italic;
    }
    .markdown-preview .number {
      color: var(--color-number);
    }
    .markdown-preview ul {
      list-style: disc;
      padding-left: 2em;
      margin: 1em 0;
    }
    .markdown-preview ol {
      list-style: decimal;
      padding-left: 2em;
      margin: 1em 0;
    }
    .markdown-preview li {
      margin: 0.5em 0;
      line-height: 1.7;
      color: var(--color-text);
    }
    .markdown-preview blockquote {
      border-left: 4px solid var(--color-blockquote-border);
      background: var(--color-blockquote-bg);
      padding: 0.5em 1em;
      margin: 1em 0;
      color: #8b949e;
      font-style: italic;
    }
    .markdown-preview hr {
      border: none;
      border-top: 1px solid #30363d;
      margin: 2em 0;
    }
    .markdown-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 1em 0;
    }
  `;
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="container mx-auto px-4 py-6">
        <style>{previewStyles}</style>
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
                  className="bg-[#0d1117] border border-[#30363d] hover:bg-[#1f2937] hover:border-blue-500/50 text-gray-300 hover:text-blue-400 transition-all duration-200 group relative"
                  title={button.label}
                >
                  <button.icon className="w-4 h-4" />
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-[#1f2937] px-2 py-1 rounded border border-[#30363d] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                    <MarkdownPreview markdown={markdown} />
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
              <span className="font-semibold text-blue-400">
                {markdown.trim().split(/\s+/).filter(word => word.length > 0).length}
              </span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Characters:</span>
              <span className="font-semibold text-purple-400">
                {markdown.length}
              </span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Reading Time:</span>
              <span className="font-semibold text-green-400">
                {Math.ceil(markdown.trim().split(/\s+/).filter(word => word.length > 0).length / 200)} min
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}