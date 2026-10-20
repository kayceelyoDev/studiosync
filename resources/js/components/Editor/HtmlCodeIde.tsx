import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Code2,
    Monitor,
    Tablet,
    Smartphone,
    ExternalLink,
    Search,
    Replace,
    Paintbrush,
    Copy,
    Plus,
    Trash2,
    Check,
    X,
    ChevronUp,
    ChevronDown,
    MousePointer,
    LayoutTemplate,
    Type,
    Grid,
    CreditCard,
    MessageSquare,
    Image as ImageIcon,
    Mail,
    Sliders,
    Sparkles,
    Eye,
    Maximize2,
    Minimize2,
    FileCode,
    RefreshCw,
    AlertCircle,
    ArrowUpRight,
    Edit3,
    ListTree,
    Terminal
} from 'lucide-react';
import { toast } from 'sonner';

export interface HtmlCodeIdeProps {
    html: string;
    onChange: (newHtml: string) => void;
    onCommit: (newHtml: string) => void;
    project: any;
    onInsertBookingCta: () => void;
    onInsertContactForm: () => void;
    codePreviewDevice: 'desktop' | 'tablet' | 'mobile';
    onChangePreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
    onSwitchToVisual?: () => void;
    adminRequestId?: string | null;
    initialLine?: number | null;
    clientRequest?: any;
}

