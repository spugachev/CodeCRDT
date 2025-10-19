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

// Markdown parser component
const MarkdownPreview = ({ content }: { content: string }) => {
  const parsedContent = useMemo(() => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-4xl font-bold mb-4 text-blue-400">
            {parseInline(line.slice(2))}
          </h1>
        );
        i++;
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-3xl font-bold mb-3 text-purple-400">
            {parseInline(line.slice(3))}
          </h2>
        );
        i++;
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-2xl font-bold mb-2 text-pink-400">
            {parseInline(line.slice(4))}
          </h3>
        );
        i++;
      }
      // Code blocks
      else if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <div key={i} className="mb-4 rounded-lg overflow-hidden border border-gray-700">
            {language && (
              <div className="bg-[#2d2d2d] px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700">
                {language}
              </div>
            )}
            <pre className="bg-[#1e1e1e] p-4 overflow-x-auto">
              <code className="font-mono text-sm">
                {highlightCode(codeLines.join('\n'), language)}
              </code>
            </pre>
          </div>
        );
        i++;
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={i}
            className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-500/10 text-gray-300 italic"
          >
            {parseInline(line.slice(2))}
          </blockquote>
        );
        i++;
      }
      // Horizontal rule
      else if (line.trim() === '---') {
        elements.push(
          <hr key={i} className="my-6 border-gray-700" />
        );
        i++;
      }
      // Unordered list
      else if (line.startsWith('- ')) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].startsWith('- ')) {
          listItems.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={i} className="list-disc list-inside mb-4 space-y-1 text-gray-300">
            {listItems.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ul>
        );
      }
      // Ordered list
      else if (/^\d+\.\s/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\d+\.\s/, ''));
          i++;
        }
        elements.push(
          <ol key={i} className="list-decimal list-inside mb-4 space-y-1 text-gray-300">
            {listItems.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ol>
        );
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
        i++;
      }
      // Paragraph
      else {
        elements.push(
          <p key={i} className="mb-4 text-gray-300 leading-relaxed">
            {parseInline(line)}
          </p>
        );
        i++;
      }
    }

    return elements;
  }, [content]);

  return <div className="prose prose-invert max-w-none">{parsedContent}</div>;
};

