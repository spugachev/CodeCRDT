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

  // Line breaks
  html = html.replace(/\n\n/g, '<br /><br />');
  html = html.replace(/\n/g, '<br />');

  return html;
};

// Simple syntax highlighter for code blocks
const highlightCode = (code: string, language: string): string => {
  if (language === 'javascript' || language === 'typescript') {
    return code
      .replace(/\b(function|const|let|var|return|if|else|for|while|class|import|export|from|default|async|await|true|false|null|undefined)\b/g, '<span class="token-keyword">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>')
      .replace(/(["'`])(.*?)\1/g, '<span class="token-string">$1$2$1</span>')
      .replace(/\/\/(.*?)(<br \/>|$)/g, '<span class="token-comment">//$1</span>$2')
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="token-function">$1</span>(');
  } else if (language === 'python') {
    return code
      .replace(/\b(def|class|return|if|else|elif|for|while|import|from|as|try|except|with|lambda|True|False|None)\b/g, '<span class="token-keyword">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>')
      .replace(/(["'`])(.*?)\1/g, '<span class="token-string">$1$2$1</span>')
      .replace(/#(.*?)(<br \/>|$)/g, '<span class="token-comment">#$1</span>$2')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="token-function">$1</span>(');
  }
  return code;
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

// MarkdownPreview component with VS Code styling
function MarkdownPreview({ content }: { content: string }) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div 
      className="markdown-preview prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        // VS Code-inspired styling
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
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
        const textArea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;

    // Handle different markdown syntax patterns
    if (action.includes('text') || action.includes('item') || action.includes('alt')) {
      // Replace placeholder with selected text or keep placeholder
      if (selectedText) {
        newText = action.replace(/text|item|alt/, selectedText);
        cursorOffset = newText.length;
      } else {
        newText = action;
        // Position cursor at the placeholder
        const placeholderMatch = action.match(/\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|\[(.*?)\]|- (.*)|1\. (.*)|!\[(.*?)\]/);
        if (placeholderMatch) {
          const placeholder = placeholderMatch[1] || placeholderMatch[2] || placeholderMatch[3] || placeholderMatch[4] || placeholderMatch[5] || placeholderMatch[6] || placeholderMatch[7];
          cursorOffset = action.indexOf(placeholder);
        } else {
          cursorOffset = newText.length;
        }
      }
    } else {
      newText = action;
      cursorOffset = newText.length;
    }

    // Insert the markdown syntax
    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);

    // Update cursor position after state update
    setTimeout(() => {
      textArea.focus();
      const newCursorPos = start + cursorOffset;
      textArea.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    }, 0);
  }, [markdown, cursorPosition]);

  // Add global styles for markdown preview
  const markdownStyles = `
    .markdown-preview h1.markdown-h1 {
      font-size: 2em;
      font-weight: 700;
      margin: 1em 0 0.5em 0;
      color: #58a6ff;
      border-bottom: 1px solid #30363d;
      padding-bottom: 0.3em;
    }
    .markdown-preview h2.markdown-h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 1em 0 0.5em 0;
      color: #58a6ff;
      border-bottom: 1px solid #30363d;
      padding-bottom: 0.3em;
    }
    .markdown-preview h3.markdown-h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 1em 0 0.5em 0;
      color: #58a6ff;
    }
    .markdown-preview strong.markdown-bold {
      color: #ffa657;
      font-weight: 600;
    }
    .markdown-preview em.markdown-italic {
      color: #79c0ff;
      font-style: italic;
    }
    .markdown-preview code.inline-code {
      background: #161b22;
      color: #ff7b72;
      padding: 0.2em 0.4em;
      border-radius: 6px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      border: 1px solid #30363d;
    }
    .markdown-preview pre.code-block {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 0;
      margin: 1em 0;
      overflow-x: auto;
    }
    .markdown-preview .code-header {
      background: #0d1117;
      border-bottom: 1px solid #30363d;
      padding: 0.5em 1em;
      font-size: 0.75em;
      color: #8b949e;
      font-weight: 600;
      text-transform: uppercase;
    }
    .markdown-preview .code-lang {
      color: #58a6ff;
    }
    .markdown-preview pre.code-block code {
      display: block;
      padding: 1em;
      color: #c9d1d9;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      line-height: 1.6;
    }
    .markdown-preview .token-keyword {
      color: #ff7b72;
      font-weight: 600;
    }
    .markdown-preview .token-function {
      color: #d2a8ff;
    }
    .markdown-preview .token-string {
      color: #a5d6ff;
    }
    .markdown-preview .token-number {
      color: #79c0ff;
    }
    .markdown-preview .token-comment {
      color: #8b949e;
      font-style: italic;
    }
    .markdown-preview a.markdown-link {
      color: #58a6ff;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }
    .markdown-preview a.markdown-link:hover {
      border-bottom-color: #58a6ff;
    }
    .markdown-preview img.markdown-image {
      max-width: 100%;
      border-radius: 6px;
      margin: 1em 0;
      border: 1px solid #30363d;
    }
    .markdown-preview blockquote.markdown-blockquote {
      border-left: 4px solid #58a6ff;
      padding-left: 1em;
      margin: 1em 0;
      color: #8b949e;
      font-style: italic;
      background: #161b22;
      padding: 1em;
      border-radius: 0 6px 6px 0;
    }
    .markdown-preview hr.markdown-hr {
      border: none;
      border-top: 2px solid #30363d;
      margin: 2em 0;
    }
    .markdown-preview ul.markdown-ul {
      list-style: none;
      padding-left: 0;
      margin: 1em 0;
    }
    .markdown-preview li.markdown-li {
      position: relative;
      padding-left: 1.5em;
      margin: 0.5em 0;
      color: #c9d1d9;
    }
    .markdown-preview li.markdown-li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #58a6ff;
      font-weight: bold;
      font-size: 1.2em;
    }
    .markdown-preview ol.markdown-ol {
      list-style: none;
      counter-reset: item;
      padding-left: 0;
      margin: 1em 0;
    }
    .markdown-preview li.markdown-li-ordered {
      position: relative;
      padding-left: 1.5em;
      margin: 0.5em 0;
      color: #c9d1d9;
      counter-increment: item;
    }
    .markdown-preview li.markdown-li-ordered::before {
      content: counter(item) ".";
      position: absolute;
      left: 0;
      color: #58a6ff;
      font-weight: bold;
    }
  `;

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="container mx-auto px-4 py-6">
        <style dangerouslySetInnerHTML={{ __html: markdownStyles }} />
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
          className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-4"
        >
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Words:</span>
              <span className="font-semibold text-blue-400">
                {markdown.trim() ? markdown.trim().split(/\s+/).filter(word => word.length > 0).length : 0}
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
                {Math.ceil((markdown.trim().split(/\s+/).filter(word => word.length > 0).length || 0) / 200)} min
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}