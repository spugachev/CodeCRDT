import { useState, useCallback } from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { useEffect } from 'react';

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

const calculateStats = (text: string) => {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const characters = text.length;
  const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute
  return { words, characters, readingTime };
};

// Markdown parser utility
const parseMarkdown = (text: string): string => {
  let html = text;

  // Code blocks with syntax highlighting
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'javascript';
    let highlighted = code;
    
    try {
      if (Prism.languages[language]) {
        highlighted = Prism.highlight(code, Prism.languages[language], language);
      }
    } catch (e) {
      highlighted = code;
    }
    
    return `<pre class="code-block"><code class="language-${language}">${highlighted}</code></pre>`;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr />');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li class="unordered">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ordered">$1</li>');

  // Wrap consecutive list items
  html = html.replace(/(<li class="unordered">.*<\/li>\n?)+/g, '<ul>$&</ul>');
  html = html.replace(/(<li class="ordered">.*<\/li>\n?)+/g, '<ol>$&</ol>');

  // Line breaks
  html = html.replace(/\n\n/g, '<br /><br />');
  html = html.replace(/\n/g, '<br />');

  return html;
};

// Preview component with VS Code styling
const MarkdownPreview = ({ content }: { content: string }) => {
  useEffect(() => {
    // Re-highlight code blocks when content changes
    Prism.highlightAll();
  }, [content]);

  const htmlContent = parseMarkdown(content);

  return (
    <div 
      className="markdown-preview prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        '--tw-prose-body': '#c9d1d9',
        '--tw-prose-headings': '#58a6ff',
        '--tw-prose-links': '#58a6ff',
        '--tw-prose-bold': '#ffffff',
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCursorPosition(e.target.selectionStart);
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const handleToolbarAction = useCallback((action: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;

    // Handle different markdown syntax patterns
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
    } else if (action.includes('[text](url)')) {
      // Link
      newText = selectedText ? `[${selectedText}](url)` : '[text](url)';
      cursorOffset = selectedText ? newText.length - 4 : 1;
    } else if (action.includes('![alt](url)')) {
      // Image
      newText = selectedText ? `![${selectedText}](url)` : '![alt](url)';
      cursorOffset = selectedText ? newText.length - 4 : 2;
    } else if (action.includes('- item')) {
      // Bullet list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const isNewLine = start === lineStart || markdown[start - 1] === '\n';
      newText = isNewLine ? `- ${selectedText || 'item'}` : `\n- ${selectedText || 'item'}`;
      cursorOffset = newText.length;
    } else if (action.includes('1. item')) {
      // Numbered list
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const isNewLine = start === lineStart || markdown[start - 1] === '\n';
      newText = isNewLine ? `1. ${selectedText || 'item'}` : `\n1. ${selectedText || 'item'}`;
      cursorOffset = newText.length;
    } else {
      newText = action;
      cursorOffset = newText.length;
    }

    // Insert the new text
    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
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
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 bg-[#161b22] border border-[#30363d] rounded-lg p-3 shadow-xl"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {toolbarButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleToolbarAction(button.action)}
                  variant="ghost"
                  size="sm"
                  className="relative group bg-[#0d1117] hover:bg-[#1f2937] border border-[#30363d] hover:border-blue-500/50 text-gray-300 hover:text-blue-400 transition-all duration-300"
                  title={button.label}
                >
                  <button.icon className="w-4 h-4" />
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1f2937] text-xs text-gray-300 px-2 py-1 rounded border border-[#30363d] whitespace-nowrap pointer-events-none"
                    initial={{ opacity: 0, y: -5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {button.label}
                  </motion.div>
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
                    <style jsx>{`
                      .markdown-preview {
                        color: #c9d1d9;
                        line-height: 1.6;
                      }

                      .markdown-preview h1 {
                        font-size: 2em;
                        font-weight: 700;
                        margin-bottom: 1rem;
                        color: #58a6ff;
                        border-bottom: 1px solid #30363d;
                        padding-bottom: 0.5rem;
                      }

                      .markdown-preview h2 {
                        font-size: 1.5em;
                        font-weight: 600;
                        margin-top: 1.5rem;
                        margin-bottom: 0.75rem;
                        color: #58a6ff;
                        border-bottom: 1px solid #30363d;
                        padding-bottom: 0.3rem;
                      }

                      .markdown-preview h3 {
                        font-size: 1.25em;
                        font-weight: 600;
                        margin-top: 1.25rem;
                        margin-bottom: 0.5rem;
                        color: #58a6ff;
                      }

                      .markdown-preview strong {
                        color: #ffffff;
                        font-weight: 600;
                      }

                      .markdown-preview em {
                        color: #f0883e;
                        font-style: italic;
                      }

                      .markdown-preview a {
                        color: #58a6ff;
                        text-decoration: none;
                        border-bottom: 1px solid transparent;
                        transition: border-color 0.2s;
                      }

                      .markdown-preview a:hover {
                        border-bottom-color: #58a6ff;
                      }

                      .markdown-preview .inline-code {
                        background: #161b22;
                        color: #ff7b72;
                        padding: 0.2em 0.4em;
                        border-radius: 3px;
                        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                        font-size: 0.9em;
                        border: 1px solid #30363d;
                      }

                      .markdown-preview .code-block {
                        background: #161b22;
                        border: 1px solid #30363d;
                        border-radius: 6px;
                        padding: 1rem;
                        margin: 1rem 0;
                        overflow-x: auto;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                      }

                      .markdown-preview .code-block code {
                        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                        font-size: 0.875em;
                        line-height: 1.5;
                        color: #c9d1d9;
                      }

                      .markdown-preview ul,
                      .markdown-preview ol {
                        margin: 1rem 0;
                        padding-left: 2rem;
                      }

                      .markdown-preview li {
                        margin: 0.5rem 0;
                        color: #c9d1d9;
                      }

                      .markdown-preview ul li {
                        list-style-type: disc;
                      }

                      .markdown-preview ol li {
                        list-style-type: decimal;
                      }

                      .markdown-preview blockquote {
                        border-left: 4px solid #58a6ff;
                        padding-left: 1rem;
                        margin: 1rem 0;
                        color: #8b949e;
                        font-style: italic;
                        background: #161b22;
                        padding: 0.75rem 1rem;
                        border-radius: 0 4px 4px 0;
                      }

                      .markdown-preview hr {
                        border: none;
                        border-top: 2px solid #30363d;
                        margin: 2rem 0;
                      }

                      .markdown-preview img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 6px;
                        margin: 1rem 0;
                        border: 1px solid #30363d;
                      }

                      /* Prism syntax highlighting - VS Code theme */
                      .markdown-preview .token.comment,
                      .markdown-preview .token.prolog,
                      .markdown-preview .token.doctype,
                      .markdown-preview .token.cdata {
                        color: #6a9955;
                      }

                      .markdown-preview .token.punctuation {
                        color: #d4d4d4;
                      }

                      .markdown-preview .token.property,
                      .markdown-preview .token.tag,
                      .markdown-preview .token.boolean,
                      .markdown-preview .token.number,
                      .markdown-preview .token.constant,
                      .markdown-preview .token.symbol,
                      .markdown-preview .token.deleted {
                        color: #b5cea8;
                      }

                      .markdown-preview .token.selector,
                      .markdown-preview .token.attr-name,
                      .markdown-preview .token.string,
                      .markdown-preview .token.char,
                      .markdown-preview .token.builtin,
                      .markdown-preview .token.inserted {
                        color: #ce9178;
                      }

                      .markdown-preview .token.operator,
                      .markdown-preview .token.entity,
                      .markdown-preview .token.url,
                      .markdown-preview .language-css .token.string,
                      .markdown-preview .style .token.string {
                        color: #d4d4d4;
                      }

                      .markdown-preview .token.atrule,
                      .markdown-preview .token.attr-value,
                      .markdown-preview .token.keyword {
                        color: #c586c0;
                      }

                      .markdown-preview .token.function,
                      .markdown-preview .token.class-name {
                        color: #dcdcaa;
                      }

                      .markdown-preview .token.regex,
                      .markdown-preview .token.important,
                      .markdown-preview .token.variable {
                        color: #4fc1ff;
                      }
                    `}</style>
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
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-4 shadow-xl"
        >
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Words:</span>
              <span className="font-semibold text-blue-400">{calculateStats(markdown).words}</span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Characters:</span>
              <span className="font-semibold text-purple-400">{calculateStats(markdown).characters}</span>
            </div>
            <div className="w-px h-4 bg-[#30363d]"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Reading Time:</span>
              <span className="font-semibold text-green-400">
                {calculateStats(markdown).readingTime} min
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