// Parse inline markdown (bold, italic, code, links, images)
const parseInline = (text: string): (string | JSX.Element)[] => {
  const elements: (string | JSX.Element)[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        elements.push(remaining.slice(0, boldMatch.index));
      }
      elements.push(
        <strong key={key++} className="font-bold text-yellow-400">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Italic *text*
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        elements.push(remaining.slice(0, italicMatch.index));
      }
      elements.push(
        <em key={key++} className="italic text-green-400">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    // Inline code `code`
    const codeMatch = remaining.match(/`(.+?)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        elements.push(remaining.slice(0, codeMatch.index));
      }
      elements.push(
        <code
          key={key++}
          className="bg-[#2d2d2d] text-orange-400 px-2 py-1 rounded font-mono text-sm border border-gray-700"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      continue;
    }

    // Links [text](url)
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);
    if (linkMatch && linkMatch.index !== undefined) {
      if (linkMatch.index > 0) {
        elements.push(remaining.slice(0, linkMatch.index));
      }
      elements.push(
        <a
          key={key++}
          href={linkMatch[2]}
          className="text-blue-400 hover:text-blue-300 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
      continue;
    }

    // Images ![alt](url)
    const imageMatch = remaining.match(/!\[(.+?)\]\((.+?)\)/);
    if (imageMatch && imageMatch.index !== undefined) {
      if (imageMatch.index > 0) {
        elements.push(remaining.slice(0, imageMatch.index));
      }
      elements.push(
        <img
          key={key++}
          src={imageMatch[2]}
          alt={imageMatch[1]}
          className="max-w-full h-auto rounded-lg border border-gray-700 my-2"
        />
      );
      remaining = remaining.slice(imageMatch.index + imageMatch[0].length);
      continue;
    }

    // No more matches, add remaining text
    elements.push(remaining);
    break;
  }

  return elements;
};

// Syntax highlighter for code blocks
const highlightCode = (code: string, language: string): JSX.Element[] => {
  const lines = code.split('\n');
  
  return lines.map((line, idx) => {
    const tokens: (string | JSX.Element)[] = [];
    let remaining = line;
    let key = 0;

    if (language === 'javascript' || language === 'typescript') {
      // Keywords
      const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await'];
      const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
      
      while (remaining.length > 0) {
        // Strings
        const stringMatch = remaining.match(/(['"`]).*?\1/);
        if (stringMatch && stringMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#ce9178]">
              {stringMatch[0]}
            </span>
          );
          remaining = remaining.slice(stringMatch[0].length);
          continue;
        }

        // Comments
        const commentMatch = remaining.match(/\/\/.*/);
        if (commentMatch && commentMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#6a9955]">
              {commentMatch[0]}
            </span>
          );
          remaining = remaining.slice(commentMatch[0].length);
          continue;
        }

        // Keywords
        const keywordMatch = remaining.match(keywordPattern);
        if (keywordMatch && keywordMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#569cd6]">
              {keywordMatch[0]}
            </span>
          );
          remaining = remaining.slice(keywordMatch[0].length);
          continue;
        }

        // Functions
        const functionMatch = remaining.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
        if (functionMatch && functionMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#dcdcaa]">
              {functionMatch[1]}
            </span>
          );
          tokens.push('(');
          remaining = remaining.slice(functionMatch[0].length);
          continue;
        }

        // Numbers
        const numberMatch = remaining.match(/\b\d+(\.\d+)?\b/);
        if (numberMatch && numberMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#b5cea8]">
              {numberMatch[0]}
            </span>
          );
          remaining = remaining.slice(numberMatch[0].length);
          continue;
        }

        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    } else if (language === 'python') {
      const keywords = ['def', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'from', 'as', 'try', 'except'];
      const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
      
      while (remaining.length > 0) {
        // Strings
        const stringMatch = remaining.match(/(['"]).*?\1/);
        if (stringMatch && stringMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#ce9178]">
              {stringMatch[0]}
            </span>
          );
          remaining = remaining.slice(stringMatch[0].length);
          continue;
        }

        // Comments
        const commentMatch = remaining.match(/#.*/);
        if (commentMatch && commentMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#6a9955]">
              {commentMatch[0]}
            </span>
          );
          remaining = remaining.slice(commentMatch[0].length);
          continue;
        }

        // Keywords
        const keywordMatch = remaining.match(keywordPattern);
        if (keywordMatch && keywordMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#569cd6]">
              {keywordMatch[0]}
            </span>
          );
          remaining = remaining.slice(keywordMatch[0].length);
          continue;
        }

        // Functions
        const functionMatch = remaining.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        if (functionMatch && functionMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#dcdcaa]">
              {functionMatch[1]}
            </span>
          );
          tokens.push('(');
          remaining = remaining.slice(functionMatch[0].length);
          continue;
        }

        // Numbers
        const numberMatch = remaining.match(/\b\d+(\.\d+)?\b/);
        if (numberMatch && numberMatch.index === 0) {
          tokens.push(
            <span key={key++} className="text-[#b5cea8]">
              {numberMatch[0]}
            </span>
          );
          remaining = remaining.slice(numberMatch[0].length);
          continue;
        }

        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    } else {
      // Default: no highlighting
      tokens.push(line);
    }

    return (
      <div key={idx}>
        {tokens.length > 0 ? tokens : '\n'}
      </div>
    );
  });
};

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
    
    // Insert the markdown syntax at cursor position
    const newMarkdown = textBefore + action + textAfter;
    setMarkdown(newMarkdown);
    
    // Calculate new cursor position (after inserted text)
    const newCursorPos = start + action.length;
    
    // Update cursor position and focus textarea
    setTimeout(() => {
      textareaRef.focus();
      textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    }, 0);
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
                className="w-full h-[600px] bg-[#1e1e1e] text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
          transition={{ delay: 0.2 }}
          className="mt-6 bg-[#2d2d2d] border border-gray-800 rounded-lg p-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-[#1e1e1e] rounded-lg border border-gray-800">
              <span className="text-2xl font-bold text-blue-400">
                {markdown.trim().split(/\s+/).filter(word => word.length > 0).length}
              </span>
              <span className="text-xs text-gray-500 mt-1">Words</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-[#1e1e1e] rounded-lg border border-gray-800">
              <span className="text-2xl font-bold text-purple-400">
                {markdown.length}
              </span>
              <span className="text-xs text-gray-500 mt-1">Characters</span>
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