import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MessageFormatter = ({ content }) => {
    const [copiedBlocks, setCopiedBlocks] = useState(new Set());

    const copyToClipboard = async (text, blockId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedBlocks(prev => new Set([...prev, blockId]));
            setTimeout(() => {
                setCopiedBlocks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(blockId);
                    return newSet;
                });
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatMessage = (text) => {
        const parts = [];
        let currentIndex = 0;
        let blockId = 0;

        const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
        const mathBlockRegex = /\\\[([\s\S]*?)\\\]/g;

        const matches = [];

        let match;
        while ((match = codeBlockRegex.exec(text)) !== null) {
            matches.push({
                type: 'code-block',
                start: match.index,
                end: match.index + match[0].length,
                language: match[1] || 'text',
                code: match[2].trim(),
                full: match[0]
            });
        }

        while ((match = mathBlockRegex.exec(text)) !== null) {
            matches.push({
                type: 'math-block',
                start: match.index,
                end: match.index + match[0].length,
                formula: match[1].trim(),
                full: match[0]
            });
        }

        matches.sort((a, b) => a.start - b.start);

        for (const match of matches) {
            if (currentIndex < match.start) {
                const textBefore = text.slice(currentIndex, match.start);
                parts.push(
                    <div key={`text-${currentIndex}`} className="message-text">
                        {formatInlineElements(textBefore)}
                    </div>
                );
            }

            if (match.type === 'code-block') {
                const currentBlockId = blockId++;
                parts.push(
                    <div key={`code-${currentBlockId}`} className="code-block-container">
                        <div className="code-block-header">
                            <span className="code-language">{match.language || 'text'}</span>
                            <button
                                onClick={() => copyToClipboard(match.code, currentBlockId)}
                                className="copy-button"
                            >
                                {copiedBlocks.has(currentBlockId) ? (
                                    <>
                                        <Check size={14} />
                                        <span>Скопировано</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        <span>Копировать</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="code-block">
                            <code className={`language-${match.language}`}>
                                {match.code}
                            </code>
                        </pre>
                    </div>
                );
            } else if (match.type === 'math-block') {
                parts.push(
                    <div key={`math-${blockId++}`} className="math-block">
                        <BlockMath math={match.formula} />
                    </div>
                );
            }

            currentIndex = match.end;
        }

        if (currentIndex < text.length) {
            const remainingText = text.slice(currentIndex);
            parts.push(
                <div key={`text-${currentIndex}`} className="message-text">
                    {formatInlineElements(remainingText)}
                </div>
            );
        }

        return parts.length > 0 ? parts : [
            <div key="default" className="message-text">
                {formatInlineElements(text)}
            </div>
        ];
    };

    const formatInlineElements = (text) => {
        const mathParts = text.split(/(\\\([^)]+\\\))/g);

        return mathParts.map((mathPart, mathIndex) => {
            if (mathPart.startsWith('\\(') && mathPart.endsWith('\\)')) {
                const formula = mathPart.slice(2, -2);
                return (
                    <InlineMath key={`math-${mathIndex}`} math={formula} />
                );
            }

            const latexParts = mathPart.split(/(\\\w+(?:\{[^}]+\})?|\\\w+)/g);

            return latexParts.map((latexPart, latexIndex) => {
                if (latexPart.match(/^\\\w+(?:\{[^}]+\})?$/) || latexPart.match(/^\\\w+$/)) {
                    try {
                        return (
                            <InlineMath
                                key={`${mathIndex}-latex-${latexIndex}`}
                                math={latexPart}
                            />
                        );
                    } catch (error) {
                        return (
                            <span key={`${mathIndex}-latex-${latexIndex}`} className="latex-fallback">
                                {latexPart}
                            </span>
                        );
                    }
                }

                const codeParts = latexPart.split(/(`[^`]+`)/g);

                return codeParts.map((codePart, codeIndex) => {
                    if (codePart.startsWith('`') && codePart.endsWith('`')) {
                        const code = codePart.slice(1, -1);
                        return (
                            <code key={`${mathIndex}-${latexIndex}-code-${codeIndex}`} className="inline-code">
                                {code}
                            </code>
                        );
                    }

                    return formatBoldText(codePart, `${mathIndex}-${latexIndex}-${codeIndex}`);
                });
            });
        });
    };

    const formatBoldText = (text, baseIndex) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2);
                return <strong key={`${baseIndex}-bold-${index}`}>{boldText}</strong>;
            }

            return formatItalicText(part, `${baseIndex}-${index}`);
        });
    };

    const formatItalicText = (text, baseIndex) => {
        const parts = text.split(/(\*[^*]+\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                const italicText = part.slice(1, -1);
                return <em key={`${baseIndex}-italic-${index}`}>{italicText}</em>;
            }

            return formatHeaders(part, `${baseIndex}-${index}`);
        });
    };

    const formatHeaders = (text, baseIndex) => {
        const lines = text.split('\n');

        return lines.map((line, lineIndex) => {
            if (line.startsWith('#### ')) {
                return (
                    <h4 key={`${baseIndex}-h4-${lineIndex}`} className="message-header">
                        {line.slice(5)}
                    </h4>
                );
            } else if (line.startsWith('### ')) {
                return (
                    <h3 key={`${baseIndex}-h3-${lineIndex}`} className="message-header">
                        {line.slice(4)}
                    </h3>
                );
            } else if (line.startsWith('## ')) {
                return (
                    <h2 key={`${baseIndex}-h2-${lineIndex}`} className="message-header">
                        {line.slice(3)}
                    </h2>
                );
            } else if (line.startsWith('# ')) {
                return (
                    <h1 key={`${baseIndex}-h1-${lineIndex}`} className="message-header">
                        {line.slice(2)}
                    </h1>
                );
            }

            return formatLists(line, `${baseIndex}-line-${lineIndex}`);
        });
    };

    const formatLists = (text, baseIndex) => {
        if (text.match(/^-\s/)) {
            return (
                <div key={baseIndex} className="list-item">
                    <span className="list-marker">•</span>
                    <span className="list-content">{text.slice(2)}</span>
                </div>
            );
        }

        return (
            <React.Fragment key={baseIndex}>
                {text}
                <br />
            </React.Fragment>
        );
    };

    return (
        <div className="formatted-message">
            {formatMessage(content)}
        </div>
    );
};

export default MessageFormatter;