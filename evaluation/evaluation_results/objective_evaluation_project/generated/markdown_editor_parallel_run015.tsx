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

// Markdown parser with syntax highlighting
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
  html = html.replace(/^> (.*$)/gim, '<blockquote class="markdown-blockquote">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="markdown-hr" />');

  // Unordered lists
  html = html.replace(/^\- (.+)$/gim, '<li class="markdown-li">$1</li>');
  html = html.replace(/(<li class="markdown-li">.*<\/li>)/s, '<ul class="markdown-ul">$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gim, '<li class="markdown-li-ordered">$1</li>');
  html = html.replace(/(<li class="markdown-li-ordered">.*<\/li>)/s, '<ol class="markdown-ol">$1</ol>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.match(/^<(h[1-3]|pre|ul|ol|blockquote|hr)/)) {
      return para;
    }
    return para.trim() ? `<p class="markdown-p">${para}</p>` : '';
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
    highlighted = highlighted.replace(/\b(function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|new|this|typeof|instanceof)\b/g, 
      '<span class="token-keyword">$1</span>');
    
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
    highlighted = highlighted.replace(/\b(def|class|return|if|else|elif|for|while|import|from|as|with|try|except|finally|pass|break|continue|lambda|yield)\b/g, 
      '<span class="token-keyword">$1</span>');
    
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

// Global styles for markdown preview
const markdownStyles = `
  .markdown-preview h1.markdown-h1 {
    font-size: 2em;
    font-weight: 700;
    margin: 0.67em 0;
    color: #569cd6;
    border-bottom: 1px solid #404040;
    padding-bottom: 0.3em;
  }

  .markdown-preview h2.markdown-h2 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 0.75em 0 0.5em 0;
    color: #4ec9b0;
    border-bottom: 1px solid #404040;
    padding-bottom: 0.3em;
  }

  .markdown-preview h3.markdown-h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 0.5em 0;
    color: #4ec9b0;
  }

  .markdown-preview p.markdown-p {
    margin: 1em 0;
    color: #d4d4d4;
  }

  .markdown-preview strong.markdown-bold {
    font-weight: 700;
    color: #dcdcaa;
  }

  .markdown-preview em.markdown-italic {
    font-style: italic;
    color: #ce9178;
  }

  .markdown-preview code.inline-code {
    background: #2d2d2d;
    color: #ce9178;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    border: 1px solid #404040;
  }

  .markdown-preview pre.code-block {
    background: #1e1e1e;
    border: 1px solid #404040;
    border-radius: 6px;
    margin: 1em 0;
    overflow: hidden;
  }

  .markdown-preview .code-header {
    background: #2d2d2d;
    padding: 8px 16px;
    border-bottom: 1px solid #404040;
    font-size: 0.75em;
    color: #858585;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .markdown-preview .code-lang {
    color: #4ec9b0;
  }

  .markdown-preview pre.code-block code {
    display: block;
    padding: 16px;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    line-height: 1.5;
    color: #d4d4d4;
  }

  .markdown-preview .token-keyword {
    color: #569cd6;
    font-weight: 500;
  }

  .markdown-preview .token-string {
    color: #ce9178;
  }

  .markdown-preview .token-function {
    color: #dcdcaa;
  }

  .markdown-preview .token-comment {
    color: #6a9955;
    font-style: italic;
  }

  .markdown-preview .token-number {
    color: #b5cea8;
  }

  .markdown-preview a.markdown-link {
    color: #3794ff;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }

  .markdown-preview a.markdown-link:hover {
    border-bottom-color: #3794ff;
  }

  .markdown-preview img.markdown-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1em 0;
  }

  .markdown-preview ul.markdown-ul,
  .markdown-preview ol.markdown-ol {
    margin: 1em 0;
    padding-left: 2em;
  }

  .markdown-preview li.markdown-li,
  .markdown-preview li.markdown-li-ordered {
    margin: 0.5em 0;
    color: #d4d4d4;
  }

  .markdown-preview blockquote.markdown-blockquote {
    border-left: 4px solid #007acc;
    padding-left: 1em;
    margin: 1em 0;
    color: #9cdcfe;
    background: rgba(0, 122, 204, 0.1);
    padding: 0.5em 1em;
    border-radius: 0 4px 4px 0;
  }

  .markdown-preview hr.markdown-hr {
    border: none;
    border-top: 1px solid #404040;
    margin: 2em 0;
  }
`;

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleId = 'markdown-preview-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = markdownStyles;
    document.head.appendChild(styleElement);
  }
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

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;

    // Handle different markdown syntax patterns
    if (action.includes('text') && selectedText) {
      // Replace 'text' with selected text
      newText = action.replace('text', selectedText);
      cursorOffset = newText.length;
    } else if (action.includes('url')) {
      // For links and images, position cursor at 'text' or 'alt'
      if (selectedText) {
        newText = action.replace('text', selectedText).replace('alt', selectedText);
        cursorOffset = newText.indexOf('url');
      } else {
        newText = action;
        cursorOffset = action.indexOf('text') !== -1 ? action.indexOf('text') : action.indexOf('alt');
      }
    } else if (action.includes('item')) {
      // For lists, add on new line if not at start
      const beforeCursor = markdown.substring(0, start);
      const needsNewline = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
      newText = (needsNewline ? '\n' : '') + action;
      cursorOffset = newText.length;
    } else {
      newText = action;
      cursorOffset = selectedText ? newText.length : action.indexOf('text');
      if (cursorOffset === -1) cursorOffset = newText.length;
    }

    // Insert the new text
    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);

    // Update cursor position after state update
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = start + cursorOffset;
        textareaRef.focus();
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }
    }, 0);

// MarkdownPreview component with VS Code styling
interface MarkdownPreviewProps {
  markdown: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown }) => {
  const htmlContent = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <div 
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        color: '#d4d4d4',
        lineHeight: '1.6',
      }}
    />
  );
};
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 bg-[#2d2d2d] border border-gray-700 rounded-lg p-2 shadow-xl"
        >
          <div className="flex items-center gap-1 flex-wrap">
            {toolbarButtons.map((button) => {
              const Icon = button.icon;
              return (
                <motion.div
                  key={button.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleToolbarAction(button.action)}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-[#3d3d3d] hover:text-blue-400 transition-colors duration-200"
                    title={button.label}
                  >
                    <Icon className="w-4 h-4" />
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
                className="w-full h-[600px] bg-[#1e1e1e] text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none"
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
          transition={{ delay: 0.2 }}
          className="mt-6 bg-[#2d2d2d] border border-gray-800 rounded-lg p-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-[#1e1e1e] rounded-lg border border-gray-800">
              <span className="text-2xl font-bold text-blue-400">{markdown.length}</span>
              <span className="text-xs text-gray-500 mt-1">Characters</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-[#1e1e1e] rounded-lg border border-gray-800">
              <span className="text-2xl font-bold text-purple-400">
                {markdown.trim().split(/\s+/).filter(word => word.length > 0).length}
              </span>
              <span className="text-xs text-gray-500 mt-1">Words</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-[#1e1e1e] rounded-lg border border-gray-800">
              <span className="text-2xl font-bold text-green-400">
                {markdown.split('\n').length}
              </span>
              <span className="text-xs text-gray-500 mt-1">Lines</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-[#1e1e1e] rounded-lg border border-gray-800">
              <span className="text-2xl font-bold text-orange-400">
                {Math.ceil(markdown.trim().split(/\s+/).filter(word => word.length > 0).length / 200)} min
              </span>
              <span className="text-xs text-gray-500 mt-1">Reading Time</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}