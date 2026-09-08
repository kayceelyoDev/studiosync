import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ChevronLeft,
    Monitor,
    Tablet,
    Smartphone,
    Undo2,
    Redo2,
    Eye,
    EyeOff,
    Code2,
    ExternalLink,
    Save,
    Check,
    Loader2,
    Sparkles,
    Trash2,
    Plus,
    LayoutTemplate,
    Type,
    Grid,
    Layers,
    BarChart3,
    MessageSquare,
    Megaphone,
    CreditCard,
    User,
    Mail,
    PanelBottom,
    Box,
    Image as ImageIcon,
    Link as LinkIcon,
    Palette,
    Sliders,
    X,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    Upload,
    Info,
    RefreshCw,
    Heading as HeadingIcon,
    AlignLeft,
    Paintbrush,
    RotateCcw,
    Copy,
    MousePointer,
    ChevronRight,
    Tag
} from 'lucide-react';

interface Project {
    id: number;
    workspace_id: number;
    project_name: string;
    status: string;
    html_content: string;
    project_url?: string | null;
    preferences?: any;
    created_at: string;
    workspace?: {
        id: number;
        name: string;
    };
}

interface LayerSection {
    id: string;
    type: string;
    label: string;
    tagName: string;
    index: number;
    hidden?: boolean;
}

interface EditableHeading {
    index: number;
    tag: string;
    text: string;
    color?: string;
}

interface EditableParagraph {
    index: number;
    tag?: string;
    text: string;
    color?: string;
}

interface EditableLink {
    index: number;
    tag: string;
    text: string;
    href: string;
    target: string;
    backgroundColor?: string;
    color?: string;
    borderColor?: string;
    isButton?: boolean;
}

interface EditableImage {
    index: number;
    src: string;
    alt: string;
}

interface EditableCard {
    index: number;
    label: string;
    hasBadge?: boolean;
    badge?: string;
    badgeColor?: string;
    badgeBg?: string;
    title: string;
    titleTag: string;
    titleColor?: string;
    description: string;
    descriptionColor?: string;
    buttonText: string;
    buttonHref: string;
    buttonTarget: string;
    buttonBg?: string;
    buttonColor?: string;
    isButton?: boolean;
    imageSrc: string;
    imageAlt: string;
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
}

interface SectionData {
    id: string;
    label: string;
    tagName: string;
    backgroundColor?: string;
    textColor?: string;
    headings: EditableHeading[];
    paragraphs: EditableParagraph[];
    links: EditableLink[];
    images: EditableImage[];
    cards: EditableCard[];
}

interface ColorPalette {
    primary: string;
    primaryText?: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border?: string;
}

const extractCurrentColors = (htmlContent: string): ColorPalette => {
    const defaultColors: ColorPalette = {
        primary: '#3b5323',
        primaryText: '#ffffff',
        secondary: '#8b5a2b',
        background: '#faf6f0',
        surface: '#f3eee3',
        text: '#2c2a29',
        textMuted: '#6b6560',
        border: '#e8dfd1'
    };

    if (!htmlContent) return defaultColors;

    const primaryMatch = htmlContent.match(/--color-primary:\s*([^;]+);/i);
    const primaryTextMatch = htmlContent.match(/--color-primary-text:\s*([^;]+);/i);
    const secondaryMatch = htmlContent.match(/--color-secondary:\s*([^;]+);/i);
    const backgroundMatch = htmlContent.match(/--color-background:\s*([^;]+);/i);
    const surfaceMatch = htmlContent.match(/--color-surface:\s*([^;]+);/i);
    const textMatch = htmlContent.match(/--color-text:\s*([^;]+);/i);
    const textMutedMatch = htmlContent.match(/--color-text-muted:\s*([^;]+);/i);
    const borderMatch = htmlContent.match(/--color-border:\s*([^;]+);/i);

    return {
        primary: primaryMatch ? primaryMatch[1].trim() : defaultColors.primary,
        primaryText: primaryTextMatch ? primaryTextMatch[1].trim() : defaultColors.primaryText,
        secondary: secondaryMatch ? secondaryMatch[1].trim() : defaultColors.secondary,
        background: backgroundMatch ? backgroundMatch[1].trim() : defaultColors.background,
        surface: surfaceMatch ? surfaceMatch[1].trim() : defaultColors.surface,
        text: textMatch ? textMatch[1].trim() : defaultColors.text,
        textMuted: textMutedMatch ? textMutedMatch[1].trim() : defaultColors.textMuted,
        border: borderMatch ? borderMatch[1].trim() : defaultColors.border
    };
};

const normalizeHex = (color: string) => {
    if (!color) return '#000000';
    let c = color.trim();
    if (!c.startsWith('#')) c = '#' + c;
    if (c.length === 4) {
        c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    }
    return c.slice(0, 7);
};

// Preset color themes with guaranteed high-contrast, WCAG AA legibility
const DESIGN_PRESETS = [
    {
        id: 'forest',
        name: 'Forest',
        dots: ['#051f18', '#10b981', '#f0fdf4'],
        colors: {
            primary: '#10b981',
            primaryText: '#051f18',
            secondary: '#059669',
            background: '#051f18',
            surface: '#0a3327',
            text: '#f0fdf4',
            textMuted: '#a7f3d0',
            border: '#144d3b'
        }
    },
    {
        id: 'sand',
        name: 'Sand / Organic',
        dots: ['#faf6f0', '#3b5323', '#8b5a2b'],
        colors: {
            primary: '#3b5323',
            primaryText: '#ffffff',
            secondary: '#8b5a2b',
            background: '#faf6f0',
            surface: '#f3eee3',
            text: '#2c2a29',
            textMuted: '#6b6560',
            border: '#e5decb'
        }
    },
    {
        id: 'dark-minimal',
        name: 'Dark Minimal',
        dots: ['#09090b', '#27272a', '#ffffff'],
        colors: {
            primary: '#ffffff',
            primaryText: '#09090b',
            secondary: '#71717a',
            background: '#09090b',
            surface: '#18181b',
            text: '#fafafa',
            textMuted: '#a1a1aa',
            border: '#27272a'
        }
    },
    {
        id: 'clean',
        name: 'Clean / Modern',
        dots: ['#ffffff', '#2563eb', '#0f172a'],
        colors: {
            primary: '#2563eb',
            primaryText: '#ffffff',
            secondary: '#3b82f6',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#0f172a',
            textMuted: '#475569',
            border: '#e2e8f0'
        }
    },
    {
        id: 'ivory',
        name: 'Ivory / Editorial',
        dots: ['#fbfaf6', '#7c3aed', '#1c1917'],
        colors: {
            primary: '#7c3aed',
            primaryText: '#ffffff',
            secondary: '#9061f9',
            background: '#fbfaf6',
            surface: '#f3ede2',
            text: '#1c1917',
            textMuted: '#625c56',
            border: '#e8dfd1'
        }
    },
    {
        id: 'amber',
        name: 'Warm Amber',
        dots: ['#140e0b', '#f59e0b', '#fef3c7'],
        colors: {
            primary: '#f59e0b',
            primaryText: '#140e0b',
            secondary: '#d97706',
            background: '#140e0b',
            surface: '#241812',
            text: '#fef3c7',
            textMuted: '#fcd34d',
            border: '#3a271c'
        }
    },
    {
        id: 'ocean',
        name: 'Deep Ocean',
        dots: ['#030712', '#0ea5e9', '#f0f9ff'],
        colors: {
            primary: '#0ea5e9',
            primaryText: '#ffffff',
            secondary: '#0284c7',
            background: '#030712',
            surface: '#0f172a',
            text: '#f0f9ff',
            textMuted: '#7dd3fc',
            border: '#1e293b'
        }
    },
    {
        id: 'slate',
        name: 'Slate / Navy',
        dots: ['#0b1120', '#38bdf8', '#f8fafc'],
        colors: {
            primary: '#38bdf8',
            primaryText: '#0b1120',
            secondary: '#64748b',
            background: '#0b1120',
            surface: '#1e293b',
            text: '#f8fafc',
            textMuted: '#94a3b8',
            border: '#334155'
        }
    },
    {
        id: 'rose',
        name: 'Rosé / Velvet',
        dots: ['#fff5f6', '#e11d48', '#3b0716'],
        colors: {
            primary: '#e11d48',
            primaryText: '#ffffff',
            secondary: '#fb7185',
            background: '#fff5f6',
            surface: '#ffe4e8',
            text: '#3b0716',
            textMuted: '#881337',
            border: '#fecdd3'
        }
    },
    {
        id: 'purple-haze',
        name: 'Purple Haze',
        dots: ['#0c071e', '#a855f7', '#faf5ff'],
        colors: {
            primary: '#a855f7',
            primaryText: '#ffffff',
            secondary: '#c084fc',
            background: '#0c071e',
            surface: '#190e38',
            text: '#faf5ff',
            textMuted: '#d8b4fe',
            border: '#2e1a5a'
        }
    }
];

// Curated stock photo presets for quick replacement
const STOCK_PHOTOS = [
    { label: 'Modern Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Creative Studio', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Portrait Study', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Minimal Architecture', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Abstract Light', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Product Showcase', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80' }
];

export default function ProjectEdit({ project }: { project: Project }) {
    // Current HTML and Undo/Redo stack
    const [html, setHtml] = useState<string>(project.html_content || '');
    const [iframeSrcDoc, setIframeSrcDoc] = useState<string>(project.html_content || '');
    const [history, setHistory] = useState<string[]>([project.html_content || '']);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    // Layout & UI states
    const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'properties' | 'design'>('properties');
    const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [projectName, setProjectName] = useState<string>(project.project_name || 'Untitled Project');
    const [isRenaming, setIsRenaming] = useState<boolean>(false);

    // Layers & Selected Section
    const [layers, setLayers] = useState<LayerSection[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [currentColors, setCurrentColors] = useState<ColorPalette>(() => extractCurrentColors(project.html_content || ''));

    // Highlighted element tracking (bi-directional canvas <-> right sidebar settings)
    const [highlightedTarget, setHighlightedTarget] = useState<{
        type: 'heading' | 'paragraph' | 'link' | 'image' | 'card' | 'section';
        index: number;
        subField?: 'title' | 'description' | 'button' | 'image' | 'badge' | 'card';
        timestamp: number;
    } | null>(null);

    // References
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    // Collapsible sidebar section groups (auto-expand on element selection)
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    // Push new state to history
    const pushHistory = useCallback((newHtml: string) => {
        if (!newHtml || newHtml === html) return;
        setHistory(prev => {
            const next = prev.slice(0, historyIndex + 1);
            if (next.length > 40) {
                next.shift();
            }
            return [...next, newHtml];
        });
        setHistoryIndex(prev => Math.min(prev + 1, 40));
        setHtml(newHtml);
        setIsDirty(true);
    }, [historyIndex, html]);

    // Undo action
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const prevHtml = history[newIndex];
            setHtml(prevHtml);
            setIframeSrcDoc(prevHtml);
            setIsDirty(true);
        }
    }, [historyIndex, history]);

    // Redo action
    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const nextHtml = history[newIndex];
            setHtml(nextHtml);
            setIframeSrcDoc(nextHtml);
            setIsDirty(true);
        }
    }, [historyIndex, history]);

    // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) {
                    e.preventDefault();
                    handleRedo();
                } else {
                    e.preventDefault();
                    handleUndo();
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                handleRedo();
            } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                saveChanges();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    // Warn before navigating away if unsaved
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Parse layers from HTML
    const parseLayersFromHtml = useCallback((htmlContent: string) => {
        if (!htmlContent) return;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');

            const sectionElements: Element[] = [];

            // Detect Bento Box wrapper if present
            const bentoGrid = doc.querySelector('[data-bento-grid]');
            if (bentoGrid) {
                const header = doc.querySelector('header, nav');
                if (header) sectionElements.push(header);
                sectionElements.push(...Array.from(bentoGrid.children));
                const footer = doc.querySelector('footer');
                if (footer && !sectionElements.includes(footer)) sectionElements.push(footer);
            } else {
                // Look for standard sections inside body
                const bodyChildren = Array.from(doc.body.children);
                for (const child of bodyChildren) {
                    const tag = child.tagName.toLowerCase();
                    if (['script', 'style', 'noscript'].includes(tag)) continue;
                    if (tag === 'main' && child.children.length > 0) {
                        sectionElements.push(...Array.from(child.children));
                    } else {
                        sectionElements.push(child);
                    }
                }
            }

            const parsed: LayerSection[] = sectionElements.map((el, index) => {
                const id = el.id || el.getAttribute('data-section-id') || `section-${index + 1}`;
                const tag = el.tagName.toLowerCase();
                const type = el.getAttribute('data-type') || id.toLowerCase();

                let label = id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                if (type.includes('nav') || tag === 'header') label = 'Navbar';
                else if (type.includes('hero')) label = 'Hero';
                else if (type.includes('logo')) label = 'Logo Cloud';
                else if (type.includes('feature')) label = 'Features';
                else if (type.includes('service')) label = 'Services';
                else if (type.includes('stat')) label = 'Stats';
                else if (type.includes('testimonial')) label = 'Testimonials';
                else if (type.includes('cta')) label = 'CTA';
                else if (type.includes('pricing')) label = 'Pricing';
                else if (type.includes('about')) label = 'About';
                else if (type.includes('contact')) label = 'Contact';
                else if (type.includes('footer') || tag === 'footer') label = 'Footer';

                return {
                    id,
                    type,
                    label,
                    tagName: tag,
                    index,
                    hidden: el.classList.contains('hidden') || (el as HTMLElement).style?.display === 'none'
                };
            });

            setLayers(parsed);

            // Default select the first section if none selected or selected was deleted
            setSelectedSectionId(prev => {
                if (prev && parsed.some(l => l.id === prev)) {
                    return prev;
                }
                return parsed.length > 0 ? parsed[0].id : null;
            });
        } catch (err) {
            console.error('Failed to parse layers:', err);
        }
    }, []);

    // Update layers whenever HTML changes
    useEffect(() => {
        parseLayersFromHtml(html);
    }, [html, parseLayersFromHtml]);

// Helper to accurately extract genuine card containers inside a section
const getCardCandidates = (sectionEl: HTMLElement): HTMLElement[] => {
    // 1. Explicit cards marked by data attribute or class
    const explicitCards = Array.from(sectionEl.querySelectorAll<HTMLElement>(
        '[data-card], [data-bento-card], .card, [class*="card"]'
    ));

    // 2. Direct children of grid, flex-wrap, or horizontal scroll layouts
    const layoutItems = Array.from(sectionEl.querySelectorAll<HTMLElement>(
        '[class*="grid"] > div, [class*="grid"] > article, [class*="flex-wrap"] > div, [class*="flex-wrap"] > article, [class*="overflow-x-auto"] > div'
    ));

    // 3. Styled container boxes (rounded, border, shadow)
    const styledBoxes = Array.from(sectionEl.querySelectorAll<HTMLElement>(
        '[class*="rounded-3xl"], [class*="rounded-2xl"], [class*="rounded-xl"], [class*="rounded-lg"]'
    ));

    const combined = Array.from(new Set([...explicitCards, ...layoutItems, ...styledBoxes]));

    const rawCandidates = combined.filter((el) => {
        if (['BUTTON', 'A', 'IMG', 'INPUT', 'NAV', 'HEADER', 'FOOTER', 'SVG', 'SPAN', 'LABEL', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) return false;
        if (el === sectionEl || (el.ownerDocument && el === el.ownerDocument.body)) return false;
        const text = (el.textContent || '').trim();
        const hasImg = !!el.querySelector('img');
        return text.length > 0 || hasImg;
    });

    const trueCards = rawCandidates.filter((cand) => {
        // If cand has explicit card marker, always keep it
        if (cand.hasAttribute('data-card') || cand.hasAttribute('data-bento-card') || (cand.className || '').includes('card')) {
            return true;
        }

        // Check if cand is an outer wrapper/grid/scroll-track of multiple separate cards
        const childSubstantials = rawCandidates.filter(other =>
            other !== cand &&
            cand.contains(other) &&
            (!!other.querySelector('h1, h2, h3, h4, h5, h6, p, a, button') || (other.textContent || '').trim().length > 30)
        );

        if (childSubstantials.length >= 2) {
            // cand is a grid or scroll container of cards, not a card itself
            return false;
        }

        // A genuine card must have substantive content: at least a heading, paragraph, or button/link
        const hasHeading = !!cand.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]');
        const hasP = !!cand.querySelector('p');
        const hasBtn = !!cand.querySelector('a, button, [role="button"]');

        if (!hasHeading && !hasP && !hasBtn) {
            // It's just an image box, icon wrapper, or decorative container
            return false;
        }

        // Check if cand is an inner box inside another candidate that already has a heading/card content
        const isInnerSubElement = rawCandidates.some(parent => {
            if (parent === cand || !parent.contains(cand)) return false;
            // Count how many children parent has
            const parentChildren = rawCandidates.filter(sib =>
                sib !== parent && parent.contains(sib) &&
                (!!sib.querySelector('h1, h2, h3, h4, h5, h6, p, a, button') || (sib.textContent || '').trim().length > 30)
            );
            if (parentChildren < 2) {
                // Parent is a single card containing cand as an inner child
                return true;
            }
            return false;
        });

        if (isInnerSubElement) {
            return false;
        }

        return true;
    });

    return trueCards;
};

