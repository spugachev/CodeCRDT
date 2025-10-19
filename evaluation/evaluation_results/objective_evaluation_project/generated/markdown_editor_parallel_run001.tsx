import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Code, List, ListOrdered, Link, Image, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

// Custom syntax highlighter style with vibrant colors
const customCodeStyle = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background: '#161b22',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem 0',
    border: '1px solid #30363d',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    background: 'transparent',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
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

**Try editing this content!**`;

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

  const insertMarkdown = useCallback((syntax: string) => {
    const textArea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textArea) return;

    const start = cursorPosition;
    const end = cursorPosition;
    const textBefore = markdown.substring(0, start);
    const textAfter = markdown.substring(end);
    
    const newMarkdown = textBefore + syntax + textAfter;
    setMarkdown(newMarkdown);
    
    // Set cursor position after inserted syntax
    setTimeout(() => {
      textArea.focus();
      const newCursorPos = start + syntax.length;
      textArea.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    }, 0);
  }, [markdown, cursorPosition]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="container mx-auto px-4 py-8">
                <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Premium Markdown Editor
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
              <span>{markdown.length} characters</span>
              <span>•</span>
              <span>{markdown.split('\n').length} lines</span>
              <span>•</span>
              <span>{markdown.trim().split(/\s+/).length} words</span>
            </div>
          </div>
          <Button
            onClick={togglePreview}
            variant="outline"
            className="bg-[#161b22] border-gray-700 hover:bg-[#1f2937] hover:border-gray-600 transition-all"
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 mb-6 shadow-xl"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {toolbarButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown(button.action)}
                  className="relative group bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#58a6ff] text-gray-300 hover:text-[#58a6ff] transition-all duration-200"
                  title={button.label}
                >
                  <button.icon className="w-4 h-4" />
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1f6feb] text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
                    initial={{ opacity: 0, y: -5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                  >
                    {button.label}
                  </motion.div>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div></parameter>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="relative">
                        <div className="relative bg-[#161b22] rounded-lg border border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-gray-800">
                <span className="text-sm font-medium text-gray-400">Editor</span>
                <span className="text-xs text-gray-500">{markdown.length} characters</span>
              </div>
              
              <div className="relative">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0d1117] border-r border-gray-800 py-4 text-right pr-3 select-none pointer-events-none z-10">
                  {markdown.split('\n').map((_, index) => (
                    <div key={index} className="text-xs text-gray-600 leading-6 font-mono">
                      {index + 1}
                    </div>
                  ))}
                </div>

                {/* Syntax highlighting overlay */}
                <div className="absolute left-12 top-0 py-4 px-4 pointer-events-none z-0 font-mono text-sm leading-6 whitespace-pre-wrap break-words overflow-hidden">
                  {markdown.split('\n').map((line, index) => {
                    // Heading syntax
                    if (line.startsWith('# ')) {
                      return <div key={index} className="text-[#58a6ff] font-bold text-xl">{line}</div>;
                    }
                    if (line.startsWith('## ')) {
                      return <div key={index} className="text-[#58a6ff] font-bold text-lg">{line}</div>;
                    }
                    if (line.startsWith('### ')) {
                      return <div key={index} className="text-[#58a6ff] font-bold">{line}</div>;
                    }
                    
                    // Code block detection
                    if (line.startsWith('```')) {
                      return <div key={index} className="text-[#79c0ff]">{line}</div>;
                    }
                    
                    // List items
                    if (line.match(/^[\s]*[-*+]\s/)) {
                      return <div key={index} className="text-gray-300">
                        <span className="text-[#ff7b72]">{line.match(/^[\s]*[-*+]/)?.[0]}</span>
                        {line.replace(/^[\s]*[-*+]\s/, ' ')}
                      </div>;
                    }
                    
                    // Numbered lists
                    if (line.match(/^[\s]*\d+\.\s/)) {
                      return <div key={index} className="text-gray-300">
                        <span className="text-[#ff7b72]">{line.match(/^[\s]*\d+\./)?.[0]}</span>
                        {line.replace(/^[\s]*\d+\.\s/, ' ')}
                      </div>;
                    }
                    
                    // Blockquote
                    if (line.startsWith('>')) {
                      return <div key={index} className="text-[#8b949e] italic">{line}</div>;
                    }
                    
                    // Horizontal rule
                    if (line.match(/^---+$/)) {
                      return <div key={index} className="text-gray-600">{line}</div>;
                    }
                    
                    // Process inline syntax
                    let processedLine = line;
                    const parts: JSX.Element[] = [];
                    let lastIndex = 0;
                    
                    // Bold **text**
                    const boldRegex = /\*\*(.+?)\*\*/g;
                    let match;
                    const matches: Array<{type: string, start: number, end: number, content: string}> = [];
                    
                    while ((match = boldRegex.exec(line)) !== null) {
                      matches.push({type: 'bold', start: match.index, end: match.index + match[0].length, content: match[0]});
                    }
                    
                    // Italic *text*
                    const italicRegex = /\*(.+?)\*/g;
                    while ((match = italicRegex.exec(line)) !== null) {
                      if (!matches.some(m => m.start <= match.index && m.end >= match.index + match[0].length)) {
                        matches.push({type: 'italic', start: match.index, end: match.index + match[0].length, content: match[0]});
                      }
                    }
                    
                    // Inline code `code`
                    const codeRegex = /`(.+?)`/g;
                    while ((match = codeRegex.exec(line)) !== null) {
                      matches.push({type: 'code', start: match.index, end: match.index + match[0].length, content: match[0]});
                    }
                    
                    // Links [text](url)
                    const linkRegex = /\[(.+?)\]\((.+?)\)/g;
                    while ((match = linkRegex.exec(line)) !== null) {
                      matches.push({type: 'link', start: match.index, end: match.index + match[0].length, content: match[0]});
                    }
                    
                    // Sort matches by start position
                    matches.sort((a, b) => a.start - b.start);
                    
                    if (matches.length > 0) {
                      matches.forEach((m, i) => {
                        if (m.start > lastIndex) {
                          parts.push(<span key={`text-${i}`}>{line.substring(lastIndex, m.start)}</span>);
                        }
                        
                        if (m.type === 'bold') {
                          parts.push(<span key={`bold-${i}`} className="text-[#ffa657] font-bold">{m.content}</span>);
                        } else if (m.type === 'italic') {
                          parts.push(<span key={`italic-${i}`} className="text-[#a5d6ff] italic">{m.content}</span>);
                        } else if (m.type === 'code') {
                          parts.push(<span key={`code-${i}`} className="text-[#a5d6ff] bg-[#1f2937] px-1 rounded">{m.content}</span>);
                        } else if (m.type === 'link') {
                          parts.push(<span key={`link-${i}`} className="text-[#58a6ff] underline">{m.content}</span>);
                        }
                        
                        lastIndex = m.end;
                      });
                      
                      if (lastIndex < line.length) {
                        parts.push(<span key={`text-end`}>{line.substring(lastIndex)}</span>);
                      }
                      
                      return <div key={index} className="text-gray-300">{parts}</div>;
                    }
                    
                    return <div key={index} className="text-gray-300">{line || '\u00A0'}</div>;
                  })}
                </div>

                {/* Textarea */}
                <textarea
                  value={markdown}
                  onChange={handleMarkdownChange}
                  onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                  className="relative w-full h-[600px] bg-transparent text-transparent caret-white pl-16 pr-4 py-4 font-mono text-sm leading-6 resize-none focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:ring-opacity-50 rounded-lg z-20"
                  style={{ caretColor: '#58a6ff' }}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 h-[600px] overflow-y-auto">
                  <div className="prose prose-invert prose-slate max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={customCodeStyle}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: '1rem 0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className="bg-[#161b22] text-[#79c0ff] px-1.5 py-0.5 rounded text-sm border border-[#30363d]"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        h1: ({ children }) => (
                          <h1 className="text-4xl font-bold text-white mb-4 mt-6 pb-2 border-b border-[#30363d]">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-3xl font-bold text-white mb-3 mt-5 pb-2 border-b border-[#30363d]">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-2xl font-semibold text-white mb-2 mt-4">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-300 mb-4 leading-7">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-[#79c0ff] font-semibold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="text-[#a5d6ff] italic">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-300 ml-4">{children}</li>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-[#58a6ff] hover:text-[#79c0ff] underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-[#58a6ff] pl-4 py-2 my-4 bg-[#161b22] rounded-r-lg text-gray-300 italic">
                            {children}
                          </blockquote>
                        ),
                        hr: () => (
                          <hr className="border-[#30363d] my-6" />
                        ),
                        img: ({ src, alt }) => (
                          <img
                            src={src}
                            alt={alt}
                            className="rounded-lg border border-[#30363d] max-w-full h-auto my-4"
                          />
                        ),
                      }}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-8 bg-[#161b22] border border-[#30363d] rounded-lg p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Words:</span>
                <span className="text-blue-400 font-semibold">
                  {markdown.trim().split(/\s+/).filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Characters:</span>
                <span className="text-green-400 font-semibold">
                  {markdown.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Lines:</span>
                <span className="text-purple-400 font-semibold">
                  {markdown.split('\n').length}
                </span>
              </div>
            </div>
            <div className="text-gray-500 text-xs">
              Cursor: {cursorPosition}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}