export function HtmlCodeIde({
    html,
    onChange,
    onCommit,
    project,
    onInsertBookingCta,
    onInsertContactForm,
    codePreviewDevice,
    onChangePreviewDevice,
    onSwitchToVisual,
    adminRequestId,
    initialLine,
    clientRequest,
}: HtmlCodeIdeProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const inspectorContainerRef = useRef<HTMLDivElement>(null);

    // Active line and inspector states
    const [activeLine, setActiveLine] = useState<number | null>(null);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [activeSnippet, setActiveSnippet] = useState<string | null>(null);

    // View Mode: 'inspector' (Line-by-line interactive with glowing highlight) vs 'raw' (Textarea)
    const [editorViewMode, setEditorViewMode] = useState<'inspector' | 'raw'>('inspector');
    const [editingLineNum, setEditingLineNum] = useState<number | null>(null);
    const [editingLineText, setEditingLineText] = useState<string>('');

    // Editor settings
    const [fontSize, setFontSize] = useState<number>(12);
    const [wordWrap, setWordWrap] = useState<boolean>(true);
    const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

    // Search and Replace
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [replaceQuery, setReplaceQuery] = useState<string>('');
    const [searchMatches, setSearchMatches] = useState<number[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);

    // Add Element Modal
    const [isAddElementOpen, setIsAddElementOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<'buttons' | 'typography' | 'cards' | 'forms' | 'media' | 'containers'>('buttons');

    // Debounced code for preview rendering
    const [debouncedHtml, setDebouncedHtml] = useState<string>(html);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedHtml(html);
        }, 120);
        return () => clearTimeout(timer);
    }, [html]);

    // Annotate preview HTML with line numbers and inject live inspector runtime
    const annotatedSrcDoc = useMemo(() => {
        const lines = debouncedHtml.split('\n');
        let inScript = false;
        let inStyle = false;

        const annotatedLines = lines.map((line, idx) => {
            const lineNum = idx + 1;
            const lower = line.toLowerCase();
            if (lower.includes('<script')) inScript = true;
            if (lower.includes('</script>')) inScript = false;
            if (lower.includes('<style')) inStyle = true;
            if (lower.includes('</style>')) inStyle = false;

            if (inScript || inStyle || line.trim().startsWith('<!--')) {
                return line;
            }

            // Tag opening tags with data-ss-line and data-ss-tag (using \s instead of space so tabs/newlines match)
            return line.replace(/<([a-zA-Z][a-zA-Z0-9\-]*)(?=[\s>/])/g, (fullMatch, tag) => {
                const tagLower = tag.toLowerCase();
                if (['html', 'head', 'meta', 'title', 'link', 'style', 'script', 'base', '!doctype'].includes(tagLower)) {
                    return fullMatch;
                }
                return `<${tag} data-ss-line="${lineNum}" data-ss-tag="${tagLower}"`;
            });
        });

        const clientInspectorScript = `
<script id="__ss_ide_runtime_script__">
(function() {
    function initInspector() {
        if (window.__ss_inspector_initialized) return;
        window.__ss_inspector_initialized = true;

        var style = document.createElement('style');
        style.id = '__ss_ide_preview_styles__';
        style.textContent = [
            '.__ss-ide-hover { outline: 2px dashed #f59e0b !important; outline-offset: -1px !important; cursor: pointer !important; }',
            '.__ss-ide-selected { outline: 3px solid #f59e0b !important; outline-offset: 1px !important; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.45) !important; }',
            '.__ss-ide-pill { position: absolute !important; background: #18181b !important; color: #fbbf24 !important; font-size: 11px !important; font-family: ui-monospace, SFMono-Regular, monospace !important; font-weight: 700 !important; padding: 4px 8px !important; border-radius: 6px !important; border: 1px solid #f59e0b !important; z-index: 2147483647 !important; display: flex !important; align-items: center !important; gap: 6px !important; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important; pointer-events: auto !important; }'
        ].join('\\n');
        (document.head || document.documentElement).appendChild(style);

        function findLineElement(el) {
            var curr = el;
            while (curr && curr !== document.body && curr !== document.documentElement) {
                if (curr.getAttribute && curr.getAttribute('data-ss-line')) return curr;
                curr = curr.parentElement;
            }
            return null;
        }

        document.addEventListener('mouseover', function(e) {
            var target = e.target;
            if (!target || target === document.body || target === document.documentElement) return;
            var el = findLineElement(target);
            document.querySelectorAll('.__ss-ide-hover').forEach(function(n) { n.classList.remove('__ss-ide-hover'); });
            if (el && el !== document.body && el !== document.documentElement) {
                el.classList.add('__ss-ide-hover');
            }
        }, true);

        document.addEventListener('mouseout', function() {
            document.querySelectorAll('.__ss-ide-hover').forEach(function(n) { n.classList.remove('__ss-ide-hover'); });
        }, true);

        document.addEventListener('click', function(e) {
            var target = e.target;
            if (!target || target === document.body || target === document.documentElement) return;

            e.preventDefault();
            e.stopPropagation();

            var el = findLineElement(target) || target;
            var lineAttr = el.getAttribute ? el.getAttribute('data-ss-line') : null;
            var lineNum = lineAttr ? parseInt(lineAttr, 10) : 1;
            var tag = (el.getAttribute && el.getAttribute('data-ss-tag')) || (el.tagName ? el.tagName.toLowerCase() : 'element');

            document.querySelectorAll('.__ss-ide-selected').forEach(function(n) { n.classList.remove('__ss-ide-selected'); });
            if (el.classList) el.classList.add('__ss-ide-selected');

            var oldPill = document.getElementById('__ss-ide-pill__');
            if (oldPill) oldPill.remove();

            var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
            if (rect) {
                var pill = document.createElement('div');
                pill.id = '__ss-ide-pill__';
                pill.className = '__ss-ide-pill';
                var topPos = rect.top + (window.scrollY || 0) - 34;
                pill.style.top = (topPos < 0 ? rect.bottom + (window.scrollY || 0) + 6 : topPos) + 'px';
                pill.style.left = Math.max(6, rect.left + (window.scrollX || 0)) + 'px';
                pill.innerHTML = '<span>&lt;' + tag + '&gt; Line ' + lineNum + '</span>';
                document.body.appendChild(pill);
            }

            try {
                window.parent.postMessage({
                    type: 'SS_IDE_ELEMENT_CLICKED',
                    line: lineNum,
                    tag: tag,
                    snippet: el.outerHTML ? el.outerHTML.slice(0, 100) : ''
                }, '*');
            } catch(err) {}
        }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInspector);
    } else {
        initInspector();
    }
})();
</script>
`;

        let combined = annotatedLines.join('\n');
        if (combined.includes('</body>')) {
            combined = combined.replace('</body>', `${clientInspectorScript}\n</body>`);
        } else {
            combined = combined + '\n' + clientInspectorScript;
        }
        return combined;
    }, [debouncedHtml]);

    const lines = useMemo(() => html.split('\n'), [html]);
    const totalLines = lines.length;

    // Scroll and highlight code editor to a specific line
    const scrollToLine = useCallback((lineNum: number, tag?: string, snippet?: string) => {
        setActiveLine(lineNum);
        if (tag) setActiveTag(tag);
        if (snippet) setActiveSnippet(snippet);

        // Always switch to inspector view when an element is clicked so the highlight is 100% visible
        setEditorViewMode('inspector');

        // Scroll to the line in Inspector View
        setTimeout(() => {
            const targetEl = document.getElementById(`ide-code-line-${lineNum}`);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);

        // Also update textarea scroll and selection in case user toggles to raw mode
        if (textareaRef.current) {
            let charStart = 0;
            for (let i = 0; i < lineNum - 1 && i < lines.length; i++) {
                charStart += lines[i].length + 1;
            }
            const lineContent = lines[lineNum - 1] || '';
            const charEnd = charStart + lineContent.length;

            const scrollRatio = (lineNum - 1) / Math.max(1, lines.length);
            const maxScroll = textareaRef.current.scrollHeight - textareaRef.current.clientHeight;
            textareaRef.current.scrollTop = Math.max(0, scrollRatio * maxScroll);

            try {
                textareaRef.current.setSelectionRange(charStart, charEnd);
            } catch {
                // Ignore focus/selection errors
            }
        }
    }, [lines]);

    // Handle incoming click postMessage from the live preview iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'SS_IDE_ELEMENT_CLICKED') {
                const { line, tag, snippet } = event.data;
                if (typeof line === 'number') {
                    scrollToLine(line, tag, snippet);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [scrollToLine]);

    // Scroll to initialLine if provided
    useEffect(() => {
        if (initialLine && initialLine > 0 && initialLine <= lines.length) {
            scrollToLine(initialLine);
        }
    }, [initialLine, scrollToLine, lines.length]);

    // Handle line save in inline editor
    const handleSaveLineEdit = (lineNum: number, newText: string) => {
        const newLines = [...lines];
        newLines[lineNum - 1] = newText;
        const updated = newLines.join('\n');
        onChange(updated);
        onCommit(updated);
        setEditingLineNum(null);
        toast.success(`Updated Line ${lineNum}`);
    };

    // Synchronize gutter scrolling with textarea in raw mode
    const handleScroll = () => {
        if (textareaRef.current && gutterRef.current) {
            gutterRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    // Update cursor position tracking in raw mode
    const updateCursorPos = () => {
        if (!textareaRef.current) return;
        const selStart = textareaRef.current.selectionStart || 0;
        const textUpToCursor = html.slice(0, selStart);
        const cursorLines = textUpToCursor.split('\n');
        const line = cursorLines.length;
        const col = (cursorLines[cursorLines.length - 1] || '').length + 1;
        setCursorPos({ line, col });
    };

    // Inject iframe interaction script when preview loads
    const onIframeLoad = () => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument) return;
        const doc = iframe.contentDocument;

        // Inject custom styles for live inspector
        let style = doc.getElementById('__ss_ide_preview_styles__');
        if (!style) {
            style = doc.createElement('style');
            style.id = '__ss_ide_preview_styles__';
            style.textContent = `
                .__ss-ide-hover {
                    outline: 2px dashed #3b82f6 !important;
                    outline-offset: -1px !important;
                    cursor: pointer !important;
                }
                .__ss-ide-selected {
                    outline: 2.5px solid #8b5cf6 !important;
                    outline-offset: 1px !important;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.35) !important;
                }
                .__ss-ide-floating-pill {
                    position: absolute !important;
                    background: #18181b !important;
                    color: #ffffff !important;
                    font-size: 11px !important;
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
                    padding: 4px 8px !important;
                    border-radius: 6px !important;
                    border: 1px solid #3f3f46 !important;
                    z-index: 2147483647 !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
                    pointer-events: auto !important;
                    white-space: nowrap !important;
                    animation: __ss_fade_in 0.15s ease-out !important;
                }
                @keyframes __ss_fade_in {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            (doc.head || doc.documentElement).appendChild(style);
        }

        // Hover effect
        const handleMouseOver = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('[data-ss-line]') as HTMLElement | null;
            doc.querySelectorAll('.__ss-ide-hover').forEach(el => el.classList.remove('__ss-ide-hover'));
            if (target && target !== doc.body && target !== doc.documentElement) {
                target.classList.add('__ss-ide-hover');
            }
        };

        const handleMouseOut = () => {
            doc.querySelectorAll('.__ss-ide-hover').forEach(el => el.classList.remove('__ss-ide-hover'));
        };

        // Click to code line
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('[data-ss-line]') as HTMLElement | null;
            if (!target || target === doc.body || target === doc.documentElement) return;

            e.preventDefault();
            e.stopPropagation();

            const lineAttr = target.getAttribute('data-ss-line');
            const tagAttr = target.getAttribute('data-ss-tag') || target.tagName.toLowerCase();
            const lineNum = lineAttr ? parseInt(lineAttr, 10) : 1;

            // Highlight selected in iframe
            doc.querySelectorAll('.__ss-ide-selected').forEach(el => el.classList.remove('__ss-ide-selected'));
            target.classList.add('__ss-ide-selected');

            // Render floating pill above element
            doc.getElementById('__ss-ide-floating-pill__')?.remove();
            const pill = doc.createElement('div');
            pill.id = '__ss-ide-floating-pill__';
            pill.className = '__ss-ide-floating-pill';

            const rect = target.getBoundingClientRect();
            const win = doc.defaultView || iframe.contentWindow;
            const sx = win ? (win.scrollX || win.pageXOffset || doc.documentElement.scrollLeft || 0) : 0;
            const sy = win ? (win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0) : 0;

            const topPos = rect.top + sy - 34;
            pill.style.top = `${topPos < 0 ? rect.bottom + sy + 6 : topPos}px`;
            pill.style.left = `${Math.max(6, rect.left + sx)}px`;

            pill.innerHTML = `
                <span style="display:inline-flex; align-items:center; gap:4px; font-weight:700; color:#a78bfa;">
                    &lt;${tagAttr}&gt; Line ${lineNum}
                </span>
                <span style="color:#71717a;">|</span>
                <button id="__ss_btn_del__" style="background:#dc2626; color:white; border:none; padding:2px 6px; border-radius:4px; font-size:10px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:2px;">
                    🗑 Delete
                </button>
            `;

            doc.body.appendChild(pill);

            // Delete button on floating pill
            const delBtn = pill.querySelector('#__ss_btn_del__');
            if (delBtn) {
                delBtn.addEventListener('click', (de) => {
                    de.preventDefault();
                    de.stopPropagation();
                    handleDeleteElement(lineNum, target);
                });
            }

            // Scroll code editor to this line and highlight it
            scrollToLine(lineNum, tagAttr, target.outerHTML.slice(0, 100));
        };

        doc.addEventListener('mouseover', handleMouseOver);
        doc.addEventListener('mouseout', handleMouseOut);
        doc.addEventListener('click', handleClick, true);
    };

    // Delete an element by line number and DOM reference
    const handleDeleteElement = (targetLine?: number, targetEl?: HTMLElement) => {
        const lineToDelete = targetLine || activeLine;
        if (!lineToDelete) {
            toast.error('No element selected to delete');
            return;
        }

        // Try direct DOM removal via iframe if available
        const iframeDoc = iframeRef.current?.contentDocument;
        let removedFromIframe = false;

        if (iframeDoc) {
            const el = targetEl || iframeDoc.querySelector(`[data-ss-line="${lineToDelete}"]`) as HTMLElement;
            if (el && el !== iframeDoc.body && el !== iframeDoc.documentElement) {
                el.remove();
                iframeDoc.getElementById('__ss-ide-floating-pill__')?.remove();

                // Serialize cleaned HTML
                const clone = iframeDoc.documentElement.cloneNode(true) as HTMLElement;
                clone.querySelectorAll('[data-ss-line], [data-ss-tag], .__ss-ide-hover, .__ss-ide-selected').forEach(n => {
                    n.removeAttribute('data-ss-line');
                    n.removeAttribute('data-ss-tag');
                    n.classList.remove('__ss-ide-hover', '__ss-ide-selected');
                });
                clone.querySelectorAll('#__ss_ide_preview_styles__, #__ss-ide-floating-pill__').forEach(n => n.remove());

                const cleanedHtml = '<!DOCTYPE html>\n' + clone.outerHTML;
                onChange(cleanedHtml);
                onCommit(cleanedHtml);
                removedFromIframe = true;
            }
        }

        if (!removedFromIframe) {
            // Fallback: remove the line directly from text
            const newLines = [...lines];
            newLines.splice(lineToDelete - 1, 1);
            const updated = newLines.join('\n');
            onChange(updated);
            onCommit(updated);
        }

        setActiveLine(null);
        setActiveTag(null);
        setActiveSnippet(null);
        toast.success(`Element removed from page (Line ${lineToDelete})`);
    };

    // Format HTML Code
    const handleFormatCode = () => {
        let indent = 0;
        const tab = '  ';
        const tokens = html.replace(/>\s*</g, '><').match(/<[^>]+>|[^<]+/g) || [];
        const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);

        let formatted = '';
        for (const token of tokens) {
            const trimmed = token.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('<!--')) {
                formatted += tab.repeat(indent) + trimmed + '\n';
            } else if (trimmed.startsWith('</')) {
                indent = Math.max(0, indent - 1);
                formatted += tab.repeat(indent) + trimmed + '\n';
            } else if (trimmed.startsWith('<') && !trimmed.startsWith('<!')) {
                const tagName = (trimmed.match(/<([a-zA-Z0-9\-]+)/)?.[1] || '').toLowerCase();
                const isSelfClosing = trimmed.endsWith('/>') || voidTags.has(tagName);

                formatted += tab.repeat(indent) + trimmed + '\n';
                if (!isSelfClosing) {
                    indent++;
                }
            } else {
                formatted += tab.repeat(indent) + trimmed + '\n';
            }
        }

        const result = formatted.trim();
        onChange(result);
        onCommit(result);
        toast.success('HTML code formatted & cleaned');
    };

    // Search matches calculation
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }

        const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches: number[] = [];
        let match;
        while ((match = regex.exec(html)) !== null) {
            matches.push(match.index);
        }
        setSearchMatches(matches);
        setCurrentMatchIndex(matches.length > 0 ? 0 : -1);

        if (matches.length > 0 && textareaRef.current) {
            const idx = matches[0];
            textareaRef.current.setSelectionRange(idx, idx + searchQuery.length);
            textareaRef.current.focus();
        }
    }, [searchQuery, html]);

    const handleNextMatch = () => {
        if (searchMatches.length === 0 || !textareaRef.current) return;
        const nextIdx = (currentMatchIndex + 1) % searchMatches.length;
        setCurrentMatchIndex(nextIdx);
        const charPos = searchMatches[nextIdx];
        textareaRef.current.setSelectionRange(charPos, charPos + searchQuery.length);
        textareaRef.current.focus();
    };

    const handlePrevMatch = () => {
        if (searchMatches.length === 0 || !textareaRef.current) return;
        const prevIdx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
        setCurrentMatchIndex(prevIdx);
        const charPos = searchMatches[prevIdx];
        textareaRef.current.setSelectionRange(charPos, charPos + searchQuery.length);
        textareaRef.current.focus();
    };

    const handleReplace = () => {
        if (currentMatchIndex === -1 || searchMatches.length === 0 || !textareaRef.current) return;
        const charPos = searchMatches[currentMatchIndex];
        const newHtml = html.slice(0, charPos) + replaceQuery + html.slice(charPos + searchQuery.length);
        onChange(newHtml);
        onCommit(newHtml);
    };

    const handleReplaceAll = () => {
        if (!searchQuery) return;
        const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const count = searchMatches.length;
        const newHtml = html.replace(regex, replaceQuery);
        onChange(newHtml);
        onCommit(newHtml);
        toast.success(`Replaced ${count} occurrences`);
    };

    // Insert Element snippet at cursor or after active line
    const handleInsertSnippet = (snippet: string, title: string) => {
        if (editorViewMode === 'inspector' && activeLine) {
            // Insert right after the active line
            const newLines = [...lines];
            newLines.splice(activeLine, 0, snippet);
            const updated = newLines.join('\n');
            onChange(updated);
            onCommit(updated);
            scrollToLine(activeLine + 1);
        } else if (textareaRef.current && editorViewMode === 'raw') {
            const selStart = textareaRef.current.selectionStart || 0;
            const selEnd = textareaRef.current.selectionEnd || 0;

            const updated = html.slice(0, selStart) + '\n' + snippet + '\n' + html.slice(selEnd);
            onChange(updated);
            onCommit(updated);
        } else {
            // Append before </body> if no specific line
            let updated = html;
            if (updated.includes('</body>')) {
                updated = updated.replace('</body>', `\n${snippet}\n</body>`);
            } else {
                updated += `\n${snippet}\n`;
            }
            onChange(updated);
            onCommit(updated);
        }

        setIsAddElementOpen(false);
        toast.success(`Inserted ${title} into HTML`);
    };

    // Pre-designed accessible component snippets
    const componentSnippets = {
        buttons: [
            {
                name: 'Primary Gradient Button',
                desc: 'High-contrast modern CTA button with hover elevation',
                code: `<a href="#contact" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200">\n  <span>Get Started Now</span>\n  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>\n</a>`,
            },
            {
                name: 'Outline Minimal Button',
                desc: 'Subtle bordered action button for secondary links',
                code: `<a href="#about" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-700 bg-transparent text-zinc-200 hover:text-white hover:bg-zinc-800 font-medium text-sm transition-colors">\n  <span>Learn More</span>\n</a>`,
            },
            {
                name: 'Booking Portal CTA',
                desc: 'Direct appointment link connected to project booking token',
                code: `<!-- SS-BOOKING-CTA-START -->\n<a href="${project.booking_public_token ? `/book/entry/${project.booking_public_token}` : '#'}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md">\n  <span>📅 Book an Appointment</span>\n</a>\n<!-- SS-BOOKING-CTA-END -->`,
            },
        ],
        typography: [
            {
                name: 'Modern Gradient Headline (H2)',
                desc: 'Large title with gradient accent for section headers',
                code: `<div class="text-center max-w-3xl mx-auto mb-12">\n  <span class="text-xs font-bold uppercase tracking-wider text-primary">Signature Experience</span>\n  <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mt-2">\n    Crafted with <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">Excellence</span>\n  </h2>\n  <p class="text-base text-muted-foreground mt-4 leading-relaxed">\n    Designed to tell your unique story with timeless style and modern elegance.\n  </p>\n</div>`,
            },
            {
                name: 'Editorial Lead Paragraph',
                desc: 'Polished intro text block with balanced line height',
                code: `<p class="text-lg sm:text-xl text-zinc-300 font-light leading-relaxed max-w-2xl">\n  Every detail is intentionally composed to create an unforgettable visual presence that resonates with your audience.\n</p>`,
            },
            {
                name: 'Status Badge / Tag',
                desc: 'Small rounded pill badge for highlights and labels',
                code: `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs">\n  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>\n  <span>Available for Bookings</span>\n</span>`,
            },
        ],
        cards: [
            {
                name: 'Bento Feature Card',
                desc: 'Rounded dark card with icon, title, and descriptive text',
                code: `<div class="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all shadow-lg group">\n  <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">\n    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>\n  </div>\n  <h3 class="text-xl font-bold text-white mb-2">High-Performance Delivery</h3>\n  <p class="text-sm text-zinc-400 leading-relaxed mb-4">Optimized for speed, modern devices, and instant engagement across all platforms.</p>\n  <a href="#details" class="text-xs font-bold text-primary group-hover:underline inline-flex items-center gap-1">Explore details &rarr;</a>\n</div>`,
            },
            {
                name: 'Pricing Tier Card',
                desc: 'Clean pricing card with cost, features list, and action button',
                code: `<div class="p-8 rounded-3xl bg-zinc-900 border-2 border-primary/40 relative shadow-2xl flex flex-col justify-between">\n  <div class="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-primary text-white text-xs font-bold shadow-md">POPULAR</div>\n  <div>\n    <h3 class="text-xl font-bold text-white">Full Experience</h3>\n    <p class="text-xs text-zinc-400 mt-1">Everything you need from start to finish</p>\n    <div class="my-6">\n      <span class="text-4xl font-extrabold text-white">$1,499</span>\n      <span class="text-xs text-zinc-400"> / package</span>\n    </div>\n    <ul class="space-y-3 text-sm text-zinc-300 mb-8">\n      <li class="flex items-center gap-2">✓ Full day photography coverage</li>\n      <li class="flex items-center gap-2">✓ 400+ high-resolution edited images</li>\n      <li class="flex items-center gap-2">✓ Online client gallery with download</li>\n    </ul>\n  </div>\n  <a href="#book" class="w-full py-3 rounded-xl bg-primary text-white text-center font-bold text-sm hover:opacity-90 transition-opacity">Select Package</a>\n</div>`,
            },
        ],
        forms: [
            {
                name: 'Contact Form Section',
                desc: 'Full responsive Contact Us section wired to StudioSync emailer endpoint',
                code: `<!-- SS-CONTACT-FORM-START -->\n<section id="contact" style="padding: 60px 20px; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">\n  <div style="text-align: center; margin-bottom: 28px;">\n    <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">Contact Us</h2>\n    <p style="font-size: 14px; opacity: 0.8;">Send us a message and we will respond as soon as possible.</p>\n  </div>\n  <form id="contact-form" data-contact style="display: flex; flex-direction: column; gap: 14px;">\n    <div>\n      <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Your Name</label>\n      <input type="text" name="name" required placeholder="John Doe" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d4d4d8; font-size: 14px;" />\n    </div>\n    <div>\n      <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Email Address</label>\n      <input type="email" name="email" required placeholder="john@example.com" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d4d4d8; font-size: 14px;" />\n    </div>\n    <div>\n      <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Subject</label>\n      <input type="text" name="subject" placeholder="General Inquiry" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d4d4d8; font-size: 14px;" />\n    </div>\n    <div>\n      <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Message</label>\n      <textarea name="message" required rows="4" placeholder="Write your message here..." style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d4d4d8; font-size: 14px;"></textarea>\n    </div>\n    <button type="submit" style="padding: 12px 20px; background-color: #4f46e5; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">\n      Send Message\n    </button>\n  </form>\n</section>\n<!-- SS-CONTACT-FORM-END -->`,
            },
            {
                name: 'Newsletter Email Input',
                desc: 'Inline email newsletter subscription input with submit button',
                code: `<div class="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">\n  <input type="email" placeholder="Enter your email address..." class="w-full sm:flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary" />\n  <button type="button" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shrink-0">Subscribe</button>\n</div>`,
            },
        ],
        containers: [
            {
                name: '2-Column Responsive Grid',
                desc: 'Side-by-side layout collapsing to 1 column on mobile',
                code: `<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto py-12">\n  <div>\n    <h3 class="text-2xl sm:text-3xl font-bold text-white mb-4">Capturing Authentic Moments</h3>\n    <p class="text-zinc-400 text-sm leading-relaxed mb-6">Our passion is documenting genuine connections with natural light, organic emotions, and timeless storytelling.</p>\n    <a href="#services" class="text-primary font-bold text-sm inline-flex items-center gap-1">Discover Services &rarr;</a>\n  </div>\n  <div class="rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">\n    <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80" alt="Showcase" class="w-full h-80 object-cover" />\n  </div>\n</div>`,
            },
            {
                name: '3-Column Features Grid',
                desc: 'Equal-width 3 column container for showcases and features',
                code: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto py-10">\n  <!-- Column 1 -->\n  <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">\n    <h4 class="text-lg font-bold text-white mb-2">Artistic Vision</h4>\n    <p class="text-xs text-zinc-400">Thoughtfully composed framing and intentional lighting.</p>\n  </div>\n  <!-- Column 2 -->\n  <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">\n    <h4 class="text-lg font-bold text-white mb-2">High Resolution</h4>\n    <p class="text-xs text-zinc-400">Ultra-sharp images perfected for fine-art print albums.</p>\n  </div>\n  <!-- Column 3 -->\n  <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">\n    <h4 class="text-lg font-bold text-white mb-2">Personal Service</h4>\n    <p class="text-xs text-zinc-400">Dedicated guidance from initial inquiry to final delivery.</p>\n  </div>\n</div>`,
            },
        ],
        media: [
            {
                name: 'Full-Bleed Rounded Image',
                desc: 'Responsive image with subtle border and zoom hover effect',
                code: `<div class="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group max-w-4xl mx-auto my-8">\n  <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80" alt="Featured Photo" class="w-full h-96 object-cover group-hover:scale-102 transition-transform duration-500" />\n</div>`,
            },
        ],
    };

    return (
        <div className="w-full h-full flex flex-col min-w-0 min-h-0 bg-zinc-950 text-zinc-100 overflow-hidden select-none">
            {/* Top IDE Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0 text-xs">
                {/* Left: File Badge & View Mode Switcher */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-white font-mono font-medium text-xs border border-zinc-700/70 shadow-xs">
                        <FileCode className="w-3.5 h-3.5 text-amber-500" />
                        <span>index.html</span>
                        {activeLine && (
                            <span className="text-[10px] text-primary font-bold ml-1 px-1.5 py-0.2 rounded bg-primary/20">
                                Line {activeLine}
                            </span>
                        )}
                    </div>

                    {/* Mode Toggle: Line Inspector vs Raw Editor */}
                    <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-700/80">
                        <button
                            type="button"
                            onClick={() => setEditorViewMode('inspector')}
                            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                                editorViewMode === 'inspector'
                                    ? 'bg-violet-600 text-white font-bold shadow-xs'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Line Inspector with interactive highlight & element actions"
                        >
                            <ListTree className="w-3.5 h-3.5" />
                            <span>Inspector View</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditorViewMode('raw')}
                            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                                editorViewMode === 'raw'
                                    ? 'bg-violet-600 text-white font-bold shadow-xs'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Raw Source Textarea Editor"
                        >
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Raw Editor</span>
                        </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Add Element Palette Button */}
                    <button
                        type="button"
                        onClick={() => setIsAddElementOpen(true)}
                        className="px-2.5 py-1 rounded-md font-semibold text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Add pre-designed components and elements into HTML"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Element</span>
                    </button>

                    {/* Format Code */}
                    <button
                        type="button"
                        onClick={handleFormatCode}
                        className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        title="Clean and re-indent HTML markup"
                    >
                        <Paintbrush className="w-3.5 h-3.5 text-sky-400" />
                        <span className="hidden md:inline">Format</span>
                    </button>

                    {/* Search / Find in code */}
                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(prev => !prev)}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            isSearchOpen ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                        title="Find & Replace in HTML (Ctrl+F)"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Injections */}
                    <button
                        type="button"
                        onClick={onInsertBookingCta}
                        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-semibold text-[11px] cursor-pointer ${
                            clientRequest?.category === 'booking_system'
                                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400 hover:bg-emerald-500'
                                : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30'
                        }`}
                        title="Inject Booking Portal CTA button"
                    >
                        <Calendar className="w-3 h-3" />
                        <span>+ Booking CTA</span>
                    </button>

                    <button
                        type="button"
                        onClick={onInsertContactForm}
                        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-semibold text-[11px] cursor-pointer ${
                            clientRequest?.category === 'email_integration'
                                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] ring-1 ring-blue-400 hover:bg-blue-500'
                                : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'
                        }`}
                        title="Inject Contact Form section (<section id='contact'><form id='contact-form' data-contact>)"
                    >
                        <Mail className="w-3 h-3" />
                        <span>+ Contact Form</span>
                    </button>

                    {/* Copy All */}
                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(html);
                            toast.success('Entire HTML copied to clipboard');
                        }}
                        className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy entire HTML markup"
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-zinc-700">|</span>

                    {/* Device Selector for Split Preview */}
                    <div className="flex items-center bg-zinc-800 rounded-md p-0.5 border border-zinc-700/60">
                        <button
                            type="button"
                            onClick={() => onChangePreviewDevice('desktop')}
                            className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                                codePreviewDevice === 'desktop' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Full Desktop"
                        >
                            <Monitor className="w-3 h-3" />
                            <span className="hidden sm:inline">Desktop</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onChangePreviewDevice('tablet')}
                            className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                                codePreviewDevice === 'tablet' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Tablet (768px)"
                        >
                            <Tablet className="w-3 h-3" />
                            <span className="hidden sm:inline">Tablet</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onChangePreviewDevice('mobile')}
                            className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                                codePreviewDevice === 'mobile' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Mobile (375px)"
                        >
                            <Smartphone className="w-3 h-3" />
                            <span className="hidden sm:inline">Mobile</span>
                        </button>
                    </div>

                    {/* Open in new tab */}
                    <button
                        type="button"
                        onClick={() => {
                            const blob = new Blob([html], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                        }}
                        className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Open rendered page in new browser tab"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Find and Replace Panel (Collapsible) */}
            {isSearchOpen && (
                <div className="flex flex-wrap items-center gap-2 p-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs shrink-0 backdrop-blur-xs">
                    <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-700">
                        <Search className="w-3.5 h-3.5 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find..."
                            className="bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none w-36 sm:w-48 font-mono"
                        />
                        {searchMatches.length > 0 && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                                {currentMatchIndex + 1}/{searchMatches.length}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={handlePrevMatch}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            title="Previous match"
                        >
                            <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleNextMatch}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            title="Next match"
                        >
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-700">
                        <Replace className="w-3.5 h-3.5 text-zinc-400" />
                        <input
                            type="text"
                            value={replaceQuery}
                            onChange={(e) => setReplaceQuery(e.target.value)}
                            placeholder="Replace with..."
                            className="bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none w-36 sm:w-48 font-mono"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleReplace}
                        disabled={currentMatchIndex === -1}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 cursor-pointer text-xs"
                    >
                        Replace
                    </button>

                    <button
                        type="button"
                        onClick={handleReplaceAll}
                        disabled={searchMatches.length === 0}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 cursor-pointer text-xs"
                    >
                        Replace All
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-1 ml-auto text-zinc-400 hover:text-white cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Active Element Banner (Visible whenever an element is highlighted) */}
            {activeLine && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gradient-to-r from-amber-950/90 via-zinc-900 to-zinc-900 border-b border-amber-800/80 text-xs text-amber-200 shrink-0 shadow-md">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                        <span className="font-bold text-white tracking-wide">Selected Element:</span>
                        <span className="font-mono bg-amber-900/80 px-2.5 py-0.5 rounded-full text-amber-200 font-bold border border-amber-700/80 shadow-xs">
                            &lt;{activeTag || 'element'}&gt; on Line {activeLine}
                        </span>
                        <span className="text-zinc-400 text-[11px] font-mono truncate max-w-sm hidden md:inline">
                            {lines[activeLine - 1]?.trim().slice(0, 70)}...
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setEditorViewMode('inspector');
                                setTimeout(() => {
                                    document.getElementById(`ide-code-line-${activeLine}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 30);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                            Focus in Code
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDeleteElement(activeLine)}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Remove this element from code and preview"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete Element</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLine(null)}
                            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                            title="Dismiss highlight"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Split Body: Left Code Editor, Right Live Iframe */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 overflow-hidden min-h-0 min-w-0">
                {/* Left Pane: Code Editor with Line Inspector or Raw Mode */}
                <div className="h-full flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl min-h-0">
                    {/* Sub-header with mode and formatting tools */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-200">
                                {editorViewMode === 'inspector' ? 'Line Inspector (Active Line Highlighted)' : 'Raw HTML Editor'}
                            </span>
                            <span className="text-zinc-600">&bull;</span>
                            <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Sync
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px]">
                            {/* Font size toggles */}
                            <div className="flex items-center gap-1 bg-zinc-800/60 px-1.5 py-0.5 rounded border border-zinc-700/60">
                                <button
                                    type="button"
                                    onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
                                    className="hover:text-white cursor-pointer"
                                    title="Decrease font size"
                                >
                                    A-
                                </button>
                                <span className="text-zinc-400">{fontSize}px</span>
                                <button
                                    type="button"
                                    onClick={() => setFontSize(prev => Math.min(18, prev + 1))}
                                    className="hover:text-white cursor-pointer"
                                    title="Increase font size"
                                >
                                    A+
                                </button>
                            </div>

                            {/* Word wrap toggle */}
                            <button
                                type="button"
                                onClick={() => setWordWrap(prev => !prev)}
                                className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                                    wordWrap ? 'bg-primary/20 text-primary border-primary/40' : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
                                }`}
                                title="Toggle word wrap"
                            >
                                Wrap
                            </button>
                        </div>
                    </div>

                    {/* Editor Body */}
                    {editorViewMode === 'inspector' ? (
                        /* INTERACTIVE LINE INSPECTOR WITH VIVID GLOWING HIGHLIGHT */
                        <div
                            ref={inspectorContainerRef}
                            style={{ fontSize: `${fontSize}px` }}
                            className="flex-1 overflow-y-auto min-h-0 bg-zinc-950 font-mono select-text divide-y divide-zinc-900/60"
                        >
                            {lines.map((lineContent, idx) => {
                                const lineNum = idx + 1;
                                const isActive = activeLine === lineNum;
                                return (
                                    <div
                                        id={`ide-code-line-${lineNum}`}
                                        key={lineNum}
                                        onClick={() => {
                                            setActiveLine(lineNum);
                                        }}
                                        className={`flex items-start transition-all px-2 py-1.5 border-l-4 group relative ${
                                            isActive
                                                ? 'bg-amber-950/75 border-amber-400 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/60'
                                                : 'border-transparent text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
                                        }`}
                                    >
                                        {/* Line Number Gutter */}
                                        <span className={`w-12 shrink-0 select-none text-right pr-3 font-mono text-[11px] pt-0.5 ${
                                            isActive ? 'text-amber-400 font-bold' : 'text-zinc-600 group-hover:text-zinc-400'
                                        }`}>
                                            {isActive ? '▶ ' + lineNum : lineNum}
                                        </span>

                                        {/* Line Code Content */}
                                        <div className="flex-1 min-w-0 pr-2">
                                            {editingLineNum === lineNum ? (
                                                <div className="flex items-center gap-2 w-full my-0.5">
                                                    <input
                                                        type="text"
                                                        value={editingLineText}
                                                        onChange={(e) => setEditingLineText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveLineEdit(lineNum, editingLineText);
                                                            if (e.key === 'Escape') setEditingLineNum(null);
                                                        }}
                                                        className="flex-1 px-2.5 py-1 bg-zinc-900 border border-primary text-white font-mono text-xs rounded-md outline-none shadow-inner"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSaveLineEdit(lineNum, editingLineText)}
                                                        className="px-2.5 py-1 rounded bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors cursor-pointer"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingLineNum(null)}
                                                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`block whitespace-pre-wrap break-all ${isActive ? 'text-amber-100 font-semibold' : ''}`}>
                                                    {lineContent || <span className="text-zinc-800 select-none">&nbsp;</span>}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons on Active Line */}
                                        {isActive && editingLineNum !== lineNum && (
                                            <div className="shrink-0 flex items-center gap-1.5 ml-2 pt-0.5">
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-sans font-bold shadow-xs">
                                                    &lt;{activeTag || 'element'}&gt;
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingLineNum(lineNum);
                                                        setEditingLineText(lineContent);
                                                    }}
                                                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                                    title="Edit this line directly"
                                                >
                                                    <span>✎ Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteElement(lineNum);
                                                    }}
                                                    className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                                    title="Delete this element from code"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* RAW SOURCE TEXTAREA EDITOR */
                        <div className="flex-1 flex overflow-hidden min-h-0 relative">
                            {/* Line Numbers Gutter */}
                            <div
                                ref={gutterRef}
                                className="w-12 bg-zinc-950/90 text-zinc-500 font-mono text-xs select-none text-right py-3 pr-2.5 overflow-hidden border-r border-zinc-800 shrink-0"
                                style={{ fontSize: `${fontSize}px` }}
                            >
                                {lines.map((_, idx) => {
                                    const lineNum = idx + 1;
                                    const isActive = activeLine === lineNum;
                                    return (
                                        <div
                                            key={lineNum}
                                            style={{ height: '20px', lineHeight: '20px' }}
                                            onClick={() => scrollToLine(lineNum)}
                                            className={`cursor-pointer transition-colors ${
                                                isActive
                                                    ? 'text-primary font-bold bg-primary/25 -mr-2.5 pr-2.5 rounded-l text-shadow-sm'
                                                    : 'hover:text-zinc-200'
                                            }`}
                                        >
                                            {isActive ? '▶' : lineNum}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={html}
                                onChange={(e) => {
                                    onChange(e.target.value);
                                }}
                                onBlur={() => {
                                    onCommit(html);
                                }}
                                onScroll={handleScroll}
                                onKeyUp={updateCursorPos}
                                onClick={updateCursorPos}
                                style={{
                                    fontSize: `${fontSize}px`,
                                    lineHeight: '20px',
                                }}
                                className={`flex-1 w-full bg-zinc-950 font-mono text-zinc-100 p-3 outline-none border-none resize-none select-text min-h-0 leading-[20px] ${
                                    wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
                                }`}
                                spellCheck={false}
                                placeholder="<!DOCTYPE html><html>...</html>"
                            />
                        </div>
                    )}

                    {/* IDE Bottom Status Bar */}
                    <div className="flex items-center justify-between px-3 py-1 bg-zinc-900 border-t border-zinc-800 text-[10px] font-mono text-zinc-400 shrink-0">
                        <div className="flex items-center gap-3">
                            <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                            <span>{totalLines} lines</span>
                            <span>{html.length.toLocaleString()} chars</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {activeTag && (
                                <span className="text-violet-400 font-semibold">
                                    Active: &lt;{activeTag}&gt; (Line {activeLine})
                                </span>
                            )}
                            <span>HTML5</span>
                            <span>UTF-8</span>
                            <span>Spaces: 2</span>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Live Iframe with Click-to-Code Inspector */}
                <div className="h-full flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800 p-3 shadow-2xl overflow-hidden min-h-0 min-w-0">
                    {/* Preview Top Header */}
                    <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-200">Live Preview</span>
                            <span className="text-zinc-600">&bull;</span>
                            <span className="text-primary text-[10px] flex items-center gap-1 font-sans font-semibold">
                                <MousePointer className="w-3 h-3" />
                                Click-to-Code Inspector Active
                            </span>
                        </div>
                        <span className="text-zinc-500">
                            {codePreviewDevice === 'desktop' ? 'Full Desktop' : codePreviewDevice === 'tablet' ? '768px Tablet' : '375px Mobile'}
                        </span>
                    </div>

                    {/* Frame Container */}
                    <div
                        className={`w-full flex-1 flex items-center justify-center transition-all duration-300 min-h-0 overflow-hidden ${
                            codePreviewDevice === 'desktop'
                                ? 'max-w-full'
                                : codePreviewDevice === 'tablet'
                                ? 'max-w-[768px]'
                                : 'max-w-[375px]'
                        }`}
                    >
                        <div className="w-full h-full bg-white rounded-lg shadow-2xl border border-zinc-700/60 overflow-hidden relative flex flex-col min-w-0">
                            {codePreviewDevice !== 'desktop' && (
                                <div className="h-6 bg-zinc-800 text-zinc-400 text-[10px] flex items-center justify-between px-3 border-b border-zinc-700 select-none shrink-0">
                                    <span className="font-mono">
                                        {codePreviewDevice === 'tablet' ? '768px (Tablet)' : '375px (Mobile)'}
                                    </span>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                                        <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                                    </div>
                                </div>
                            )}

                            <iframe
                                ref={iframeRef}
                                srcDoc={annotatedSrcDoc}
                                onLoad={onIframeLoad}
                                title="Code Mode Real-time Preview"
                                className="w-full h-full border-none bg-white flex-1"
                                sandbox="allow-scripts allow-same-origin allow-forms"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Element Component Palette Modal */}
            {isAddElementOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Add Element to Website</h3>
                                    <p className="text-xs text-zinc-400">
                                        {activeLine
                                            ? `Component will be inserted right after Line ${activeLine} (<${activeTag || 'element'}>)`
                                            : 'Component will be inserted at cursor or end of page'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddElementOpen(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Category Selector Tabs */}
                        <div className="flex items-center gap-1 p-2 bg-zinc-950 border-b border-zinc-800 overflow-x-auto text-xs">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('buttons')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                                    selectedCategory === 'buttons' ? 'bg-primary text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                Buttons &amp; CTAs
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('typography')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                                    selectedCategory === 'typography' ? 'bg-primary text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                Typography &amp; Headings
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('cards')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                                    selectedCategory === 'cards' ? 'bg-primary text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                Cards &amp; Features
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('forms')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                                    selectedCategory === 'forms' ? 'bg-primary text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                Forms &amp; Inquiries
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('containers')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                                    selectedCategory === 'containers' ? 'bg-primary text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                Layout &amp; Grids
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('media')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                                    selectedCategory === 'media' ? 'bg-primary text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                Media &amp; Images
                            </button>
                        </div>

                        {/* Component Cards Grid */}
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {componentSnippets[selectedCategory].map((comp, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 group"
                                >
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                            {comp.name}
                                        </h4>
                                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                                            {comp.desc}
                                        </p>
                                    </div>

                                    <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80 font-mono text-[10px] text-zinc-400 overflow-hidden max-h-20 select-all">
                                        <code>{comp.code.slice(0, 120)}...</code>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleInsertSnippet(comp.code, comp.name)}
                                        className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Insert into HTML</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
                            <span>
                                {activeLine
                                    ? `Will insert after Line ${activeLine}`
                                    : 'Will insert at cursor or before </body>'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsAddElementOpen(false)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