// Helper to accurately extract standalone text elements (paragraphs, labels, spans, divs) outside cards, headings, and buttons
const getStandaloneTextElements = (sectionEl: HTMLElement, cards: HTMLElement[]): HTMLElement[] => {
    return Array.from(sectionEl.querySelectorAll<HTMLElement>('p, span, div, label'))
        .filter(el => {
            if (cards.some(card => card.contains(el))) return false;
            if (el.closest('h1, h2, h3, h4, h5, h6, a, button, [role="button"]')) return false;
            if (el.tagName.toLowerCase() !== 'p' && el.closest('p')) return false;
            if (el.querySelector('p, h1, h2, h3, h4, h5, h6, a, button, img')) return false;
            const text = (el.textContent || '').trim();
            if (text.length === 0 || text.length > 500) return false;
            // Prefer the leaf child if a child has the exact same text
            const hasChildWithSameText = Array.from(el.querySelectorAll('span, div, label')).some(ch => ch !== el && (ch.textContent || '').trim() === text);
            if (hasChildWithSameText) return false;
            return true;
        });
};

    // Parse the current selected section's content (headings, paragraphs, links, images, and rich cards)
    const selectedSectionData: SectionData | null = useMemo(() => {
        if (!selectedSectionId || !html) return null;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const sectionEl = doc.getElementById(selectedSectionId) ||
                              doc.querySelector(`[data-section-id="${selectedSectionId}"]`) ||
                              doc.querySelector(`section#${selectedSectionId}, header#${selectedSectionId}, footer#${selectedSectionId}, nav#${selectedSectionId}`);
            if (!sectionEl) return null;

            const layerInfo = layers.find(l => l.id === selectedSectionId);

            // 1. Cards & Containers inside this section
            const cardCandidateEls = getCardCandidates(sectionEl as HTMLElement);

            const cards: EditableCard[] = cardCandidateEls.map((el, index) => {
                const headingEl = el.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') as HTMLElement | null;
                const pEl = el.querySelector('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') as HTMLElement | null;
                const buttonEl = el.querySelector('a, button, [role="button"]') as HTMLElement | null;
                const imgEl = el.querySelector('img') as HTMLImageElement | null;
                const badgeEl = el.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') as HTMLElement | null;

                const titleText = headingEl?.textContent?.trim() || '';
                const label = titleText ? (titleText.length > 25 ? titleText.slice(0, 25) + '...' : titleText) : `Card #${index + 1}`;
                const hasBadgeEl = !!(badgeEl && badgeEl !== headingEl && badgeEl !== buttonEl);
                const badgeText = hasBadgeEl ? (badgeEl!.textContent || '').trim() : '';
                const isBtn = buttonEl ? (buttonEl.tagName.toLowerCase() === 'button' || /rounded|bg-|btn|px-|py-/.test(buttonEl.className)) : false;

                return {
                    index,
                    label,
                    hasBadge: hasBadgeEl,
                    badge: badgeText,
                    badgeColor: badgeEl?.style.color || '',
                    badgeBg: badgeEl?.style.backgroundColor || '',
                    title: titleText,
                    titleTag: headingEl?.tagName.toLowerCase() || 'h3',
                    titleColor: headingEl?.style.color || '',
                    description: pEl?.textContent?.trim() || '',
                    descriptionColor: pEl?.style.color || '',
                    buttonText: buttonEl?.textContent?.trim() || '',
                    buttonHref: buttonEl?.getAttribute('href') || '',
                    buttonTarget: buttonEl?.getAttribute('target') || '',
                    buttonBg: (buttonEl as HTMLElement)?.style.backgroundColor || '',
                    buttonColor: (buttonEl as HTMLElement)?.style.color || '',
                    isButton: isBtn,
                    imageSrc: imgEl ? (imgEl.getAttribute('src') || imgEl.src || '') : '',
                    imageAlt: imgEl?.getAttribute('alt') || '',
                    backgroundColor: el.style.backgroundColor || '',
                    borderColor: el.style.borderColor || '',
                    color: el.style.color || ''
                };
            });

            // 2. Standalone Headings: h1, h2, h3, h4, h5, h6 (outside cards)
            const headingEls = Array.from(sectionEl.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                .filter(el => !cardCandidateEls.some(card => card.contains(el)));
            const headings: EditableHeading[] = headingEls.map((el, index) => ({
                index,
                tag: el.tagName.toLowerCase(),
                text: el.textContent?.trim() || '',
                color: (el as HTMLElement).style.color || ''
            }));

            // 3. Standalone Paragraphs & Text Elements: p, span, div, label (outside cards)
            const pEls = getStandaloneTextElements(sectionEl as HTMLElement, cardCandidateEls);
            const paragraphs: EditableParagraph[] = pEls.map((el, index) => ({
                index,
                tag: el.tagName.toLowerCase(),
                text: el.textContent?.trim() || '',
                color: (el as HTMLElement).style.color || ''
            }));

            // 4. Standalone Links & Buttons: a, button (outside cards)
            const linkEls = Array.from(sectionEl.querySelectorAll('a, button'))
                .filter(el => !cardCandidateEls.some(card => card.contains(el)))
                .filter(el => {
                    const text = el.textContent?.trim() || '';
                    const href = el.getAttribute('href');
                    return text.length > 0 || !!href;
                });
            const links: EditableLink[] = linkEls.map((el, index) => {
                const htmlEl = el as HTMLElement;
                const isBtn = el.tagName.toLowerCase() === 'button' || /rounded|bg-|btn|px-|py-/.test(el.className);
                return {
                    index,
                    tag: el.tagName.toLowerCase(),
                    text: el.textContent?.trim() || '',
                    href: el.getAttribute('href') || '',
                    target: el.getAttribute('target') || '',
                    backgroundColor: htmlEl.style.backgroundColor || '',
                    color: htmlEl.style.color || '',
                    borderColor: htmlEl.style.borderColor || '',
                    isButton: isBtn
                };
            });

            // 5. Standalone Images: img (outside cards)
            const imgEls = Array.from(sectionEl.querySelectorAll('img'))
                .filter(el => !cardCandidateEls.some(card => card.contains(el)));
            const images: EditableImage[] = imgEls.map((el, index) => ({
                index,
                src: el.getAttribute('src') || el.src || '',
                alt: el.getAttribute('alt') || ''
            }));

            return {
                id: selectedSectionId,
                label: layerInfo?.label || selectedSectionId,
                tagName: sectionEl.tagName.toLowerCase(),
                backgroundColor: (sectionEl as HTMLElement).style.backgroundColor || '',
                textColor: (sectionEl as HTMLElement).style.color || '',
                headings,
                paragraphs,
                links,
                images,
                cards
            };
        } catch (err) {
            console.error('Failed to parse section data:', err);
            return null;
        }
    }, [selectedSectionId, html, layers]);

    // Bi-directional highlighting: highlight element in iframe when clicked on canvas or selected in sidebar
    const highlightElementInIframe = useCallback((type: 'heading' | 'paragraph' | 'link' | 'image' | 'card' | 'section', index: number, subField?: string) => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument || !selectedSectionId) return;

        const doc = iframe.contentDocument;
        const sectionEl = doc.getElementById(selectedSectionId) || doc.querySelector(`[data-section-id="${selectedSectionId}"]`);
        if (!sectionEl) return;

        doc.querySelectorAll('.__ss-active-section').forEach(el => el.classList.remove('__ss-active-section'));
        doc.querySelectorAll('.__ss-active-element').forEach(el => el.classList.remove('__ss-active-element'));
        doc.querySelectorAll('.__ss-active-card').forEach(el => el.classList.remove('__ss-active-card'));

        sectionEl.classList.add('__ss-active-section');

        const cards = getCardCandidates(sectionEl as HTMLElement);

        let targetEl: HTMLElement | null = null;
        if (type === 'heading') {
            const headings = Array.from(sectionEl.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(el => !cards.some(c => c.contains(el)));
            targetEl = (headings[index] as HTMLElement) || null;
        } else if (type === 'paragraph') {
            const paragraphs = getStandaloneTextElements(sectionEl as HTMLElement, cards);
            targetEl = (paragraphs[index] as HTMLElement) || null;
        } else if (type === 'link') {
            const links = Array.from(sectionEl.querySelectorAll('a, button, [role="button"]')).filter(el => !cards.some(c => c.contains(el)));
            targetEl = (links[index] as HTMLElement) || null;
        } else if (type === 'image') {
            const imgs = Array.from(sectionEl.querySelectorAll('img')).filter(el => !cards.some(c => c.contains(el)));
            targetEl = (imgs[index] as HTMLElement) || null;
        } else if (type === 'card') {
            const cardEl = cards[index];
            if (cardEl) {
                cardEl.classList.add('__ss-active-card');
                targetEl = cardEl;

                if (subField === 'title') {
                    const h = cardEl.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') as HTMLElement | null;
                    if (h) h.classList.add('__ss-active-element');
                } else if (subField === 'badge') {
                    const bg = cardEl.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') as HTMLElement | null;
                    if (bg) bg.classList.add('__ss-active-element');
                } else if (subField === 'description') {
                    const p = cardEl.querySelector('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') as HTMLElement | null;
                    if (p) p.classList.add('__ss-active-element');
                } else if (subField === 'button') {
                    const b = cardEl.querySelector('a, button, [role="button"]') as HTMLElement | null;
                    if (b) b.classList.add('__ss-active-element');
                } else if (subField === 'image') {
                    const im = cardEl.querySelector('img') as HTMLElement | null;
                    if (im) im.classList.add('__ss-active-element');
                }
            }
        } else if (type === 'section') {
            targetEl = sectionEl as HTMLElement;
        }

        const existingBadge = doc.getElementById('__ss-selection-label-badge__');
        if (existingBadge) existingBadge.remove();

        if (targetEl) {
            if (type !== 'card' && type !== 'section') {
                targetEl.classList.add('__ss-active-element');
            }
            const labelText = type === 'card' 
                ? (subField && subField !== 'card' ? subField.charAt(0).toUpperCase() + subField.slice(1) : `Card #${index + 1}`) 
                : (type === 'heading' ? (targetEl.tagName.toUpperCase()) : type === 'section' ? (sectionEl.getAttribute('data-section-id') || sectionEl.id || 'Section').toUpperCase() + ' Section' : type === 'paragraph' ? (targetEl.tagName.toLowerCase() === 'p' ? 'Paragraph' : targetEl.tagName.toLowerCase() === 'span' ? 'Label' : 'Text') : type.charAt(0).toUpperCase() + type.slice(1));
            
            const badge = doc.createElement('div');
            badge.className = '__ss-selection-label';
            badge.id = '__ss-selection-label-badge__';
            badge.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#a78bfa;"></span> ${labelText}`;
            
            const activeChild = targetEl.querySelector('.__ss-active-element') as HTMLElement | null;
            const badgeHost = activeChild || targetEl;
            badgeHost.style.position = badgeHost.style.position || 'relative';
            badgeHost.appendChild(badge);

            targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedSectionId]);

    // Setup iframe: clean preview, interactive element detection, click-to-highlight right sidebar settings
    const setupIframeInteraction = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;
        if (!doc || (!doc.head && !doc.body && !doc.documentElement)) return;

        // Visual selection and element highlight styles inside the iframe
        let style = doc.getElementById('__studiosync_preview_styles__');
        if (!style) {
            style = doc.createElement('style');
            style.id = '__studiosync_preview_styles__';
            style.textContent = `
                /* Section boundary */
                .__ss-active-section {
                    outline: 2px dashed rgba(59, 130, 246, 0.35) !important;
                    outline-offset: 4px !important;
                    transition: outline 0.2s ease !important;
                }
                /* Selected card container */
                .__ss-active-card {
                    outline: 2px solid #3b82f6 !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
                    position: relative;
                    z-index: 15 !important;
                    transition: all 0.2s ease !important;
                }
                /* Selected individual element */
                .__ss-active-element {
                    outline: 2px solid #8b5cf6 !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2) !important;
                    position: relative;
                    z-index: 20 !important;
                    transition: all 0.2s ease !important;
                }
                /* Hover preview outline (before clicking) */
                .__ss-hover-element {
                    outline: 1.5px dashed rgba(59, 130, 246, 0.5) !important;
                    outline-offset: 2px !important;
                    cursor: pointer !important;
                    transition: outline 0.1s ease !important;
                }
                /* Hover label badge */
                .__ss-hover-label {
                    position: absolute;
                    top: -22px;
                    left: 0;
                    background: #3b82f6;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 1px 6px;
                    border-radius: 3px;
                    z-index: 9999;
                    pointer-events: none;
                    font-family: ui-monospace, SFMono-Regular, monospace;
                    white-space: nowrap;
                    line-height: 1.6;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                }
                /* Selection label on active element */
                .__ss-selection-label {
                    position: absolute;
                    top: -24px;
                    left: -2px;
                    background: #8b5cf6;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 4px;
                    z-index: 9999;
                    pointer-events: none;
                    font-family: ui-monospace, SFMono-Regular, monospace;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    line-height: 1.4;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    white-space: nowrap;
                }
                /* Inline editing active on canvas */
                .__ss-inline-editing {
                    outline: 2px solid #8b5cf6 !important;
                    outline-offset: 2px !important;
                    background: rgba(139, 92, 246, 0.1) !important;
                    cursor: text !important;
                }
                h1, h2, h3, h4, h5, h6, p, a, button, img, [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"], [class*="rounded-lg"], .card, [data-card], [data-bento-card], section div, header div, footer div, nav div, main div, article {
                    cursor: pointer !important;
                }
            `;
            if (doc.head) {
                doc.head.appendChild(style);
            } else if (doc.documentElement) {
                doc.documentElement.appendChild(style);
            } else if (doc.body) {
                doc.body.appendChild(style);
            }
        }

        // Helper: get element type label for hover/selection badges
        const getElementTypeLabel = (el: HTMLElement): string => {
            const tag = el.tagName.toUpperCase();
            if (['H1','H2','H3','H4','H5','H6'].includes(tag)) return tag;
            if (tag === 'P') return 'Paragraph';
            if (tag === 'IMG') return 'Image';
            if (tag === 'BUTTON' || el.getAttribute('role') === 'button') return 'Button';
            if (tag === 'A') return 'Link';
            if (['SECTION', 'HEADER', 'FOOTER', 'NAV', 'MAIN'].includes(tag)) return 'Section';
            // Check if it's a card candidate
            const classList = el.className || '';
            if (el.hasAttribute('data-card') || el.hasAttribute('data-bento-card') ||
                classList.includes('card') ||
                (classList.includes('rounded') && el.querySelector('h1, h2, h3, h4, h5, h6, p')) ||
                (classList.includes('border') && el.querySelector('h1, h2, h3, h4, h5, h6, p'))) {
                return 'Card';
            }
            if (el.querySelector('h1, h2, h3, h4, h5, h6')) return 'Container';
            return tag === 'DIV' ? 'Container' : tag;
        };

        // Helper: inject or remove a hover label badge
        const showHoverLabel = (el: HTMLElement) => {
            removeHoverLabel();
            const label = getElementTypeLabel(el);
            const badge = doc.createElement('div');
            badge.className = '__ss-hover-label';
            badge.id = '__ss-hover-label-badge__';
            badge.textContent = label;
            el.style.position = el.style.position || 'relative';
            el.appendChild(badge);
        };

        const removeHoverLabel = () => {
            const existing = doc.getElementById('__ss-hover-label-badge__');
            if (existing) existing.remove();
        };

        // Helper: inject selection label on active element
        const showSelectionLabel = (el: HTMLElement, label: string) => {
            removeSelectionLabel();
            const badge = doc.createElement('div');
            badge.className = '__ss-selection-label';
            badge.id = '__ss-selection-label-badge__';
            badge.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#a78bfa;"></span> ${label}`;
            el.style.position = el.style.position || 'relative';
            el.appendChild(badge);
        };

        const removeSelectionLabel = () => {
            const existing = doc.getElementById('__ss-selection-label-badge__');
            if (existing) existing.remove();
        };

        // Hover handler: show dashed outline + type label on mouseover
        const handleMouseOver = (e: MouseEvent) => {
            const rawTarget = e.target as Node | null;
            const target = (rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement) as HTMLElement | null;
            if (!target || target === doc.body || target === doc.documentElement) return;

            // Don't show hover if element is already selected
            if (target.classList.contains('__ss-active-element') || target.classList.contains('__ss-active-card')) return;

            // Don't hover on badges themselves
            if (target.classList.contains('__ss-hover-label') || target.classList.contains('__ss-selection-label')) return;

            // Find the closest meaningful element
            const meaningful = target.closest('h1, h2, h3, h4, h5, h6, p, a, button, [role="button"], img, [data-card], [data-bento-card], .card, [class*="card"], [class*="rounded-xl"], [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-lg"], [class*="border"], [class*="bg-"]') as HTMLElement | null;
            const hoverTarget = meaningful || target;

            // Remove previous hover
            doc.querySelectorAll('.__ss-hover-element').forEach(el => el.classList.remove('__ss-hover-element'));
            removeHoverLabel();

            if (hoverTarget !== doc.body && hoverTarget !== doc.documentElement) {
                hoverTarget.classList.add('__ss-hover-element');
                showHoverLabel(hoverTarget);
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            const rawTarget = e.target as Node | null;
            const target = (rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement) as HTMLElement | null;
            if (target) {
                target.classList.remove('__ss-hover-element');
            }
            doc.querySelectorAll('.__ss-hover-element').forEach(el => el.classList.remove('__ss-hover-element'));
            removeHoverLabel();
        };

        // Disable window.open inside iframe
        if (iframe.contentWindow) {
            try {
                iframe.contentWindow.open = () => null;
            } catch {
                // Ignore
            }
        }

        // Prevent external link navigation in preview; instead clicking an element selects it and highlights its settings on the right
        const handleClick = (e: MouseEvent) => {
            const rawTarget = e.target as Node | null;
            const target = (rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement) as HTMLElement | null;

            // Unconditionally block link navigation, hash jumps, button actions, and form submissions
            if (target) {
                const anchor = target.closest('a');
                const button = target.closest('button, [role="button"]');
                const form = target.closest('form');
                if (anchor || button || form) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }

            if (!target || target === doc.body || target === doc.documentElement) return;

            // Clear hover state on click — selection takes over
            doc.querySelectorAll('.__ss-hover-element').forEach(el => el.classList.remove('__ss-hover-element'));
            removeHoverLabel();
            removeSelectionLabel();

            // Find section ancestor
            let sectionEl = (target.closest('section, header, footer, nav, main, [id]') || target.closest('[data-section-id]')) as HTMLElement;
            if (!sectionEl || sectionEl === doc.body || sectionEl === doc.documentElement) {
                const directChild = Array.from(doc.body.children).find(child => child.contains(target)) as HTMLElement;
                if (directChild) sectionEl = directChild;
            }
            if (!sectionEl) return;

            let sectionId = sectionEl.id || sectionEl.getAttribute('data-section-id');
            if (!sectionId) {
                const matchedLayer = layers.find(l => {
                    const el = doc.getElementById(l.id) || doc.querySelector(`[data-section-id="${l.id}"]`);
                    return el === sectionEl || sectionEl.contains(el);
                });
                if (matchedLayer) {
                    sectionId = matchedLayer.id;
                } else {
                    const bodyChildren = Array.from(doc.body.children).filter(c => !['script', 'style', 'noscript'].includes(c.tagName.toLowerCase()));
                    const childIdx = bodyChildren.indexOf(sectionEl);
                    if (childIdx !== -1 && layers[childIdx]) {
                        sectionId = layers[childIdx].id;
                        sectionEl.setAttribute('data-section-id', sectionId);
                    }
                }
            }

            if (sectionId) {
                setSelectedSectionId(sectionId);
            }
            setActiveTab('properties');

            // Clear previous iframe highlights
            doc.querySelectorAll('.__ss-active-section').forEach(el => el.classList.remove('__ss-active-section'));
            doc.querySelectorAll('.__ss-active-element').forEach(el => el.classList.remove('__ss-active-element'));
            doc.querySelectorAll('.__ss-active-card').forEach(el => el.classList.remove('__ss-active-card'));
            sectionEl.classList.add('__ss-active-section');

            // 1. Check if clicked element is inside a Card or is a Card
            const cards = getCardCandidates(sectionEl);
            const clickedCard = cards.find(c => c === target || c.contains(target));

            if (clickedCard) {
                const cardIndex = Math.max(0, cards.indexOf(clickedCard));
                clickedCard.classList.add('__ss-active-card');

                let subField: 'title' | 'description' | 'button' | 'image' | 'badge' | 'card' = 'card';

                const badgeInCard = (target.closest('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') ||
                    (clickedCard === target ? clickedCard.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') : null)) as HTMLElement | null;
                const headingInCard = (target.closest('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') ||
                    (clickedCard === target ? clickedCard.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') : null)) as HTMLElement | null;
                const pInCard = (target.closest('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') ||
                    (clickedCard === target ? clickedCard.querySelector('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') : null)) as HTMLElement | null;
                const btnInCard = (target.closest('a, button, [role="button"]') ||
                    (clickedCard === target ? clickedCard.querySelector('a, button, [role="button"]') : null)) as HTMLElement | null;
                const imgInCard = (target.tagName === 'IMG' ? target : (target.querySelector('img') || target.closest('img') || (clickedCard === target ? clickedCard.querySelector('img') : null))) as HTMLElement | null;

                if (badgeInCard && clickedCard.contains(badgeInCard) && (target === badgeInCard || badgeInCard.contains(target))) {
                    subField = 'badge';
                    badgeInCard.classList.add('__ss-active-element');
                    showSelectionLabel(badgeInCard, 'Badge');
                } else if (btnInCard && clickedCard.contains(btnInCard) && (target === btnInCard || btnInCard.contains(target))) {
                    subField = 'button';
                    btnInCard.classList.add('__ss-active-element');
                    showSelectionLabel(btnInCard, 'Button');
                } else if (imgInCard && clickedCard.contains(imgInCard) && (target === imgInCard || imgInCard.contains(target))) {
                    subField = 'image';
                    imgInCard.classList.add('__ss-active-element');
                    showSelectionLabel(imgInCard, 'Image');
                } else if (headingInCard && clickedCard.contains(headingInCard) && (target === headingInCard || headingInCard.contains(target))) {
                    subField = 'title';
                    headingInCard.classList.add('__ss-active-element');
                    showSelectionLabel(headingInCard, 'Title');
                } else if (pInCard && clickedCard.contains(pInCard) && (target === pInCard || pInCard.contains(target))) {
                    subField = 'description';
                    pInCard.classList.add('__ss-active-element');
                    showSelectionLabel(pInCard, 'Description');
                } else {
                    showSelectionLabel(clickedCard, `Card #${cardIndex + 1}`);
                }

                setHighlightedTarget({ type: 'card', index: cardIndex, subField, timestamp: Date.now() });
                return;
            }

            // Standalone elements outside cards:
            // 2. Standalone Heading (ancestor or descendant)
            const headingEl = (target.closest('h1, h2, h3, h4, h5, h6') || (target.tagName === 'DIV' || target.tagName === 'HEADER' ? target.querySelector('h1, h2, h3, h4, h5, h6') : null)) as HTMLElement | null;
            if (headingEl && sectionEl.contains(headingEl)) {
                const standaloneHeadings = Array.from(sectionEl.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(el => !cards.some(c => c.contains(el)));
                const index = standaloneHeadings.indexOf(headingEl);
                if (index !== -1) {
                    headingEl.classList.add('__ss-active-element');
                    showSelectionLabel(headingEl, headingEl.tagName.toUpperCase());
                    setHighlightedTarget({ type: 'heading', index, timestamp: Date.now() });
                    return;
                }
            }

            // 3. Standalone Button or Link (ancestor or descendant)
            const linkEl = (target.closest('a, button, [role="button"]') || (target.tagName === 'DIV' ? target.querySelector('a, button, [role="button"]') : null)) as HTMLElement | null;
            if (linkEl && sectionEl.contains(linkEl)) {
                const standaloneLinks = Array.from(sectionEl.querySelectorAll('a, button, [role="button"]')).filter(el => !cards.some(c => c.contains(el)));
                const index = standaloneLinks.indexOf(linkEl);
                if (index !== -1) {
                    linkEl.classList.add('__ss-active-element');
                    showSelectionLabel(linkEl, linkEl.tagName === 'BUTTON' ? 'Button' : 'Link');
                    setHighlightedTarget({ type: 'link', index, timestamp: Date.now() });
                    return;
                }
            }

            // 4. Standalone Image (self, ancestor, or descendant)
            const imgEl = (target.tagName === 'IMG' ? target : (target.closest('img') || target.querySelector('img'))) as HTMLElement | null;
            if (imgEl && sectionEl.contains(imgEl)) {
                const standaloneImgs = Array.from(sectionEl.querySelectorAll('img')).filter(el => !cards.some(c => c.contains(el)));
                const index = standaloneImgs.indexOf(imgEl as HTMLImageElement);
                if (index !== -1) {
                    imgEl.classList.add('__ss-active-element');
                    showSelectionLabel(imgEl, 'Image');
                    setHighlightedTarget({ type: 'image', index, timestamp: Date.now() });
                    return;
                }
            }

            // 5. Standalone Paragraph / Text Elements (p, span, div, label outside cards)
            const standaloneTexts = getStandaloneTextElements(sectionEl, cards);
            const matchedTextEl = standaloneTexts.find(el => el === target || el.contains(target) || target.contains(el));
            if (matchedTextEl) {
                const index = standaloneTexts.indexOf(matchedTextEl);
                if (index !== -1) {
                    matchedTextEl.classList.add('__ss-active-element');
                    const label = matchedTextEl.tagName.toLowerCase() === 'p' ? 'Paragraph' : matchedTextEl.tagName.toLowerCase() === 'span' ? 'Label' : 'Text';
                    showSelectionLabel(matchedTextEl, `${label} #${index + 1}`);
                    setHighlightedTarget({ type: 'paragraph', index, timestamp: Date.now() });
                    return;
                }
            }

            // 6. Section Container / Background clicked
            sectionEl.classList.add('__ss-active-section');
            showSelectionLabel(sectionEl, (sectionEl.getAttribute('data-section-id') || sectionEl.id || sectionEl.tagName).toUpperCase() + ' Section');
            setHighlightedTarget({ type: 'section', index: 0, timestamp: Date.now() });
        };

        // Double-click to enable inline editing directly on the preview canvas
        const handleDblClick = (e: MouseEvent) => {
            const rawTarget = e.target as Node | null;
            const target = (rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement) as HTMLElement | null;
            if (!target || target === doc.body || target === doc.documentElement) return;
            if (['IMG', 'SVG', 'PATH', 'VIDEO', 'IFRAME'].includes(target.tagName)) return;
            if (target.classList.contains('__ss-selection-label') || target.classList.contains('__ss-hover-label')) return;

            const text = (target.textContent || '').trim();
            if (text.length === 0) return;

            // If it has complex structural children, let inner leaf element handle it
            if (target.querySelector('div, section, article, p, h1, h2, h3, h4, h5, h6')) {
                const leaf = target.querySelector('span, p, h1, h2, h3, h4, h5, h6, a, button') as HTMLElement | null;
                if (leaf && leaf.contains(rawTarget as Node)) {
                    return;
                }
            }

            e.preventDefault();
            e.stopPropagation();

            const originalText = target.innerText;
            target.contentEditable = 'true';
            target.classList.add('__ss-inline-editing');
            target.focus();

            const onBlur = () => {
                target.contentEditable = 'false';
                target.classList.remove('__ss-inline-editing');
                target.removeEventListener('blur', onBlur);
                target.removeEventListener('keydown', onKeyDown);

                const newText = target.innerText.trim();
                if (newText !== originalText.trim()) {
                    const updatedHtml = doc.documentElement.outerHTML;
                    const cleanDoc = new DOMParser().parseFromString(updatedHtml, 'text/html');
                    cleanDoc.querySelectorAll('.__ss-active-section, .__ss-active-element, .__ss-active-card, .__ss-hover-element, .__ss-inline-editing').forEach(el => {
                        el.classList.remove('__ss-active-section', '__ss-active-element', '__ss-active-card', '__ss-hover-element', '__ss-inline-editing');
                    });
                    cleanDoc.getElementById('__studiosync_preview_styles__')?.remove();
                    cleanDoc.getElementById('__ss-selection-label-badge__')?.remove();
                    cleanDoc.getElementById('__ss-hover-label-badge__')?.remove();
                    pushHistory(cleanDoc.documentElement.outerHTML);
                }
            };

            const onKeyDown = (ke: KeyboardEvent) => {
                if (ke.key === 'Enter' && !ke.shiftKey) {
                    ke.preventDefault();
                    target.blur();
                } else if (ke.key === 'Escape') {
                    ke.preventDefault();
                    target.innerText = originalText;
                    target.blur();
                }
            };

            target.addEventListener('blur', onBlur);
            target.addEventListener('keydown', onKeyDown);
        };

        const handleAuxClick = (e: MouseEvent) => {
            const rawTarget = e.target as Node | null;
            const target = (rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement) as HTMLElement | null;
            if (target && (target.closest('a') || target.closest('button, [role="button"]'))) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const handleSubmit = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };

        doc.addEventListener('click', handleClick, true);
        doc.addEventListener('dblclick', handleDblClick, true);
        doc.addEventListener('auxclick', handleAuxClick, true);
        doc.addEventListener('submit', handleSubmit, true);
        doc.addEventListener('mouseover', handleMouseOver, true);
        doc.addEventListener('mouseout', handleMouseOut, true);

        return () => {
            doc.removeEventListener('click', handleClick, true);
            doc.removeEventListener('dblclick', handleDblClick, true);
            doc.removeEventListener('auxclick', handleAuxClick, true);
            doc.removeEventListener('submit', handleSubmit, true);
            doc.removeEventListener('mouseover', handleMouseOver, true);
            doc.removeEventListener('mouseout', handleMouseOut, true);
        };
    }, [layers, pushHistory]);

    // Keep iframe interaction active
    useEffect(() => {
        const cleanup = setupIframeInteraction();
        return () => {
            if (cleanup) cleanup();
        };
    }, [setupIframeInteraction]);

    // Auto-scroll and highlight control card in right sidebar
    useEffect(() => {
        if (!highlightedTarget) return;

        const timer = setTimeout(() => {
            const elementId = `editor-control-${highlightedTarget.type}-${highlightedTarget.index}`;
            const targetEl = document.getElementById(elementId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // If a specific subField inside a card was clicked (e.g. title, description, button, image):
                if (highlightedTarget.type === 'card' && highlightedTarget.subField) {
                    const subInput = targetEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                        `[data-card-field="${highlightedTarget.subField}"]`
                    );
                    if (subInput) {
                        subInput.focus({ preventScroll: true });
                        return;
                    }
                }

                // Auto-focus the text input or textarea inside this control
                const focusableInput = targetEl.querySelector<HTMLInputElement | HTMLTextAreaElement>('textarea, input:not([type="color"])');
                if (focusableInput) {
                    focusableInput.focus({ preventScroll: true });
                }
            }
        }, 120);

        return () => clearTimeout(timer);
    }, [highlightedTarget, selectedSectionId]);

    const onIframeLoad = () => {
        setupIframeInteraction();
        if (selectedSectionId) {
            highlightSectionInIframe(selectedSectionId);
        }
    };

    // Highlight and scroll to section in iframe
    const highlightSectionInIframe = (sectionId: string) => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;
        doc.querySelectorAll('.__ss-active-section').forEach(el => el.classList.remove('__ss-active-section'));
        doc.querySelectorAll('.__ss-active-element').forEach(el => el.classList.remove('__ss-active-element'));

        const el = doc.getElementById(sectionId) || doc.querySelector(`[data-section-id="${sectionId}"]`);
        if (el) {
            el.classList.add('__ss-active-section');
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSelectSection = (sectionId: string) => {
        setSelectedSectionId(sectionId);
        highlightSectionInIframe(sectionId);
        setHighlightedTarget(null);
    };

    // Update Heading Text via Right Sidebar
    const handleUpdateHeading = (index: number, newText: string) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const headingEls = Array.from(sectionEl.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(el => !cards.some(c => c.contains(el)));
        if (headingEls[index]) {
            if ((headingEls[index].textContent || '').trim() === newText.trim()) return;
            headingEls[index].textContent = newText;
            const updatedHtml = doc.documentElement.outerHTML;
            pushHistory(updatedHtml);

            if (iframeRef.current?.contentDocument) {
                const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
                const liveCards = liveSection ? getCardCandidates(liveSection) : [];
                const liveHeadings = liveSection ? Array.from(liveSection.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(el => !liveCards.some(c => c.contains(el))) : [];
                if (liveHeadings[index]) liveHeadings[index].textContent = newText;
            }
        }
    };

    // Update Heading Color via Right Sidebar
    const handleUpdateHeadingColor = (index: number, color: string) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const headingEls = Array.from(sectionEl.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(el => !cards.some(c => c.contains(el)));
        if (headingEls[index]) {
            const el = headingEls[index] as HTMLElement;
            if ((el.style.color || '') === color) return;
            if (!color) {
                el.style.color = '';
                el.removeAttribute('data-custom-color');
            } else {
                el.style.color = color;
                el.setAttribute('data-custom-color', 'true');
            }
            const updatedHtml = doc.documentElement.outerHTML;
            pushHistory(updatedHtml);

            if (iframeRef.current?.contentDocument) {
                const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
                const liveCards = liveSection ? getCardCandidates(liveSection) : [];
                const liveHeadings = liveSection ? Array.from(liveSection.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(el => !liveCards.some(c => c.contains(el))) : [];
                if (liveHeadings[index]) {
                    const liveEl = liveHeadings[index] as HTMLElement;
                    if (!color) {
                        liveEl.style.color = '';
                        liveEl.removeAttribute('data-custom-color');
                    } else {
                        liveEl.style.color = color;
                        liveEl.setAttribute('data-custom-color', 'true');
                    }
                }
            }
        }
    };

    // Update Paragraph Text via Right Sidebar
    const handleUpdateParagraph = (index: number, newText: string) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const pEls = getStandaloneTextElements(sectionEl, cards);
        if (pEls[index]) {
            if ((pEls[index].textContent || '').trim() === newText.trim()) return;
            pEls[index].textContent = newText;
            const updatedHtml = doc.documentElement.outerHTML;
            pushHistory(updatedHtml);

            if (iframeRef.current?.contentDocument) {
                const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
                const liveCards = liveSection ? getCardCandidates(liveSection) : [];
                const livePEls = liveSection ? getStandaloneTextElements(liveSection, liveCards) : [];
                if (livePEls[index]) livePEls[index].textContent = newText;
            }
        }
    };

    // Update Paragraph Color via Right Sidebar
    const handleUpdateParagraphColor = (index: number, color: string) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const pEls = getStandaloneTextElements(sectionEl, cards);
        if (pEls[index]) {
            const el = pEls[index] as HTMLElement;
            if ((el.style.color || '') === color) return;
            if (!color) {
                el.style.color = '';
                el.removeAttribute('data-custom-color');
            } else {
                el.style.color = color;
                el.setAttribute('data-custom-color', 'true');
            }
            const updatedHtml = doc.documentElement.outerHTML;
            pushHistory(updatedHtml);

            if (iframeRef.current?.contentDocument) {
                const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
                const liveCards = liveSection ? getCardCandidates(liveSection) : [];
                const livePEls = liveSection ? getStandaloneTextElements(liveSection, liveCards) : [];
                if (livePEls[index]) {
                    const liveEl = livePEls[index] as HTMLElement;
                    if (!color) {
                        liveEl.style.color = '';
                        liveEl.removeAttribute('data-custom-color');
                    } else {
                        liveEl.style.color = color;
                        liveEl.setAttribute('data-custom-color', 'true');
                    }
                }
            }
        }
    };

    // Update Link / Button (Text, Href, Target, Colors, Variant) via Right Sidebar
    const handleUpdateLink = (index: number, fields: {
        text?: string;
        href?: string;
        target?: string;
        bg?: string;
        color?: string;
        border?: string;
        variant?: 'solid' | 'outline' | 'soft' | 'ghost';
    }) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const linkEls = Array.from(sectionEl.querySelectorAll('a, button')).filter(el => {
            if (cards.some(c => c.contains(el))) return false;
            const text = el.textContent?.trim() || '';
            const href = el.getAttribute('href');
            return text.length > 0 || !!href;
        });

        if (linkEls[index]) {
            const el = linkEls[index] as HTMLElement;
            let hasChanged = false;

            if (fields.text !== undefined && (linkEls[index].textContent || '').trim() !== fields.text.trim()) {
                linkEls[index].textContent = fields.text;
                hasChanged = true;
            }
            if (fields.href !== undefined && linkEls[index].getAttribute('href') !== fields.href) {
                linkEls[index].setAttribute('href', fields.href);
                hasChanged = true;
            }
            if (fields.target !== undefined) {
                const currentTarget = linkEls[index].getAttribute('target') || '';
                if (currentTarget !== (fields.target || '')) {
                    if (fields.target) linkEls[index].setAttribute('target', fields.target);
                    else linkEls[index].removeAttribute('target');
                    hasChanged = true;
                }
            }

            if (fields.variant) {
                hasChanged = true;
                if (fields.variant === 'solid') {
                    el.style.backgroundColor = currentColors.primary;
                    el.style.color = currentColors.primaryText || '#ffffff';
                    el.style.border = 'none';
                } else if (fields.variant === 'outline') {
                    el.style.backgroundColor = 'transparent';
                    el.style.color = currentColors.primary;
                    el.style.border = `1.5px solid ${currentColors.primary}`;
                } else if (fields.variant === 'soft') {
                    el.style.backgroundColor = `${currentColors.primary}25`;
                    el.style.color = currentColors.primary;
                    el.style.border = 'none';
                } else if (fields.variant === 'ghost') {
                    el.style.backgroundColor = 'transparent';
                    el.style.color = currentColors.text;
                    el.style.border = 'none';
                }
                el.setAttribute('data-custom-bg', 'true');
                el.setAttribute('data-custom-color', 'true');
            } else {
                if (fields.bg !== undefined && (el.style.backgroundColor || '') !== fields.bg) {
                    if (!fields.bg || fields.bg === 'transparent') {
                        el.style.backgroundColor = 'transparent';
                        el.removeAttribute('data-custom-bg');
                    } else {
                        el.style.backgroundColor = fields.bg;
                        el.setAttribute('data-custom-bg', 'true');
                    }
                    hasChanged = true;
                }
                if (fields.color !== undefined && (el.style.color || '') !== fields.color) {
                    if (!fields.color) {
                        el.style.color = '';
                        el.removeAttribute('data-custom-color');
                    } else {
                        el.style.color = fields.color;
                        el.setAttribute('data-custom-color', 'true');
                    }
                    hasChanged = true;
                }
                if (fields.border !== undefined && (el.style.borderColor || '') !== fields.border) {
                    if (!fields.border) {
                        el.style.borderColor = '';
                        el.removeAttribute('data-custom-border');
                    } else {
                        el.style.borderColor = fields.border;
                        el.setAttribute('data-custom-border', 'true');
                    }
                    hasChanged = true;
                }
            }

            if (!hasChanged) return;

            const updatedHtml = doc.documentElement.outerHTML;
            pushHistory(updatedHtml);

            if (iframeRef.current?.contentDocument) {
                const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
                const liveCards = liveSection ? getCardCandidates(liveSection) : [];
                const liveLinks = liveSection ? Array.from(liveSection.querySelectorAll('a, button')).filter(el => {
                    if (liveCards.some(c => c.contains(el))) return false;
                    const text = el.textContent?.trim() || '';
                    const href = el.getAttribute('href');
                    return text.length > 0 || !!href;
                }) : [];
                if (liveLinks[index]) {
                    const liveEl = liveLinks[index] as HTMLElement;
                    if (fields.text !== undefined) liveEl.textContent = fields.text;
                    if (fields.href !== undefined) liveEl.setAttribute('href', fields.href);
                    if (fields.target !== undefined) {
                        if (fields.target) liveEl.setAttribute('target', fields.target);
                        else liveEl.removeAttribute('target');
                    }
                    if (fields.variant) {
                        if (fields.variant === 'solid') {
                            liveEl.style.backgroundColor = currentColors.primary;
                            liveEl.style.color = currentColors.primaryText || '#ffffff';
                            liveEl.style.border = 'none';
                        } else if (fields.variant === 'outline') {
                            liveEl.style.backgroundColor = 'transparent';
                            liveEl.style.color = currentColors.primary;
                            liveEl.style.border = `1.5px solid ${currentColors.primary}`;
                        } else if (fields.variant === 'soft') {
                            liveEl.style.backgroundColor = `${currentColors.primary}25`;
                            liveEl.style.color = currentColors.primary;
                            liveEl.style.border = 'none';
                        } else if (fields.variant === 'ghost') {
                            liveEl.style.backgroundColor = 'transparent';
                            liveEl.style.color = currentColors.text;
                            liveEl.style.border = 'none';
                        }
                    } else {
                        if (fields.bg !== undefined) liveEl.style.backgroundColor = fields.bg;
                        if (fields.color !== undefined) liveEl.style.color = fields.color;
                        if (fields.border !== undefined) liveEl.style.borderColor = fields.border;
                    }
                }
            }
        }
    };

    // Update Standalone Image (src, alt) via Right Sidebar
    const handleUpdateImage = (index: number, fields: { src?: string; alt?: string }) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const imgEls = Array.from(sectionEl.querySelectorAll('img')).filter(el => !cards.some(c => c.contains(el)));
        if (imgEls[index]) {
            let hasChanged = false;
            if (fields.src !== undefined && imgEls[index].getAttribute('src') !== fields.src) {
                imgEls[index].setAttribute('src', fields.src);
                hasChanged = true;
            }
            if (fields.alt !== undefined && imgEls[index].getAttribute('alt') !== fields.alt) {
                imgEls[index].setAttribute('alt', fields.alt);
                hasChanged = true;
            }
            if (!hasChanged) return;

            const updatedHtml = doc.documentElement.outerHTML;
            pushHistory(updatedHtml);

            if (iframeRef.current?.contentDocument) {
                const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
                const liveCards = liveSection ? getCardCandidates(liveSection) : [];
                const liveImgs = liveSection ? Array.from(liveSection.querySelectorAll('img')).filter(el => !liveCards.some(c => c.contains(el))) : [];
                if (liveImgs[index]) {
                    if (fields.src !== undefined) liveImgs[index].setAttribute('src', fields.src);
                    if (fields.alt !== undefined) liveImgs[index].setAttribute('alt', fields.alt);
                }
            }
        }
    };

    // Update Section-Level Styles (Group Level)
    const handleUpdateSectionStyle = (styles: { backgroundColor?: string; textColor?: string }) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        if (styles.backgroundColor !== undefined) {
            if (styles.backgroundColor === 'transparent' || !styles.backgroundColor) {
                sectionEl.style.backgroundColor = 'transparent';
                sectionEl.setAttribute('data-custom-bg', 'true');
            } else {
                sectionEl.style.backgroundColor = styles.backgroundColor;
                sectionEl.setAttribute('data-custom-bg', 'true');
            }
        }

        if (styles.textColor !== undefined) {
            if (!styles.textColor) {
                sectionEl.style.color = '';
                sectionEl.removeAttribute('data-custom-color');
            } else {
                sectionEl.style.color = styles.textColor;
                sectionEl.setAttribute('data-custom-color', 'true');
            }
        }

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);

        if (iframeRef.current?.contentDocument) {
            const liveEl = iframeRef.current.contentDocument.getElementById(selectedSectionId);
            if (liveEl) {
                if (styles.backgroundColor !== undefined) liveEl.style.backgroundColor = styles.backgroundColor;
                if (styles.textColor !== undefined) liveEl.style.color = styles.textColor;
            }
        }
        toast.success('Section styles updated');
    };

    // Update Cards / Containers in Section (Individual or Group Styling)
    const handleUpdateCardStyle = (cardIndex: number | 'all', styles: { bg?: string; border?: string; color?: string }) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cardCandidateEls = getCardCandidates(sectionEl);

        const targets = cardIndex === 'all' ? cardCandidateEls : (cardCandidateEls[cardIndex] ? [cardCandidateEls[cardIndex]] : []);
        targets.forEach(el => {
            if (styles.bg !== undefined) {
                el.style.backgroundColor = styles.bg;
                el.setAttribute('data-custom-bg', 'true');
            }
            if (styles.border !== undefined) {
                el.style.borderColor = styles.border;
                el.setAttribute('data-custom-border', 'true');
            }
            if (styles.color !== undefined) {
                el.style.color = styles.color;
                el.setAttribute('data-custom-color', 'true');
            }
        });

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);

        if (iframeRef.current?.contentDocument) {
            const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
            if (liveSection) {
                const liveCards = getCardCandidates(liveSection);
                const liveTargets = cardIndex === 'all' ? liveCards : (liveCards[cardIndex] ? [liveCards[cardIndex]] : []);
                liveTargets.forEach(el => {
                    if (styles.bg !== undefined) el.style.backgroundColor = styles.bg;
                    if (styles.border !== undefined) el.style.borderColor = styles.border;
                    if (styles.color !== undefined) el.style.color = styles.color;
                });
            }
        }
        toast.success(cardIndex === 'all' ? 'Updated all cards in section' : 'Card styling updated');
    };

    // Update Card Content (Title, Description, Button, Image, Colors)
    const handleUpdateCardContent = (
        cardIndex: number,
        updates: {
            badge?: string;
            badgeColor?: string;
            title?: string;
            titleColor?: string;
            description?: string;
            descriptionColor?: string;
            buttonText?: string;
            buttonHref?: string;
            buttonBg?: string;
            buttonColor?: string;
            imageSrc?: string;
            imageAlt?: string;
            bg?: string;
            border?: string;
            color?: string;
        }
    ) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const cardEl = cards[cardIndex];
        if (!cardEl) return;

        let hasChanged = false;

        // 0. Badge / Tag
        if (updates.badge !== undefined) {
            const badgeEl = cardEl.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') as HTMLElement | null;
            if (badgeEl && (badgeEl.textContent || '') !== updates.badge) {
                badgeEl.textContent = updates.badge;
                hasChanged = true;
            }
        }
        if (updates.badgeColor !== undefined) {
            const badgeEl = cardEl.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') as HTMLElement | null;
            if (badgeEl) {
                badgeEl.style.color = updates.badgeColor;
                hasChanged = true;
            }
        }

        // 1. Title
        if (updates.title !== undefined) {
            let headingEl = cardEl.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') as HTMLElement | null;
            if (!headingEl) {
                headingEl = doc.createElement('h3');
                headingEl.className = 'text-xl font-bold mb-2';
                cardEl.prepend(headingEl);
            }
            if ((headingEl.textContent || '') !== updates.title) {
                headingEl.textContent = updates.title;
                hasChanged = true;
            }
        }
        if (updates.titleColor !== undefined) {
            const headingEl = cardEl.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') as HTMLElement | null;
            if (headingEl) {
                const currentColor = headingEl.style.color || '';
                if (currentColor !== updates.titleColor) {
                    if (!updates.titleColor) {
                        headingEl.style.color = '';
                        headingEl.removeAttribute('data-custom-color');
                    } else {
                        headingEl.style.color = updates.titleColor;
                        headingEl.setAttribute('data-custom-color', 'true');
                    }
                    hasChanged = true;
                }
            }
        }

        // 2. Description
        if (updates.description !== undefined) {
            let pEl = cardEl.querySelector('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') as HTMLElement | null;
            if (!pEl) {
                pEl = doc.createElement('p');
                pEl.className = 'text-sm mb-4';
                const headingEl = cardEl.querySelector('h1, h2, h3, h4, h5, h6');
                if (headingEl && headingEl.nextSibling) {
                    cardEl.insertBefore(pEl, headingEl.nextSibling);
                } else {
                    cardEl.appendChild(pEl);
                }
            }
            if ((pEl.textContent || '') !== updates.description) {
                pEl.textContent = updates.description;
                hasChanged = true;
            }
        }
        if (updates.descriptionColor !== undefined) {
            const pEl = cardEl.querySelector('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') as HTMLElement | null;
            if (pEl) {
                const currentColor = pEl.style.color || '';
                if (currentColor !== updates.descriptionColor) {
                    if (!updates.descriptionColor) {
                        pEl.style.color = '';
                        pEl.removeAttribute('data-custom-color');
                    } else {
                        pEl.style.color = updates.descriptionColor;
                        pEl.setAttribute('data-custom-color', 'true');
                    }
                    hasChanged = true;
                }
            }
        }

        // 3. Button
        if (updates.buttonText !== undefined || updates.buttonHref !== undefined || updates.buttonBg !== undefined || updates.buttonColor !== undefined) {
            let btnEl = cardEl.querySelector('a, button, [role="button"]') as HTMLElement | null;
            if (!btnEl && (updates.buttonText || updates.buttonHref)) {
                btnEl = doc.createElement('a');
                btnEl.className = 'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-all';
                cardEl.appendChild(btnEl);
            }
            if (btnEl) {
                if (updates.buttonText !== undefined && (btnEl.textContent || '') !== updates.buttonText) {
                    btnEl.textContent = updates.buttonText;
                    hasChanged = true;
                }
                if (updates.buttonHref !== undefined && btnEl.getAttribute('href') !== updates.buttonHref) {
                    btnEl.setAttribute('href', updates.buttonHref);
                    hasChanged = true;
                }
                if (updates.buttonBg !== undefined && (btnEl.style.backgroundColor || '') !== updates.buttonBg) {
                    if (!updates.buttonBg) {
                        btnEl.style.backgroundColor = '';
                        btnEl.removeAttribute('data-custom-bg');
                    } else {
                        btnEl.style.backgroundColor = updates.buttonBg;
                        btnEl.setAttribute('data-custom-bg', 'true');
                    }
                    hasChanged = true;
                }
                if (updates.buttonColor !== undefined && (btnEl.style.color || '') !== updates.buttonColor) {
                    if (!updates.buttonColor) {
                        btnEl.style.color = '';
                        btnEl.removeAttribute('data-custom-color');
                    } else {
                        btnEl.style.color = updates.buttonColor;
                        btnEl.setAttribute('data-custom-color', 'true');
                    }
                    hasChanged = true;
                }
            }
        }

        // 4. Image
        if (updates.imageSrc !== undefined || updates.imageAlt !== undefined) {
            let imgEl = cardEl.querySelector('img') as HTMLImageElement | null;
            if (!imgEl && updates.imageSrc) {
                imgEl = doc.createElement('img');
                imgEl.className = 'w-full h-48 object-cover rounded-xl mb-4';
                cardEl.prepend(imgEl);
            }
            if (imgEl) {
                if (updates.imageSrc !== undefined && imgEl.getAttribute('src') !== updates.imageSrc) {
                    imgEl.src = updates.imageSrc;
                    imgEl.setAttribute('src', updates.imageSrc);
                    hasChanged = true;
                }
                if (updates.imageAlt !== undefined && imgEl.getAttribute('alt') !== updates.imageAlt) {
                    imgEl.alt = updates.imageAlt;
                    imgEl.setAttribute('alt', updates.imageAlt);
                    hasChanged = true;
                }
            }
        }

        // 5. Card styles
        if (updates.bg !== undefined && (cardEl.style.backgroundColor || '') !== updates.bg) {
            if (!updates.bg) {
                cardEl.style.backgroundColor = '';
                cardEl.removeAttribute('data-custom-bg');
            } else {
                cardEl.style.backgroundColor = updates.bg;
                cardEl.setAttribute('data-custom-bg', 'true');
            }
            hasChanged = true;
        }
        if (updates.border !== undefined && (cardEl.style.borderColor || '') !== updates.border) {
            if (!updates.border) {
                cardEl.style.borderColor = '';
                cardEl.removeAttribute('data-custom-border');
            } else {
                cardEl.style.borderColor = updates.border;
                cardEl.setAttribute('data-custom-border', 'true');
            }
            hasChanged = true;
        }
        if (updates.color !== undefined && (cardEl.style.color || '') !== updates.color) {
            if (!updates.color) {
                cardEl.style.color = '';
                cardEl.removeAttribute('data-custom-color');
            } else {
                cardEl.style.color = updates.color;
                cardEl.setAttribute('data-custom-color', 'true');
            }
            hasChanged = true;
        }

        if (!hasChanged) return;

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);

        if (iframeRef.current?.contentDocument) {
            const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
            if (liveSection) {
                const liveCards = getCardCandidates(liveSection);
                const liveCard = liveCards[cardIndex];
                if (liveCard) {
                    if (updates.badge !== undefined) {
                        const b = liveCard.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') as HTMLElement | null;
                        if (b) b.textContent = updates.badge;
                    }
                    if (updates.badgeColor !== undefined) {
                        const b = liveCard.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') as HTMLElement | null;
                        if (b) b.style.color = updates.badgeColor || '';
                    }
                    if (updates.title !== undefined) {
                        const h = liveCard.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]');
                        if (h) h.textContent = updates.title;
                    }
                    if (updates.titleColor !== undefined) {
                        const h = liveCard.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') as HTMLElement | null;
                        if (h) h.style.color = updates.titleColor || '';
                    }
                    if (updates.description !== undefined) {
                        const p = liveCard.querySelector('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]');
                        if (p) p.textContent = updates.description;
                    }
                    if (updates.descriptionColor !== undefined) {
                        const p = liveCard.querySelector('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') as HTMLElement | null;
                        if (p) p.style.color = updates.descriptionColor || '';
                    }
                    if (updates.buttonText !== undefined) {
                        const b = liveCard.querySelector('a, button, [role="button"]');
                        if (b) b.textContent = updates.buttonText;
                    }
                    if (updates.buttonHref !== undefined) {
                        const b = liveCard.querySelector('a, button, [role="button"]');
                        if (b) b.setAttribute('href', updates.buttonHref);
                    }
                    if (updates.buttonBg !== undefined) {
                        const b = liveCard.querySelector('a, button, [role="button"]') as HTMLElement | null;
                        if (b) b.style.backgroundColor = updates.buttonBg || '';
                    }
                    if (updates.buttonColor !== undefined) {
                        const b = liveCard.querySelector('a, button, [role="button"]') as HTMLElement | null;
                        if (b) b.style.color = updates.buttonColor || '';
                    }
                    if (updates.imageSrc !== undefined) {
                        const im = liveCard.querySelector('img');
                        if (im) {
                            im.src = updates.imageSrc;
                            im.setAttribute('src', updates.imageSrc);
                        }
                    }
                    if (updates.imageAlt !== undefined) {
                        const im = liveCard.querySelector('img');
                        if (im) im.setAttribute('alt', updates.imageAlt);
                    }
                    if (updates.bg !== undefined) liveCard.style.backgroundColor = updates.bg || '';
                    if (updates.border !== undefined) liveCard.style.borderColor = updates.border || '';
                    if (updates.color !== undefined) liveCard.style.color = updates.color || '';
                }
            }
        }
    };

    // Duplicate Card in Section
    const handleDuplicateCard = (cardIndex: number) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const cardEl = cards[cardIndex];
        if (!cardEl || !cardEl.parentElement) return;

        const clone = cardEl.cloneNode(true) as HTMLElement;
        cardEl.parentElement.insertBefore(clone, cardEl.nextSibling);

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);

        if (iframeRef.current?.contentDocument) {
            const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
            if (liveSection) {
                const liveCards = getCardCandidates(liveSection);
                const liveCard = liveCards[cardIndex];
                if (liveCard && liveCard.parentElement) {
                    const liveClone = liveCard.cloneNode(true) as HTMLElement;
                    liveClone.classList.remove('__ss-active-card');
                    liveClone.querySelectorAll('.__ss-active-element').forEach(el => el.classList.remove('__ss-active-element'));
                    liveCard.parentElement.insertBefore(liveClone, liveCard.nextSibling);
                }
            }
        }
        toast.success('Card duplicated');
    };

    // Delete Card from Section
    const handleDeleteCard = (cardIndex: number) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const cardEl = cards[cardIndex];
        if (!cardEl) return;

        cardEl.remove();

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);

        if (iframeRef.current?.contentDocument) {
            const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
            if (liveSection) {
                const liveCards = getCardCandidates(liveSection);
                const liveCard = liveCards[cardIndex];
                if (liveCard) {
                    liveCard.remove();
                }
            }
        }
        setHighlightedTarget(null);
        toast.success('Card removed');
    };

    // Reset Custom Styles for Active Section
    const handleResetSectionStyles = () => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        sectionEl.style.backgroundColor = '';
        sectionEl.style.color = '';
        sectionEl.removeAttribute('data-custom-bg');
        sectionEl.removeAttribute('data-custom-color');

        const styledElements = sectionEl.querySelectorAll('[data-custom-bg], [data-custom-color], [data-custom-border]');
        styledElements.forEach(el => {
            (el as HTMLElement).style.backgroundColor = '';
            (el as HTMLElement).style.color = '';
            (el as HTMLElement).style.borderColor = '';
            el.removeAttribute('data-custom-bg');
            el.removeAttribute('data-custom-color');
            el.removeAttribute('data-custom-border');
        });

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);

        if (iframeRef.current?.contentDocument) {
            const liveEl = iframeRef.current.contentDocument.getElementById(selectedSectionId);
            if (liveEl) {
                liveEl.style.backgroundColor = '';
                liveEl.style.color = '';
                const liveStyled = liveEl.querySelectorAll('[data-custom-bg], [data-custom-color], [data-custom-border]');
                liveStyled.forEach(el => {
                    (el as HTMLElement).style.backgroundColor = '';
                    (el as HTMLElement).style.color = '';
                    (el as HTMLElement).style.borderColor = '';
                    el.removeAttribute('data-custom-bg');
                    el.removeAttribute('data-custom-color');
                    el.removeAttribute('data-custom-border');
                });
            }
        }
        toast.success(`Reset custom styles for ${selectedSectionData?.label || 'section'}`);
    };

    // Reset All Custom Styles Page-Wide
    const handleResetAllComponentOverrides = () => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const customElements = doc.querySelectorAll('[data-custom-bg], [data-custom-color], [data-custom-border]');
        customElements.forEach(el => {
            (el as HTMLElement).style.backgroundColor = '';
            (el as HTMLElement).style.color = '';
            (el as HTMLElement).style.borderColor = '';
            el.removeAttribute('data-custom-bg');
            el.removeAttribute('data-custom-color');
            el.removeAttribute('data-custom-border');
        });

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);
        setIframeSrcDoc(updatedHtml);
        toast.success('Reset all component style overrides to theme defaults');
    };

    // Move section up or down in the document
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= layers.length) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const sectionElements: Element[] = [];
        const bentoGrid = doc.querySelector('[data-bento-grid]');
        if (bentoGrid) {
            const header = doc.querySelector('header, nav');
            if (header) sectionElements.push(header);
            sectionElements.push(...Array.from(bentoGrid.children));
            const footer = doc.querySelector('footer');
            if (footer && !sectionElements.includes(footer)) sectionElements.push(footer);
        } else {
            const bodyChildren = Array.from(doc.body.children);
            for (const child of bodyChildren) {
                const tag = child.tagName.toLowerCase();
                if (['script', 'style', 'noscript'].includes(tag)) continue;
                if (tag === 'main' && child.children.length > 0) {
                    sectionElements.push(...Array.from(child.children));
                } else {
                    sectionElements.push(child);
                }
            }
        }

        const currentEl = sectionElements[index];
        const targetEl = sectionElements[targetIndex];
        if (!currentEl || !targetEl) return;

        const parent = currentEl.parentElement;
        if (!parent) return;

        if (direction === 'up') {
            parent.insertBefore(currentEl, targetEl);
        } else {
            parent.insertBefore(targetEl, currentEl);
        }

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);
        setIframeSrcDoc(updatedHtml);
        toast.success(`Moved section ${direction}`);
    };

    // Toggle section visibility (show/hide)
    const toggleSectionVisibility = (sectionId: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const el = doc.getElementById(sectionId) || doc.querySelector(`[data-section-id="${sectionId}"]`);
        if (!el) return;

        const htmlEl = el as HTMLElement;
        const isCurrentlyHidden = htmlEl.style.display === 'none' || htmlEl.classList.contains('hidden');

        if (isCurrentlyHidden) {
            htmlEl.style.display = '';
            htmlEl.classList.remove('hidden');
        } else {
            htmlEl.style.display = 'none';
        }

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);
        setIframeSrcDoc(updatedHtml);
        toast.success(isCurrentlyHidden ? 'Section shown' : 'Section hidden');
    };

    // Delete section from document
    const deleteSection = (sectionId: string, label: string) => {
        if (layers.length <= 1) {
            toast.error('Cannot delete the last section');
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const el = doc.getElementById(sectionId) || doc.querySelector(`[data-section-id="${sectionId}"]`);
        if (!el) return;

        el.remove();

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);
        setIframeSrcDoc(updatedHtml);

        // Select next available section
        const remaining = layers.filter(l => l.id !== sectionId);
        if (remaining.length > 0) {
            setSelectedSectionId(remaining[0].id);
        }
        setHighlightedTarget(null);
        toast.success(`Removed "${label}" section`);
    };

    // Duplicate section
    const duplicateSection = (sectionId: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const el = doc.getElementById(sectionId) || doc.querySelector(`[data-section-id="${sectionId}"]`);
        if (!el) return;

        const clone = el.cloneNode(true) as HTMLElement;
        const newId = `${sectionId}-copy-${Date.now()}`;
        clone.id = newId;
        el.parentElement?.insertBefore(clone, el.nextSibling);

        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);
        setIframeSrcDoc(updatedHtml);
        setSelectedSectionId(newId);
        toast.success('Section duplicated');
    };

    // Auto-expand collapsed sidebar group when highlightedTarget changes
    useEffect(() => {
        if (!highlightedTarget) return;
        const typeToGroup: Record<string, string> = {
            heading: 'headings',
            paragraph: 'paragraphs',
            card: 'cards',
            link: 'links',
            image: 'images',
        };
        const group = typeToGroup[highlightedTarget.type];
        if (group && collapsedSections[group]) {
            setCollapsedSections(prev => ({ ...prev, [group]: false }));
        }
    }, [highlightedTarget]);

    // Apply color palette (both preset and custom colors) across the entire document & iframe
    const applyColors = useCallback((newColors: ColorPalette, label?: string) => {
        const oldColors = extractCurrentColors(html);
        let updatedHtml = html;

        // 1. All known hex colors for robust cross-theme translation without leaving artifacts
        const hexReplacements: Array<{ oldHexes: string[]; newHex: string }> = [
            {
                oldHexes: [
                    oldColors.background,
                    currentColors.background,
                    '#faf6f0', '#ffffff', '#fbfaf6', '#09090b', '#0a0a0a', '#0c0a09', '#020617', '#030712',
                    '#fff5f6', '#090417', '#0c071e', '#0f172a', '#0b1120', '#021e17', '#031f17', '#051f18', '#140e0b'
                ],
                newHex: newColors.background
            },
            {
                oldHexes: [
                    oldColors.surface,
                    currentColors.surface,
                    '#f3eee3', '#f8fafc', '#18181b', '#1c1917', '#ffe4e8', '#170c36',
                    '#190e38', '#1e293b', '#241812', '#064e3b', '#0c4c3b', '#0a3327', '#f3ede2'
                ],
                newHex: newColors.surface
            },
            {
                oldHexes: [
                    oldColors.text,
                    currentColors.text,
                    '#2c2a29', '#0f172a', '#1a202c', '#1c1917', '#292524', '#f5f5f4', '#f8fafc', '#fafafa',
                    '#4c0519', '#3b0716', '#faf5ff', '#f0fdf4', '#f1fdf1', '#fef3c7', '#f0f9ff'
                ],
                newHex: newColors.text
            },
            {
                oldHexes: [
                    oldColors.textMuted,
                    currentColors.textMuted,
                    '#6b6560', '#64748b', '#718096', '#78716c', '#a8a29e', '#94a3b8', '#a1a1aa', '#9f1239',
                    '#881337', '#d8b4fe', '#6ee7b7', '#a7f3d0', '#ccc7b7', '#625c56', '#475569', '#57534e', '#fcd34d', '#7dd3fc'
                ],
                newHex: newColors.textMuted
            },
            {
                oldHexes: [
                    oldColors.primary,
                    currentColors.primary,
                    '#3b5323', '#2563eb', '#805ad5', '#7c3aed', '#ea580c', '#f59e0b', '#06b6d4', '#0ea5e9',
                    '#f43f5e', '#e11d48', '#a855f7', '#38bdf8', '#10b981', '#16b981'
                ],
                newHex: newColors.primary
            },
            {
                oldHexes: [
                    oldColors.secondary,
                    currentColors.secondary,
                    '#8b5a2b', '#64748b', '#718096', '#78716c', '#d97706', '#0284c7', '#fb7185', '#c084fc',
                    '#94a3b8', '#059669', '#71717a', '#9061f9', '#3b82f6'
                ],
                newHex: newColors.secondary
            }
        ];

        // Replace known hexes across all HTML markup
        hexReplacements.forEach(({ oldHexes, newHex }) => {
            if (!newHex) return;
            const uniqueHexes = Array.from(new Set(oldHexes.filter(Boolean)));
            uniqueHexes.forEach(oldHex => {
                if (!oldHex || oldHex.toLowerCase() === newHex.toLowerCase()) return;
                const escaped = oldHex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                updatedHtml = updatedHtml.replace(new RegExp(escaped, 'gi'), newHex);
            });
        });

        // 2. Update :root CSS variables in the HTML
        updatedHtml = updatedHtml.replace(/--color-primary:\s*[^;]+;/gi, `--color-primary: ${newColors.primary};`);
        updatedHtml = updatedHtml.replace(/--color-primary-text:\s*[^;]+;/gi, `--color-primary-text: ${newColors.primaryText || '#ffffff'};`);
        updatedHtml = updatedHtml.replace(/--color-secondary:\s*[^;]+;/gi, `--color-secondary: ${newColors.secondary};`);
        updatedHtml = updatedHtml.replace(/--color-background:\s*[^;]+;/gi, `--color-background: ${newColors.background};`);
        updatedHtml = updatedHtml.replace(/--color-surface:\s*[^;]+;/gi, `--color-surface: ${newColors.surface};`);
        updatedHtml = updatedHtml.replace(/--color-text:\s*[^;]+;/gi, `--color-text: ${newColors.text};`);
        updatedHtml = updatedHtml.replace(/--color-text-muted:\s*[^;]+;/gi, `--color-text-muted: ${newColors.textMuted};`);
        updatedHtml = updatedHtml.replace(/--color-border:\s*[^;]+;/gi, `--color-border: ${newColors.border || 'rgba(128,128,128,0.15)'};`);

        // 3. Inject high-priority style tag that enforces background, text, card surfaces, and root variables
        const overrideCss = `<style id="__theme_preset_override__">
            :root {
                --color-primary: ${newColors.primary} !important;
                --color-primary-text: ${newColors.primaryText || '#ffffff'} !important;
                --color-secondary: ${newColors.secondary} !important;
                --color-background: ${newColors.background} !important;
                --color-surface: ${newColors.surface} !important;
                --color-text: ${newColors.text} !important;
                --color-text-muted: ${newColors.textMuted} !important;
                --color-border: ${newColors.border || 'rgba(128,128,128,0.15)'} !important;
            }
            html, body {
                background-color: var(--color-background) !important;
                color: var(--color-text) !important;
            }
            body > section:not([data-custom-bg]),
            body > nav:not([data-custom-bg]),
            body > footer:not([data-custom-bg]),
            main > section:not([data-custom-bg]) {
                background-color: var(--color-background) !important;
            }
            h1:not([data-custom-color]),
            h2:not([data-custom-color]),
            h3:not([data-custom-color]),
            h4:not([data-custom-color]),
            h5:not([data-custom-color]),
            h6:not([data-custom-color]) {
                color: var(--color-text) !important;
            }
            p:not([data-custom-color]) {
                color: var(--color-text-muted) !important;
            }
            [class*="rounded-2xl"]:not(button):not(a):not(img):not([data-custom-bg]),
            [class*="rounded-3xl"]:not(button):not(a):not(img):not([data-custom-bg]),
            [class*="rounded-xl"]:not(button):not(a):not(img):not([data-custom-bg]),
            .card:not([data-custom-bg]) {
                background-color: var(--color-surface) !important;
                border-color: var(--color-border) !important;
            }
            [class*="rounded-2xl"]:not(button):not(a):not(img) h1:not([data-custom-color]),
            [class*="rounded-2xl"]:not(button):not(a):not(img) h2:not([data-custom-color]),
            [class*="rounded-2xl"]:not(button):not(a):not(img) h3:not([data-custom-color]),
            [class*="rounded-3xl"]:not(button):not(a):not(img) h1:not([data-custom-color]),
            [class*="rounded-3xl"]:not(button):not(a):not(img) h2:not([data-custom-color]),
            [class*="rounded-3xl"]:not(button):not(a):not(img) h3:not([data-custom-color]) {
                color: var(--color-text) !important;
            }
            [class*="rounded-2xl"]:not(button):not(a):not(img) p:not([data-custom-color]),
            [class*="rounded-3xl"]:not(button):not(a):not(img) p:not([data-custom-color]) {
                color: var(--color-text-muted) !important;
            }
            button[class*="bg-"]:not([class*="bg-transparent"]):not([data-custom-bg]),
            a[class*="bg-"]:not([class*="bg-transparent"]):not([data-custom-bg]),
            .btn-primary:not([data-custom-bg]) {
                background-color: var(--color-primary) !important;
                color: var(--color-primary-text) !important;
            }
            [class*="border-"]:not(button):not(a):not([data-custom-border]) {
                border-color: var(--color-border) !important;
            }
        </style>`;

        if (updatedHtml.includes('id="__theme_preset_override__"')) {
            updatedHtml = updatedHtml.replace(/<style id="__theme_preset_override__">[\s\S]*?<\/style>/i, overrideCss);
        } else if (updatedHtml.includes('</head>')) {
            updatedHtml = updatedHtml.replace('</head>', `${overrideCss}\n</head>`);
        }

        setCurrentColors(newColors);
        pushHistory(updatedHtml);
        setIframeSrcDoc(updatedHtml);

        if (label) {
            toast.success(`Applied ${label}`);
        } else {
            toast.success('Color updated');
        }
    }, [html, currentColors, pushHistory, setupIframeInteraction]);

    const handleColorChange = (key: keyof ColorPalette, value: string) => {
        const nextColors = {
            ...currentColors,
            [key]: value
        };
        applyColors(nextColors);
    };

    // Save changes to backend
    const saveChanges = async () => {
        setIsSaving(true);
        try {
            const payload = {
                html_content: html,
                project_name: projectName
            };

            const res = await fetch(`/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setIsDirty(false);
                toast.success('Website changes saved successfully!');
            } else {
                toast.error(data.message || 'Failed to save changes.');
            }
        } catch (err) {
            console.error('Save failed:', err);
            toast.error('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    // Section Icon Resolver
    const getLayerIcon = (type: string, tag: string) => {
        const t = type.toLowerCase();
        if (t.includes('nav') || tag === 'header') return <LayoutTemplate className="w-4 h-4 text-sky-400" />;
        if (t.includes('hero')) return <Type className="w-4 h-4 text-violet-400" />;
        if (t.includes('logo')) return <Grid className="w-4 h-4 text-emerald-400" />;
        if (t.includes('feature') || t.includes('service')) return <Layers className="w-4 h-4 text-indigo-400" />;
        if (t.includes('stat')) return <BarChart3 className="w-4 h-4 text-amber-400" />;
        if (t.includes('testimonial')) return <MessageSquare className="w-4 h-4 text-pink-400" />;
        if (t.includes('cta')) return <Megaphone className="w-4 h-4 text-rose-400" />;
        if (t.includes('pricing')) return <CreditCard className="w-4 h-4 text-green-400" />;
        if (t.includes('about')) return <User className="w-4 h-4 text-blue-400" />;
        if (t.includes('contact')) return <Mail className="w-4 h-4 text-teal-400" />;
        if (t.includes('footer') || tag === 'footer') return <PanelBottom className="w-4 h-4 text-slate-400" />;
        return <Box className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 select-none">
            <Head title={`Editing ${projectName} - StudioSync`} />

            {/* TOP BAR */}
            <header className="h-14 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 z-30">
                {/* Left: Brand & Project Name */}
                <div className="flex items-center gap-3">
                    <Link
                        href={project.workspace ? `/workspaces/${project.workspace.id}` : '/dashboard'}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        title="Back to Workspace"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Link>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400 font-medium">Projects /</span>
                        {isRenaming ? (
                            <input
                                type="text"
                                value={projectName}
                                onChange={e => { setProjectName(e.target.value); setIsDirty(true); }}
                                onBlur={() => setIsRenaming(false)}
                                onKeyDown={e => { if (e.key === 'Enter') setIsRenaming(false); }}
                                autoFocus
                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        ) : (
                            <button
                                onClick={() => setIsRenaming(true)}
                                className="font-semibold text-zinc-100 hover:text-primary transition-colors cursor-pointer"
                                title="Click to rename"
                            >
                                {projectName}
                            </button>
                        )}

                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                            Home
                        </span>

                        {isDirty ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Unsaved
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                                <Check className="w-3 h-3" /> Saved
                            </span>
                        )}
                    </div>
                </div>

                {/* Center: Device Switcher & History Controls */}
                <div className="flex items-center gap-4">
                    {/* Viewport Toggles */}
                    <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60">
                        <button
                            onClick={() => setViewportMode('desktop')}
                            className={`p-1.5 rounded-md transition-all cursor-pointer ${viewportMode === 'desktop' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            title="Desktop View (100%)"
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewportMode('tablet')}
                            className={`p-1.5 rounded-md transition-all cursor-pointer ${viewportMode === 'tablet' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            title="Tablet View (768px)"
                        >
                            <Tablet className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewportMode('mobile')}
                            className={`p-1.5 rounded-md transition-all cursor-pointer ${viewportMode === 'mobile' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            title="Mobile View (375px)"
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="h-4 w-px bg-zinc-800"></div>

                    {/* Undo / Redo */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="h-4 w-px bg-zinc-800"></div>

                    {/* Visual vs Code Mode */}
                    <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60">
                        <button
                            onClick={() => {
                                if (viewMode === 'code') {
                                    setIframeSrcDoc(html);
                                }
                                setViewMode('visual');
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'visual' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Visual
                        </button>
                        <button
                            onClick={() => setViewMode('code')}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'code' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                        >
                            <Code2 className="w-3.5 h-3.5" /> Code
                        </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const blob = new Blob([html], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Preview generated site in a new browser tab"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Preview
                    </button>

                    <button
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-950/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        {isSaving ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-3.5 h-3.5" /> Publish Changes</>
                        )}
                    </button>
                </div>
            </header>

            {/* MAIN WORKSPACE AREA (3 COLUMNS) */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR: LAYERS */}
                <aside className="w-64 border-r border-zinc-800 bg-zinc-900/60 flex flex-col shrink-0">
                    <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Layers</span>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                            {layers.length}
                        </span>
                    </div>

                    {/* Layers List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {layers.map((layer, index) => {
                            const isSelected = selectedSectionId === layer.id;
                            return (
                                <div
                                    key={layer.id}
                                    onClick={() => handleSelectSection(layer.id)}
                                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer border ${
                                        isSelected
                                            ? 'bg-primary/10 border-primary/50 text-zinc-100 shadow-sm font-semibold'
                                            : 'bg-zinc-800/40 hover:bg-zinc-800 border-transparent text-zinc-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        {getLayerIcon(layer.type, layer.tagName)}
                                        <span className="truncate">{layer.label}</span>
                                        {layer.hidden && (
                                            <span className="text-[10px] text-zinc-500 italic">(Hidden)</span>
                                        )}
                                    </div>

                                    {/* Action buttons on hover/selection */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100 disabled:opacity-20"
                                            title="Move Section Up"
                                        >
                                            <ChevronUp className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}
                                            disabled={index === layers.length - 1}
                                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100 disabled:opacity-20"
                                            title="Move Section Down"
                                        >
                                            <ChevronDown className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(layer.id); }}
                                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100"
                                            title={layer.hidden ? "Show Section" : "Hide Section"}
                                        >
                                            {layer.hidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); duplicateSection(layer.id); }}
                                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100"
                                            title="Duplicate Section"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteSection(layer.id, layer.label); }}
                                            className="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400"
                                            title="Delete Section"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Left Sidebar Footer */}
                    <div className="p-3 border-t border-zinc-800 bg-zinc-900/80">
                        <button
                            onClick={() => {
                                toast.info("To add custom sections, you can edit the HTML in Code mode or generate additions with AI.");
                            }}
                            className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-700 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Section
                        </button>
                    </div>
                </aside>

                {/* CENTER CANVAS AREA WITH BREADCRUMB HEADER */}
                <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
                    {/* Selection Breadcrumb Bar */}
                    {viewMode === 'visual' && (selectedSectionId || highlightedTarget) && (
                        <div className="h-9 px-4 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center gap-1.5 text-xs shrink-0 z-20">
                            <MousePointer className="w-3.5 h-3.5 text-zinc-400" />
                            <button
                                onClick={() => {
                                    if (selectedSectionId) {
                                        highlightSectionInIframe(selectedSectionId);
                                    }
                                    setHighlightedTarget(null);
                                    const doc = iframeRef.current?.contentDocument;
                                    if (doc) {
                                        doc.querySelectorAll('.__ss-active-element').forEach(el => el.classList.remove('__ss-active-element'));
                                        doc.querySelectorAll('.__ss-active-card').forEach(el => el.classList.remove('__ss-active-card'));
                                        const badge = doc.getElementById('__ss-selection-label-badge__');
                                        if (badge) badge.remove();
                                    }
                                }}
                                className="font-medium text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Click to focus on section"
                            >
                                <span>{layers.find(l => l.id === selectedSectionId)?.label || 'Section'}</span>
                            </button>
                            {highlightedTarget && highlightedTarget.type !== 'section' && (
                                <>
                                    <ChevronRight className="w-3 h-3 text-zinc-600" />
                                    <span className="text-zinc-200 font-medium capitalize">
                                        {highlightedTarget.type === 'card'
                                            ? `Card #${highlightedTarget.index + 1}`
                                            : `${highlightedTarget.type} #${highlightedTarget.index + 1}`}
                                    </span>
                                    {highlightedTarget.subField && highlightedTarget.subField !== 'card' && (
                                        <>
                                            <ChevronRight className="w-3 h-3 text-zinc-600" />
                                            <span className="text-primary font-medium capitalize">{highlightedTarget.subField}</span>
                                        </>
                                    )}
                                </>
                            )}
                            {highlightedTarget && highlightedTarget.type === 'section' && (
                                <>
                                    <ChevronRight className="w-3 h-3 text-zinc-600" />
                                    <span className="text-primary font-medium">Colors &amp; Layout</span>
                                </>
                            )}
                            {highlightedTarget && (
                                <button
                                    onClick={() => {
                                        setHighlightedTarget(null);
                                        const doc = iframeRef.current?.contentDocument;
                                        if (doc) {
                                            doc.querySelectorAll('.__ss-active-element').forEach(el => el.classList.remove('__ss-active-element'));
                                            doc.querySelectorAll('.__ss-active-card').forEach(el => el.classList.remove('__ss-active-card'));
                                            const badge = doc.getElementById('__ss-selection-label-badge__');
                                            if (badge) badge.remove();
                                        }
                                    }}
                                    className="ml-auto text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Deselect active element"
                                >
                                    <X className="w-3 h-3" />
                                    <span>Deselect</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Canvas Main Container */}
                    <main
                        onClick={(e) => {
                            // Canvas background click cleanly deselects
                            if (e.target === e.currentTarget) {
                                setHighlightedTarget(null);
                                const doc = iframeRef.current?.contentDocument;
                                if (doc) {
                                    doc.querySelectorAll('.__ss-active-element').forEach(el => el.classList.remove('__ss-active-element'));
                                    doc.querySelectorAll('.__ss-active-card').forEach(el => el.classList.remove('__ss-active-card'));
                                    const badge = doc.getElementById('__ss-selection-label-badge__');
                                    if (badge) badge.remove();
                                }
                            }
                        }}
                        className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-center relative cursor-default"
                    >
                        {viewMode === 'visual' ? (
                        <div
                            className={`h-full w-full flex items-center justify-center transition-all duration-300 ${
                                viewportMode === 'desktop'
                                    ? 'max-w-full'
                                    : viewportMode === 'tablet'
                                    ? 'max-w-[768px]'
                                    : 'max-w-[375px]'
                            }`}
                        >
                            <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-zinc-800 overflow-hidden relative flex flex-col">
                                {/* Device header bar for tablet/mobile frame */}
                                {viewportMode !== 'desktop' && (
                                    <div className="h-6 bg-zinc-800 text-zinc-400 text-[10px] flex items-center justify-between px-3 border-b border-zinc-700 select-none">
                                        <span className="font-mono">{viewportMode === 'tablet' ? '768px (Tablet)' : '375px (Mobile)'}</span>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                                            <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                                        </div>
                                    </div>
                                )}

                                <iframe
                                    ref={iframeRef}
                                    srcDoc={iframeSrcDoc}
                                    onLoad={onIframeLoad}
                                    title="Website Canvas Preview"
                                    className="w-full h-full border-none bg-white"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>
                        </div>
                    ) : (
                        /* RAW CODE EDITOR VIEW */
                        <div className="w-full h-full max-w-5xl bg-zinc-900 rounded-xl border border-zinc-800 p-4 flex flex-col shadow-xl">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-xs text-zinc-400">
                                <span>HTML Source Code</span>
                                <span>Edits reflect live when you switch back to Visual mode</span>
                            </div>
                            <textarea
                                value={html}
                                onChange={(e) => {
                                    setHtml(e.target.value);
                                    setIsDirty(true);
                                }}
                                onBlur={() => {
                                    pushHistory(html);
                                    setIframeSrcDoc(html);
                                }}
                                className="flex-1 w-full bg-zinc-950 font-mono text-xs text-zinc-300 p-4 rounded-lg border border-zinc-800/80 focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                                spellCheck={false}
                            />
                        </div>
                    )}
                </main>
                </div>

                {/* RIGHT SIDEBAR: FULL EDITING INSPECTOR PANEL */}
                <aside className="w-84 sm:w-96 border-l border-zinc-800 bg-zinc-900/90 flex flex-col shrink-0 overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex border-b border-zinc-800 shrink-0">
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors cursor-pointer border-b-2 ${
                                activeTab === 'properties'
                                    ? 'border-primary text-zinc-100 bg-zinc-800/40'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            Content & Properties
                        </button>
                        <button
                            onClick={() => setActiveTab('design')}
                            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors cursor-pointer border-b-2 ${
                                activeTab === 'design'
                                    ? 'border-primary text-zinc-100 bg-zinc-800/40'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            Design Presets
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {activeTab === 'properties' ? (
                            <div className="space-y-6">
                                {/* Interactive Canvas Tip */}
                                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs">
                                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                                    <div className="text-[11px] leading-snug">
                                        <strong className="font-semibold text-zinc-100">Interactive Canvas:</strong> Click any text, button, image, or card directly on the preview to jump straight to its settings here.
                                    </div>
                                </div>

                                {/* SECTION SELECTOR DROPDOWN */}
                                <div className="space-y-1.5 pb-4 border-b border-zinc-800">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                                        <span>Active Section</span>
                                        <span className="text-[10px] text-zinc-500 font-mono">#{selectedSectionId || 'none'}</span>
                                    </label>
                                    <select
                                        value={selectedSectionId || ''}
                                        onChange={(e) => handleSelectSection(e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    >
                                        {layers.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.label} ({l.tagName})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedSectionData ? (
                                    <div className="space-y-6 animate-in fade-in duration-150">
                                        {/* SECTION OVERVIEW (Deselected/General Section state) */}
                                        {highlightedTarget === null && (
                                            <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-zinc-200">{selectedSectionData.label} Overview</span>
                                                    <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">#{selectedSectionData.id}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-400">
                                                    {[
                                                        selectedSectionData.headings.length ? `${selectedSectionData.headings.length} heading${selectedSectionData.headings.length > 1 ? 's' : ''}` : null,
                                                        selectedSectionData.cards.length ? `${selectedSectionData.cards.length} card${selectedSectionData.cards.length > 1 ? 's' : ''}` : null,
                                                        selectedSectionData.links.length ? `${selectedSectionData.links.length} link${selectedSectionData.links.length > 1 ? 's' : ''}` : null,
                                                        selectedSectionData.images.length ? `${selectedSectionData.images.length} image${selectedSectionData.images.length > 1 ? 's' : ''}` : null,
                                                    ].filter(Boolean).map((item, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-zinc-900/70 rounded text-zinc-300 border border-zinc-700/50 font-medium text-[10px]">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-zinc-500 pt-0.5 leading-relaxed">
                                                    Click any element directly on the canvas to inspect its settings, or tweak section styles below.
                                                </p>
                                            </div>
                                        )}

                                        {/* SECTION-LEVEL STYLING & GROUP COLORS */}
                                        <div
                                            id="editor-control-section-0"
                                            className={`space-y-3 p-3.5 rounded-xl transition-all duration-300 ${
                                                highlightedTarget?.type === 'section'
                                                    ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
                                                    : 'bg-zinc-800/30 border border-zinc-800'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                                                    <Paintbrush className="w-3.5 h-3.5 text-primary" />
                                                    <span>Section Colors</span>
                                                    {highlightedTarget?.type === 'section' && (
                                                        <span className="text-[10px] bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse lowercase first-letter:uppercase">
                                                            <Sparkles className="w-3 h-3" /> Selected on canvas
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleResetSectionStyles}
                                                    className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                                                    title="Revert custom section styles back to theme defaults"
                                                >
                                                    <RotateCcw className="w-3 h-3" /> Reset
                                                </button>
                                            </div>

                                            {/* Section Background */}
                                            <div className="space-y-1.5 pt-1">
                                                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                                    <span>Background Color</span>
                                                    <span className="font-mono text-[10px] text-zinc-500">{selectedSectionData.backgroundColor || 'Default (Inherit)'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={normalizeHex(selectedSectionData.backgroundColor || currentColors.background)}
                                                        onChange={(e) => handleUpdateSectionStyle({ backgroundColor: e.target.value })}
                                                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={selectedSectionData.backgroundColor}
                                                        onChange={(e) => handleUpdateSectionStyle({ backgroundColor: e.target.value })}
                                                        placeholder="transparent or #..."
                                                        className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-zinc-200 font-mono"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <button
                                                        onClick={() => handleUpdateSectionStyle({ backgroundColor: 'transparent' })}
                                                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 cursor-pointer"
                                                    >
                                                        Transparent
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateSectionStyle({ backgroundColor: currentColors.background })}
                                                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 cursor-pointer flex items-center gap-1"
                                                    >
                                                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentColors.background }} /> Theme BG
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateSectionStyle({ backgroundColor: currentColors.surface })}
                                                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 cursor-pointer flex items-center gap-1"
                                                    >
                                                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentColors.surface }} /> Surface
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Section Text Color */}
                                            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                                                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                                    <span>Text Color (Headings & Body)</span>
                                                    <span className="font-mono text-[10px] text-zinc-500">{selectedSectionData.textColor || 'Default (Inherit)'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={normalizeHex(selectedSectionData.textColor || currentColors.text)}
                                                        onChange={(e) => handleUpdateSectionStyle({ textColor: e.target.value })}
                                                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={selectedSectionData.textColor}
                                                        onChange={(e) => handleUpdateSectionStyle({ textColor: e.target.value })}
                                                        placeholder="inherit or #..."
                                                        className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-zinc-200 font-mono"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <button
                                                        onClick={() => handleUpdateSectionStyle({ textColor: '' })}
                                                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 cursor-pointer"
                                                    >
                                                        Inherit
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateSectionStyle({ textColor: currentColors.text })}
                                                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 cursor-pointer flex items-center gap-1"
                                                    >
                                                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentColors.text }} /> Theme Text
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateSectionStyle({ textColor: currentColors.primary })}
                                                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 cursor-pointer flex items-center gap-1"
                                                    >
                                                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentColors.primary }} /> Accent
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION HEADINGS & TITLES */}
                                        {selectedSectionData.headings.length > 0 && (
                                            <div className="space-y-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setCollapsedSections(prev => ({ ...prev, headings: !prev.headings }))}
                                                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <HeadingIcon className="w-4 h-4 text-violet-400" />
                                                        <span>Headings & Titles ({selectedSectionData.headings.length})</span>
                                                    </div>
                                                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${collapsedSections.headings ? '-rotate-90' : ''}`} />
                                                </button>
                                                {!collapsedSections.headings && (
                                                    <div className="space-y-3 animate-in fade-in duration-150">
                                                        {selectedSectionData.headings.map((heading) => {
                                                            const isHighlighted = highlightedTarget?.type === 'heading' && highlightedTarget?.index === heading.index;
                                                            return (
                                                                <div
                                                                    key={`${selectedSectionId}-heading-${heading.index}`}
                                                                    id={`editor-control-heading-${heading.index}`}
                                                                    onClick={() => highlightElementInIframe('heading', heading.index)}
                                                                    className={`space-y-2.5 p-3 rounded-lg transition-all duration-300 ${
                                                                        isHighlighted
                                                                            ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
                                                                            : 'bg-zinc-800/40 border border-zinc-800'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-mono uppercase bg-violet-950 text-violet-300 px-1.5 py-0.5 rounded border border-violet-800/40 font-semibold">
                                                                                {heading.tag}
                                                                            </span>
                                                                            {isHighlighted && (
                                                                                <span className="text-[10px] bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                                                                                    <Sparkles className="w-3 h-3" /> Selected on canvas
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[10px] text-zinc-500">Item #{heading.index + 1}</span>
                                                                    </div>
                                                                    <textarea
                                                                        rows={2}
                                                                        defaultValue={heading.text}
                                                                        onFocus={() => highlightElementInIframe('heading', heading.index)}
                                                                        onBlur={(e) => handleUpdateHeading(heading.index, e.target.value)}
                                                                        placeholder="Enter title text..."
                                                                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-md p-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                                                                    />

                                                                    {/* Heading Text Color Control */}
                                                                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/70">
                                                                        <span className="text-[10px] text-zinc-400 font-medium">Text Color:</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => handleUpdateHeadingColor(heading.index, currentColors.text)}
                                                                                className="w-4 h-4 rounded-full border border-black/40 cursor-pointer transition-transform hover:scale-110"
                                                                                style={{ backgroundColor: currentColors.text }}
                                                                                title="Theme Text Color"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleUpdateHeadingColor(heading.index, currentColors.primary)}
                                                                                className="w-4 h-4 rounded-full border border-black/40 cursor-pointer transition-transform hover:scale-110"
                                                                                style={{ backgroundColor: currentColors.primary }}
                                                                                title="Primary Accent Color"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleUpdateHeadingColor(heading.index, currentColors.textMuted)}
                                                                                className="w-4 h-4 rounded-full border border-black/40 cursor-pointer transition-transform hover:scale-110"
                                                                                style={{ backgroundColor: currentColors.textMuted }}
                                                                                title="Muted Text Color"
                                                                            />
                                                                            <input
                                                                                type="color"
                                                                                value={normalizeHex(heading.color || currentColors.text)}
                                                                                onChange={(e) => handleUpdateHeadingColor(heading.index, e.target.value)}
                                                                                className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                                                                                title="Custom Color Picker"
                                                                            />
                                                                            {heading.color && (
                                                                                <button
                                                                                    onClick={() => handleUpdateHeadingColor(heading.index, '')}
                                                                                    className="text-[9px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer ml-1"
                                                                                >
                                                                                    Reset
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* SECTION PARAGRAPHS & BODY TEXT */}
                                        {selectedSectionData.paragraphs.length > 0 && (
                                            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                                                <button
                                                    type="button"
                                                    onClick={() => setCollapsedSections(prev => ({ ...prev, paragraphs: !prev.paragraphs }))}
                                                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <AlignLeft className="w-4 h-4 text-sky-400" />
                                                        <span>Paragraphs & Body Text ({selectedSectionData.paragraphs.length})</span>
                                                    </div>
                                                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${collapsedSections.paragraphs ? '-rotate-90' : ''}`} />
                                                </button>
                                                {!collapsedSections.paragraphs && (
                                                    <div className="space-y-3 animate-in fade-in duration-150">
                                                        {selectedSectionData.paragraphs.map((p) => {
                                                            const isHighlighted = highlightedTarget?.type === 'paragraph' && highlightedTarget?.index === p.index;
                                                            return (
                                                                <div
                                                                    key={`${selectedSectionId}-paragraph-${p.index}`}
                                                                    id={`editor-control-paragraph-${p.index}`}
                                                                    onClick={() => highlightElementInIframe('paragraph', p.index)}
                                                                    className={`space-y-2.5 p-3 rounded-lg transition-all duration-300 ${
                                                                        isHighlighted
                                                                            ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
                                                                            : 'bg-zinc-800/40 border border-zinc-800'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-mono uppercase bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800/40 font-semibold">
                                                                                {p.tag && p.tag !== 'p' ? `${p.tag === 'span' ? 'Label' : p.tag === 'div' ? 'Subtext' : p.tag.toUpperCase()} #${p.index + 1}` : `Paragraph #${p.index + 1}`}
                                                                            </span>
                                                                            {isHighlighted && (
                                                                                <span className="text-[10px] bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                                                                                    <Sparkles className="w-3 h-3" /> Selected on canvas
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[10px] text-zinc-500">#{p.index + 1}</span>
                                                                    </div>
                                                                    <textarea
                                                                        rows={3}
                                                                        defaultValue={p.text}
                                                                        onFocus={() => highlightElementInIframe('paragraph', p.index)}
                                                                        onBlur={(e) => handleUpdateParagraph(p.index, e.target.value)}
                                                                        placeholder="Enter paragraph text..."
                                                                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-md p-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                                                                    />

                                                                    {/* Paragraph Text Color Control */}
                                                                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/70">
                                                                        <span className="text-[10px] text-zinc-400 font-medium">Text Color:</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => handleUpdateParagraphColor(p.index, currentColors.textMuted)}
                                                                                className="w-4 h-4 rounded-full border border-black/40 cursor-pointer transition-transform hover:scale-110"
                                                                                style={{ backgroundColor: currentColors.textMuted }}
                                                                                title="Theme Muted Text"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleUpdateParagraphColor(p.index, currentColors.text)}
                                                                                className="w-4 h-4 rounded-full border border-black/40 cursor-pointer transition-transform hover:scale-110"
                                                                                style={{ backgroundColor: currentColors.text }}
                                                                                title="Theme Main Text"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleUpdateParagraphColor(p.index, currentColors.primary)}
                                                                                className="w-4 h-4 rounded-full border border-black/40 cursor-pointer transition-transform hover:scale-110"
                                                                                style={{ backgroundColor: currentColors.primary }}
                                                                                title="Primary Accent"
                                                                            />
                                                                            <input
                                                                                type="color"
                                                                                value={normalizeHex(p.color || currentColors.textMuted)}
                                                                                onChange={(e) => handleUpdateParagraphColor(p.index, e.target.value)}
                                                                                className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                                                                                title="Custom Color Picker"
                                                                            />
                                                                            {p.color && (
                                                                                <button
                                                                                    onClick={() => handleUpdateParagraphColor(p.index, '')}
                                                                                    className="text-[9px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer ml-1"
                                                                                >
                                                                                    Reset
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* SECTION CARDS & CONTAINERS */}
                                        {selectedSectionData.cards.length > 0 && (
                                            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCollapsedSections(prev => ({ ...prev, cards: !prev.cards }))}
                                                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <Box className="w-4 h-4 text-amber-400" />
                                                        <span>Cards & Containers ({selectedSectionData.cards.length})</span>
                                                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${collapsedSections.cards ? '-rotate-90' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicateCard(selectedSectionData.cards.length - 1)}
                                                        className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 hover:bg-amber-900/40 transition-colors cursor-pointer"
                                                        title="Duplicate last card to add a new one"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        <span>Add Card</span>
                                                    </button>
                                                </div>

                                                {!collapsedSections.cards && (
                                                    <div className="space-y-3 animate-in fade-in duration-150">

                                                {/* Group Styling Controls */}
                                                <div className="space-y-2.5 bg-zinc-800/40 border border-zinc-800 p-3 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-semibold text-zinc-300">Group Card Styling</span>
                                                        <button
                                                            onClick={() => handleUpdateCardStyle('all', { bg: currentColors.surface, border: currentColors.border })}
                                                            className="text-[10px] text-primary hover:underline cursor-pointer"
                                                        >
                                                            Sync All to Theme Surface
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-zinc-400">All Cards Background</label>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="color"
                                                                    value={normalizeHex(currentColors.surface)}
                                                                    onChange={(e) => handleUpdateCardStyle('all', { bg: e.target.value })}
                                                                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                                                                />
                                                                <button
                                                                    onClick={() => handleUpdateCardStyle('all', { bg: currentColors.surface })}
                                                                    className="px-2 py-1 rounded text-[10px] bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-700/60 cursor-pointer w-full text-left truncate"
                                                                >
                                                                    Set All
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-zinc-400">All Cards Border</label>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="color"
                                                                    value={normalizeHex(currentColors.border || '#334155')}
                                                                    onChange={(e) => handleUpdateCardStyle('all', { border: e.target.value })}
                                                                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                                                                />
                                                                <button
                                                                    onClick={() => handleUpdateCardStyle('all', { border: currentColors.border || 'rgba(128,128,128,0.2)' })}
                                                                    className="px-2 py-1 rounded text-[10px] bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-700/60 cursor-pointer w-full text-left truncate"
                                                                >
                                                                    Set All
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Individual Rich Card Inspectors */}
                                                <div className="space-y-3 pt-1">
                                                    {selectedSectionData.cards.map((card) => {
                                                        const isHighlighted = highlightedTarget?.type === 'card' && highlightedTarget?.index === card.index;
                                                        return (
                                                            <div
                                                                key={`${selectedSectionId}-card-${card.index}`}
                                                                id={`editor-control-card-${card.index}`}
                                                                onClick={() => highlightElementInIframe('card', card.index)}
                                                                className={`space-y-3 p-3.5 rounded-xl transition-all duration-300 ${
                                                                    isHighlighted
                                                                        ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
                                                                        : 'bg-zinc-850/60 border border-zinc-800 hover:border-zinc-700'
                                                                }`}
                                                            >
                                                                {/* Card Header & Controls */}
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/50">
                                                                            Card #{card.index + 1}
                                                                        </span>
                                                                        {isHighlighted && (
                                                                            <span className="text-[10px] bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                                                                                <Sparkles className="w-3 h-3" /> Selected on canvas
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDuplicateCard(card.index); }}
                                                                            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                                                            title="Duplicate this card"
                                                                        >
                                                                            <Copy className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        {selectedSectionData.cards.length > 1 && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.index); }}
                                                                                className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                                                                title="Delete this card"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* 0. Card Badge / Category Tag */}
                                                                {(card.hasBadge || card.badge || highlightedTarget?.subField === 'badge') && (
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                                                                                <Tag className="w-3 h-3 text-emerald-400" />
                                                                                <span>Category Tag / Badge</span>
                                                                            </label>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[10px] text-zinc-500">Color:</span>
                                                                                <input
                                                                                    type="color"
                                                                                    value={normalizeHex(card.badgeColor || currentColors.primary)}
                                                                                    onFocus={() => highlightElementInIframe('card', card.index, 'badge')}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { badgeColor: e.target.value })}
                                                                                    className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                                                                                    title="Badge Text Color"
                                                                                />
                                                                                {card.badgeColor && (
                                                                                    <button
                                                                                        onClick={() => handleUpdateCardContent(card.index, { badgeColor: '' })}
                                                                                        className="text-[9px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                                                                                    >
                                                                                        Reset
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            data-card-field="badge"
                                                                            value={card.badge || ''}
                                                                            placeholder="Category tag or badge text (e.g. SaaS Design)..."
                                                                            onFocus={() => highlightElementInIframe('card', card.index, 'badge')}
                                                                            onChange={(e) => handleUpdateCardContent(card.index, { badge: e.target.value })}
                                                                            className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* 1. Card Title */}
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                                                                            <Type className="w-3 h-3 text-amber-400" />
                                                                            <span>Card Title</span>
                                                                        </label>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-zinc-500">Color:</span>
                                                                            <input
                                                                                type="color"
                                                                                value={normalizeHex(card.titleColor || card.color || currentColors.text)}
                                                                                onFocus={() => highlightElementInIframe('card', card.index, 'title')}
                                                                                onChange={(e) => handleUpdateCardContent(card.index, { titleColor: e.target.value })}
                                                                                className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                                                                                title="Title Text Color"
                                                                            />
                                                                            {card.titleColor && (
                                                                                <button
                                                                                    onClick={() => handleUpdateCardContent(card.index, { titleColor: '' })}
                                                                                    className="text-[9px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                                                                                >
                                                                                    Reset
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        data-card-field="title"
                                                                        value={card.title}
                                                                        placeholder="Enter card title or heading..."
                                                                        onFocus={() => highlightElementInIframe('card', card.index, 'title')}
                                                                        onChange={(e) => handleUpdateCardContent(card.index, { title: e.target.value })}
                                                                        className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                                    />
                                                                </div>

                                                                {/* 2. Card Description / Body */}
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                                                                            <AlignLeft className="w-3 h-3 text-sky-400" />
                                                                            <span>Description / Body</span>
                                                                        </label>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-zinc-500">Color:</span>
                                                                            <input
                                                                                type="color"
                                                                                value={normalizeHex(card.descriptionColor || card.color || currentColors.textMuted)}
                                                                                onFocus={() => highlightElementInIframe('card', card.index, 'description')}
                                                                                onChange={(e) => handleUpdateCardContent(card.index, { descriptionColor: e.target.value })}
                                                                                className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                                                                                title="Description Text Color"
                                                                            />
                                                                            {card.descriptionColor && (
                                                                                <button
                                                                                    onClick={() => handleUpdateCardContent(card.index, { descriptionColor: '' })}
                                                                                    className="text-[9px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                                                                                >
                                                                                    Reset
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <textarea
                                                                        rows={2}
                                                                        data-card-field="description"
                                                                        value={card.description}
                                                                        placeholder="Enter card description or feature details..."
                                                                        onFocus={() => highlightElementInIframe('card', card.index, 'description')}
                                                                        onChange={(e) => handleUpdateCardContent(card.index, { description: e.target.value })}
                                                                        className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y leading-relaxed"
                                                                    />
                                                                </div>

                                                                {/* 3. Card Button / Link */}
                                                                <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/70">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                                                                            <LinkIcon className="w-3 h-3 text-emerald-400" />
                                                                            <span>Button / Action</span>
                                                                        </label>
                                                                        {card.buttonText && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[10px] text-zinc-500">BG:</span>
                                                                                <input
                                                                                    type="color"
                                                                                    value={normalizeHex(card.buttonBg || currentColors.primary)}
                                                                                    onFocus={() => highlightElementInIframe('card', card.index, 'button')}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { buttonBg: e.target.value })}
                                                                                    className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                                                                                    title="Button Background Color"
                                                                                />
                                                                                <span className="text-[10px] text-zinc-500">Text:</span>
                                                                                <input
                                                                                    type="color"
                                                                                    value={normalizeHex(card.buttonColor || currentColors.primaryText || '#ffffff')}
                                                                                    onFocus={() => highlightElementInIframe('card', card.index, 'button')}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { buttonColor: e.target.value })}
                                                                                    className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                                                                                    title="Button Text Color"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input
                                                                            type="text"
                                                                            data-card-field="button"
                                                                            value={card.buttonText}
                                                                            placeholder="Button text (e.g. Learn More)"
                                                                            onFocus={() => highlightElementInIframe('card', card.index, 'button')}
                                                                            onChange={(e) => handleUpdateCardContent(card.index, { buttonText: e.target.value })}
                                                                            className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={card.buttonHref}
                                                                            placeholder="URL (e.g. #contact, /about)"
                                                                            onFocus={() => highlightElementInIframe('card', card.index, 'button')}
                                                                            onChange={(e) => handleUpdateCardContent(card.index, { buttonHref: e.target.value })}
                                                                            className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-mono text-[11px]"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* 4. Card Image (if present or editable) */}
                                                                {card.imageSrc && (
                                                                    <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/70">
                                                                        <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                                                                            <ImageIcon className="w-3 h-3 text-purple-400" />
                                                                            <span>Card Image</span>
                                                                        </label>
                                                                        <div className="flex items-center gap-2">
                                                                            <img
                                                                                src={card.imageSrc}
                                                                                alt={card.imageAlt || 'Card image'}
                                                                                className="w-12 h-12 object-cover rounded-md border border-zinc-700 shrink-0 bg-zinc-950"
                                                                            />
                                                                            <div className="flex-1 space-y-1">
                                                                                <input
                                                                                    type="text"
                                                                                    data-card-field="image"
                                                                                    value={card.imageSrc}
                                                                                    placeholder="Image URL..."
                                                                                    onFocus={() => highlightElementInIframe('card', card.index, 'image')}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { imageSrc: e.target.value })}
                                                                                    className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2 py-1 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-mono text-[11px]"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={card.imageAlt}
                                                                                    placeholder="Alt description..."
                                                                                    onFocus={() => highlightElementInIframe('card', card.index, 'image')}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { imageAlt: e.target.value })}
                                                                                    className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2 py-1 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-[11px]"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* 5. Card Appearance & Color Properties */}
                                                                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                                                                        <Paintbrush className="w-3 h-3 text-primary" /> Card Properties & Colors
                                                                    </span>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[9px] text-zinc-400 block truncate">Background</label>
                                                                            <div className="flex items-center gap-1">
                                                                                <input
                                                                                    type="color"
                                                                                    value={normalizeHex(card.backgroundColor || currentColors.surface)}
                                                                                    onFocus={() => highlightElementInIframe('card', card.index)}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { bg: e.target.value })}
                                                                                    className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer shrink-0"
                                                                                    title="Card Background Color"
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleUpdateCardContent(card.index, { bg: currentColors.surface })}
                                                                                    className="text-[9px] text-zinc-400 hover:text-zinc-200 px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700/50 truncate w-full text-center"
                                                                                >
                                                                                    Surface
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <label className="text-[9px] text-zinc-400 block truncate">Border</label>
                                                                            <div className="flex items-center gap-1">
                                                                                <input
                                                                                    type="color"
                                                                                    value={normalizeHex(card.borderColor || currentColors.border || '#334155')}
                                                                                    onFocus={() => highlightElementInIframe('card', card.index)}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { border: e.target.value })}
                                                                                    className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer shrink-0"
                                                                                    title="Card Border Color"
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleUpdateCardContent(card.index, { border: currentColors.border || 'rgba(128,128,128,0.2)' })}
                                                                                    className="text-[9px] text-zinc-400 hover:text-zinc-200 px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700/50 truncate w-full text-center"
                                                                                >
                                                                                    Theme
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <label className="text-[9px] text-zinc-400 block truncate">Text Color</label>
                                                                            <div className="flex items-center gap-1">
                                                                                <input
                                                                                    type="color"
                                                                                    value={normalizeHex(card.color || currentColors.text)}
                                                                                    onFocus={() => highlightElementInIframe('card', card.index)}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { color: e.target.value })}
                                                                                    className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer shrink-0"
                                                                                    title="Card Text Color"
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleUpdateCardContent(card.index, { color: currentColors.text })}
                                                                                    className="text-[9px] text-zinc-400 hover:text-zinc-200 px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700/50 truncate w-full text-center"
                                                                                >
                                                                                    Theme
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    </div>
                                                </div>
                                            )}
                                            </div>
                                        )}

                                        {/* SECTION BUTTONS & LINKS */}
                                        {selectedSectionData.links.length > 0 && (
                                            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                                                <button
                                                    type="button"
                                                    onClick={() => setCollapsedSections(prev => ({ ...prev, links: !prev.links }))}
                                                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <LinkIcon className="w-4 h-4 text-emerald-400" />
                                                        <span>Buttons & Links ({selectedSectionData.links.length})</span>
                                                    </div>
                                                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${collapsedSections.links ? '-rotate-90' : ''}`} />
                                                </button>
                                                {!collapsedSections.links && (
                                                    <div className="space-y-3 animate-in fade-in duration-150">
                                                    {selectedSectionData.links.map((link) => {
                                                        const isHighlighted = highlightedTarget?.type === 'link' && highlightedTarget?.index === link.index;
                                                        return (
                                                            <div
                                                                key={`${selectedSectionId}-link-${link.index}`}
                                                                id={`editor-control-link-${link.index}`}
                                                                onClick={() => highlightElementInIframe('link', link.index)}
                                                                className={`space-y-2.5 p-3 rounded-lg transition-all duration-300 ${
                                                                    isHighlighted
                                                                        ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
                                                                        : 'bg-zinc-800/40 border border-zinc-800'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/40 font-semibold">
                                                                            {link.isButton ? 'Button' : link.tag}
                                                                        </span>
                                                                        {isHighlighted && (
                                                                            <span className="text-[10px] bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                                                                                <Sparkles className="w-3 h-3" /> Selected on canvas
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[10px] text-zinc-500">#{link.index + 1}</span>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[11px] font-medium text-zinc-400">Button / Link Text</label>
                                                                    <input
                                                                        type="text"
                                                                        defaultValue={link.text}
                                                                        onFocus={() => highlightElementInIframe('link', link.index)}
                                                                        onBlur={(e) => handleUpdateLink(link.index, { text: e.target.value })}
                                                                        placeholder="Label..."
                                                                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[11px] font-medium text-zinc-400">Target URL (href)</label>
                                                                    <input
                                                                        type="text"
                                                                        defaultValue={link.href}
                                                                        onFocus={() => highlightElementInIframe('link', link.index)}
                                                                        onBlur={(e) => handleUpdateLink(link.index, { href: e.target.value })}
                                                                        placeholder="#contact or https://..."
                                                                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                                                                    />
                                                                </div>

                                                                {/* Button Style Variant Presets */}
                                                                <div className="space-y-1 pt-1">
                                                                    <label className="text-[10px] font-medium text-zinc-400">Style Variant</label>
                                                                    <div className="grid grid-cols-4 gap-1">
                                                                        <button
                                                                            onClick={() => handleUpdateLink(link.index, { variant: 'solid' })}
                                                                            className="py-1 px-2 rounded text-[10px] font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 cursor-pointer"
                                                                        >
                                                                            Solid
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateLink(link.index, { variant: 'outline' })}
                                                                            className="py-1 px-2 rounded text-[10px] font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 cursor-pointer"
                                                                        >
                                                                            Outline
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateLink(link.index, { variant: 'soft' })}
                                                                            className="py-1 px-2 rounded text-[10px] font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 cursor-pointer"
                                                                        >
                                                                            Soft
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateLink(link.index, { variant: 'ghost' })}
                                                                            className="py-1 px-2 rounded text-[10px] font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 cursor-pointer"
                                                                        >
                                                                            Ghost
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Button Custom Colors */}
                                                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-zinc-400">Button BG</label>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <input
                                                                                type="color"
                                                                                value={normalizeHex(link.backgroundColor || currentColors.primary)}
                                                                                onFocus={() => highlightElementInIframe('link', link.index)}
                                                                                onChange={(e) => handleUpdateLink(link.index, { bg: e.target.value })}
                                                                                className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleUpdateLink(link.index, { bg: 'transparent' })}
                                                                                className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 cursor-pointer"
                                                                            >
                                                                                Clear
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-zinc-400">Button Text</label>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <input
                                                                                type="color"
                                                                                value={normalizeHex(link.color || currentColors.primaryText || '#ffffff')}
                                                                                onFocus={() => highlightElementInIframe('link', link.index)}
                                                                                onChange={(e) => handleUpdateLink(link.index, { color: e.target.value })}
                                                                                className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleUpdateLink(link.index, { color: '#ffffff' })}
                                                                                className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 cursor-pointer"
                                                                            >
                                                                                White
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer pt-0.5">
                                                                    <input
                                                                        type="checkbox"
                                                                        defaultChecked={link.target === '_blank'}
                                                                        onChange={(e) => handleUpdateLink(link.index, { target: e.target.checked ? '_blank' : '' })}
                                                                        className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-0"
                                                                    />
                                                                    Open in new browser tab
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* SECTION IMAGES */}
                                        {selectedSectionData.images.length > 0 && (
                                            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                                                <button
                                                    type="button"
                                                    onClick={() => setCollapsedSections(prev => ({ ...prev, images: !prev.images }))}
                                                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <ImageIcon className="w-4 h-4 text-amber-400" />
                                                        <span>Images ({selectedSectionData.images.length})</span>
                                                    </div>
                                                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${collapsedSections.images ? '-rotate-90' : ''}`} />
                                                </button>
                                                {!collapsedSections.images && (
                                                    <div className="space-y-4 animate-in fade-in duration-150">
                                                    {selectedSectionData.images.map((img) => {
                                                        const isHighlighted = highlightedTarget?.type === 'image' && highlightedTarget?.index === img.index;
                                                        return (
                                                            <div
                                                                key={`${selectedSectionId}-image-${img.index}`}
                                                                id={`editor-control-image-${img.index}`}
                                                                onClick={() => highlightElementInIframe('image', img.index)}
                                                                className={`space-y-3 p-3 rounded-lg transition-all duration-300 ${
                                                                    isHighlighted
                                                                        ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
                                                                        : 'bg-zinc-800/40 border border-zinc-800'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-mono uppercase bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/40 font-semibold">
                                                                            Image #{img.index + 1}
                                                                        </span>
                                                                        {isHighlighted && (
                                                                            <span className="text-[10px] bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                                                                                <Sparkles className="w-3 h-3" /> Selected on canvas
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Thumbnail Preview */}
                                                                <div className="w-full h-32 bg-zinc-900 rounded-md border border-zinc-700 overflow-hidden relative flex items-center justify-center">
                                                                    {img.src ? (
                                                                        <img
                                                                            src={img.src}
                                                                            alt={img.alt || 'Preview'}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <ImageIcon className="w-8 h-8 text-zinc-600" />
                                                                    )}
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[11px] font-medium text-zinc-400">Image Source URL (src)</label>
                                                                    <input
                                                                        type="text"
                                                                        defaultValue={img.src}
                                                                        onFocus={() => highlightElementInIframe('image', img.index)}
                                                                        onBlur={(e) => handleUpdateImage(img.index, { src: e.target.value })}
                                                                        placeholder="https://..."
                                                                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[11px] font-medium text-zinc-400">Alt Description</label>
                                                                    <input
                                                                        type="text"
                                                                        defaultValue={img.alt}
                                                                        onFocus={() => highlightElementInIframe('image', img.index)}
                                                                        onBlur={(e) => handleUpdateImage(img.index, { alt: e.target.value })}
                                                                        placeholder="Description..."
                                                                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                                                                    />
                                                                </div>

                                                                {/* Quick Stock Photos */}
                                                                <div className="space-y-1.5 pt-2">
                                                                    <span className="text-[10px] font-semibold text-zinc-400 flex items-center justify-between">
                                                                        <span>Choose Stock Preset</span>
                                                                        <Sparkles className="w-3 h-3 text-primary" />
                                                                    </span>
                                                                    <div className="grid grid-cols-3 gap-1.5">
                                                                        {STOCK_PHOTOS.map((stock, i) => (
                                                                            <button
                                                                                key={i}
                                                                                onClick={() => {
                                                                                    handleUpdateImage(img.index, { src: stock.url, alt: stock.label });
                                                                                    highlightElementInIframe('image', img.index);
                                                                                }}
                                                                                className="relative h-12 rounded overflow-hidden border border-zinc-700 hover:border-primary transition-all group cursor-pointer"
                                                                                title={stock.label}
                                                                            >
                                                                                <img src={stock.url} alt={stock.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                                                                                <div className="absolute inset-0 bg-black/40 flex items-end p-0.5">
                                                                                    <span className="text-[8px] text-white truncate leading-none">{stock.label}</span>
                                                                                </div>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                            {/* Upload Placeholder UI */}
                                                            <div className="p-2 bg-zinc-900/60 rounded border border-dashed border-zinc-700 text-center space-y-1">
                                                                <Upload className="w-4 h-4 mx-auto text-zinc-400" />
                                                                <p className="text-[10px] text-zinc-400">Upload Image</p>
                                                                <p className="text-[9px] text-zinc-500">Direct upload coming soon. Paste any URL above or choose a stock preset.</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* SECTION ACTIONS */}
                                        <div className="pt-4 border-t border-zinc-800 space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                                Section Settings
                                            </label>
                                            <button
                                                onClick={() => {
                                                    const layer = layers.find(l => l.id === selectedSectionId);
                                                    if (layer) deleteSection(layer.id, layer.label);
                                                }}
                                                className="w-full py-2 px-3 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove {selectedSectionData.label} Section
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-zinc-500 space-y-2">
                                        <Sliders className="w-8 h-8 mx-auto opacity-50" />
                                        <p className="text-xs">Select a section to edit its content.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* DESIGN PRESETS & CUSTOM COLOR PICKERS TAB */
                            <div className="space-y-6">
                                {/* 1. Theme Presets */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                        Theme Presets
                                    </label>
                                    <p className="text-xs text-zinc-400">
                                        Click any theme below to instantly re-theme the entire website with guaranteed high-contrast colors.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        {DESIGN_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => applyColors(preset.colors, `preset: ${preset.name}`)}
                                                className="p-2.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 hover:border-primary/50 text-left transition-all group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    {preset.dots.map((dot, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                                                            style={{ backgroundColor: dot }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Selecting Custom Colors */}
                                <div className="space-y-3 pt-4 border-t border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                            <Palette className="w-3.5 h-3.5 text-primary" />
                                            <span>Custom Colors</span>
                                        </label>
                                        <button
                                            onClick={handleResetAllComponentOverrides}
                                            className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                                            title="Clear custom component color overrides so global theme applies everywhere"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Reset Overrides
                                        </button>
                                    </div>
                                    <p className="text-xs text-zinc-400">
                                        Fine-tune the global theme palette. Changes apply immediately to all components.
                                    </p>

                                    <div className="space-y-2.5 pt-1">
                                        {/* Primary Accent */}
                                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-200">Primary Accent</p>
                                                <p className="text-[10px] text-zinc-500">Buttons & highlights</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={normalizeHex(currentColors.primary)}
                                                    onChange={(e) => handleColorChange('primary', e.target.value)}
                                                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentColors.primary}
                                                    onChange={(e) => handleColorChange('primary', e.target.value)}
                                                    className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Background Color */}
                                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-200">Background</p>
                                                <p className="text-[10px] text-zinc-500">Main page background</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={normalizeHex(currentColors.background)}
                                                    onChange={(e) => handleColorChange('background', e.target.value)}
                                                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentColors.background}
                                                    onChange={(e) => handleColorChange('background', e.target.value)}
                                                    className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Surface / Card Color */}
                                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-200">Surface / Cards</p>
                                                <p className="text-[10px] text-zinc-500">Containers & cards</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={normalizeHex(currentColors.surface)}
                                                    onChange={(e) => handleColorChange('surface', e.target.value)}
                                                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentColors.surface}
                                                    onChange={(e) => handleColorChange('surface', e.target.value)}
                                                    className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Text Color */}
                                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-200">Text</p>
                                                <p className="text-[10px] text-zinc-500">Headlines & body text</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={normalizeHex(currentColors.text)}
                                                    onChange={(e) => handleColorChange('text', e.target.value)}
                                                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentColors.text}
                                                    onChange={(e) => handleColorChange('text', e.target.value)}
                                                    className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Muted Text */}
                                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-200">Muted Text</p>
                                                <p className="text-[10px] text-zinc-500">Subtitles & captions</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={normalizeHex(currentColors.textMuted)}
                                                    onChange={(e) => handleColorChange('textMuted', e.target.value)}
                                                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentColors.textMuted}
                                                    onChange={(e) => handleColorChange('textMuted', e.target.value)}
                                                    className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Border / Dividers */}
                                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-200">Borders & Lines</p>
                                                <p className="text-[10px] text-zinc-500">Dividers & outlines</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={normalizeHex(currentColors.border || '#334155')}
                                                    onChange={(e) => handleColorChange('border', e.target.value)}
                                                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentColors.border || '#334155'}
                                                    onChange={(e) => handleColorChange('border', e.target.value)}
                                                    className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

ProjectEdit.layout = null;
