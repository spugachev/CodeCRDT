import { useState, useCallback } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Markdown parser and renderer
const parseMarkdown = (text: string): string => {
  let html = text;

  // Code blocks with language detection
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    const highlighted = highlightCode(code.trim(), language);
    return `<pre class="code-block" data-language="${language}"><code>${highlighted}</code></pre>`;
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

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr />');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.*)$/gim, '<li class="ordered-list-item">$1</li>');

  // Unordered lists
  html = html.replace(/^-\s+(.*)$/gim, '<li class="unordered-list-item">$1</li>');

  // Wrap consecutive list items
  html = html.replace(/(<li class="ordered-list-item">.*<\/li>\n?)+/g, '<ol>$&</ol>');
  html = html.replace(/(<li class="unordered-list-item">.*<\/li>\n?)+/g, '<ul>$&</ul>');

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
    highlighted = highlighted.replace(/\b(function|const|let|var|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new|this|typeof|instanceof)\b/g, 
      '<span class="token-keyword">$1</span>');
    
    // Strings
    highlighted = highlighted.replace(/([`'"])(?:(?=(\\?))\2.)*?\1/g, 
      '<span class="token-string">$&</span>');
    
    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, 
      '<span class="token-function">$1</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, 
      '<span class="token-number">$1</span>');
    
    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, 
      '<span class="token-comment">$1</span>');
  } else if (language === 'python') {
    // Keywords
    highlighted = highlighted.replace(/\b(def|class|return|if|else|elif|for|while|import|from|as|try|except|raise|with|lambda|pass|break|continue|True|False|None)\b/g, 
      '<span class="token-keyword">$1</span>');
    
    // Strings
    highlighted = highlighted.replace(/([`'"])(?:(?=(\\?))\2.)*?\1/g, 
      '<span class="token-string">$&</span>');
    
    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, 
      '<span class="token-function">$1</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, 
      '<span class="token-number">$1</span>');
    
    // Comments
    highlighted = highlighted.replace(/(#.*$)/gm, 
      '<span class="token-comment">$1</span>');
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

// MarkdownPreview component with VS Code styling
const MarkdownPreview = ({ content }: { content: string }) => {
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div 
      className="markdown-preview prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        '--tw-prose-body': '#c9d1d9',
        '--tw-prose-headings': '#58a6ff',
        '--tw-prose-links': '#58a6ff',
        '--tw-prose-bold': '#c9d1d9',
        '--tw-prose-code': '#ff7b72',
        '--tw-prose-quotes': '#8b949e',
      } as React.CSSProperties}
    />
  );
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
    } else if (action.includes('- item')) {
      // Bullet list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const isNewLine = start === lineStart;
      newText = isNewLine ? '- item' : '\n- item';
      cursorOffset = newText.length;
    } else if (action.includes('1. item')) {
      // Numbered list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const isNewLine = start === lineStart;
      newText = isNewLine ? '1. item' : '\n1. item';
      cursorOffset = newText.length;
    } else if (action.includes('[text](url)')) {
      // Link
      newText = selectedText ? `[${selectedText}](url)` : '[text](url)';
      cursorOffset = selectedText ? newText.length - 4 : 1;
    } else if (action.includes('![alt](url)')) {
      // Image
      newText = selectedText ? `![${selectedText}](url)` : '![alt](url)';
      cursorOffset = selectedText ? newText.length - 4 : 2;
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

// Add global styles for markdown preview
  const previewStyles = `
    .markdown-preview h1 {
      font-size: 2em;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 16px;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #21262d;
      color: #58a6ff;
    }
    .markdown-preview h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 16px;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #21262d;
      color: #58a6ff;
    }
    .markdown-preview h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 16px;
      color: #58a6ff;
    }
    .markdown-preview p {
      margin-top: 0;
      margin-bottom: 16px;
      color: #c9d1d9;
      line-height: 1.6;
    }
    .markdown-preview strong {
      font-weight: 600;
      color: #c9d1d9;
    }
    .markdown-preview em {
      font-style: italic;
      color: #c9d1d9;
    }
    .markdown-preview a {
      color: #58a6ff;
      text-decoration: none;
      transition: color 0.2s;
    }
    .markdown-preview a:hover {
      color: #79c0ff;
      text-decoration: underline;
    }
    .markdown-preview code.inline-code {
      background-color: rgba(110, 118, 129, 0.4);
      padding: 0.2em 0.4em;
      border-radius: 6px;
      font-size: 85%;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
      color: #ff7b72;
    }
    .markdown-preview pre.code-block {
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin: 16px 0;
      position: relative;
    }
    .markdown-preview pre.code-block::before {
      content: attr(data-language);
      position: absolute;
      top: 8px;
      right: 12px;
      font-size: 0.75rem;
      color: #8b949e;
      text-transform: uppercase;
      font-weight: 600;
    }
    .markdown-preview pre.code-block code {
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
      font-size: 0.875rem;
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
    .markdown-preview .token-function {
      color: #d2a8ff;
    }
    .markdown-preview .token-number {
      color: #79c0ff;
    }
    .markdown-preview .token-comment {
      color: #8b949e;
      font-style: italic;
    }
    .markdown-preview ul, .markdown-preview ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 2em;
    }
    .markdown-preview li {
      margin-top: 0.25em;
      color: #c9d1d9;
      line-height: 1.6;
    }
    .markdown-preview ul li {
      list-style-type: disc;
    }
    .markdown-preview ol li {
      list-style-type: decimal;
    }
    .markdown-preview blockquote {
      margin: 16px 0;
      padding: 0 1em;
      color: #8b949e;
      border-left: 0.25em solid #3b434b;
    }
    .markdown-preview hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #21262d;
      border: 0;
    }
    .markdown-preview img {
      max-width: 100%;
      border-radius: 6px;
      margin: 16px 0;
    }
  `;

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="container mx-auto px-4 py-6">
        <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
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
          <div className="flex flex-wrap gap-2">
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
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#1f2937] border border-[#30363d] px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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