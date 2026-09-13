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
    Tag,
    Smile,
    PanelLeft,
    PanelRight,
    Folder,
    FolderOpen,
    FileImage,
    AlertTriangle,
    Search,
    Edit2,
    UploadCloud,
    CheckCircle2,
    Move,
    Crop,
    Maximize2,
    Minimize2,
    ZoomIn
} from 'lucide-react';
import { IconPickerModal } from '@/components/IconPickerModal';

export interface ProjectAsset {
    id: number;
    project_id: number;
    asset_folder_id?: number | null;
    name: string;
    path: string;
    description?: string | null;
    url?: string;
    created_at: string;
    updated_at: string;
}

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
    project_assets?: ProjectAsset[];
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
    hasIcon?: boolean;
    iconSvg?: string;
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
    hasIcon?: boolean;
    iconSvg?: string;
    iconPosition?: 'left' | 'right';
}

interface EditableImage {
    index: number;
    src: string;
    alt: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    objectPosition?: string;
    positionX?: number;
    positionY?: number;
    height?: string;
    aspectRatio?: string;
    scale?: number;
}

interface EditableCard {
    index: number;
    label: string;
    hasIcon?: boolean;
    iconSvg?: string;
    iconColor?: string;
    iconBg?: string;
    hasBadge?: boolean;
    badge?: string;
    badgeColor?: string;
    badgeBg?: string;
    badgeHasIcon?: boolean;
    badgeIconSvg?: string;
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
    buttonHasIcon?: boolean;
    buttonIconSvg?: string;
    buttonIconPosition?: 'left' | 'right';
    imageSrc: string;
    imageAlt: string;
    imageObjectFit?: 'cover' | 'contain' | 'fill' | 'none';
    imageObjectPosition?: string;
    imagePositionX?: number;
    imagePositionY?: number;
    imageHeight?: string;
    imageAspectRatio?: string;
    imageScale?: number;
    imagePlacement?: 'top' | 'bottom';
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

export default function ProjectEdit({
    project,
    initialAssets = []
}: {
    project: Project;
    initialAssets?: ProjectAsset[];
}) {
    // Current HTML and Undo/Redo stack
    const [html, setHtml] = useState<string>(project.html_content || '');
    const [iframeSrcDoc, setIframeSrcDoc] = useState<string>(project.html_content || '');
    const [history, setHistory] = useState<string[]>([project.html_content || '']);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    // Layout & UI states
    const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'properties' | 'design' | 'assets'>('properties');
    const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [projectName, setProjectName] = useState<string>(project.project_name || 'Untitled Project');
    const [isRenaming, setIsRenaming] = useState<boolean>(false);

    // Asset Management State (Cloudflare R2)
    const resolveAssetUrl = useCallback((asset: { url?: string; path?: string } | null | undefined): string => {
        if (!asset) return '';
        if (asset.url && asset.url.trim()) return asset.url;
        if (asset.path && asset.path.trim()) {
            return `https://pub-627cbf9419a14072a2a8e53fdd266960.r2.dev/${asset.path.replace(/^\/+/, '')}`;
        }
        return '';
    }, []);

    const [assets, setAssets] = useState<ProjectAsset[]>(() => {
        const rawList = (initialAssets && initialAssets.length > 0)
            ? initialAssets
            : (project.project_assets && project.project_assets.length > 0)
                ? project.project_assets
                : [];
        return rawList.map(a => ({
            ...a,
            url: a.url || (a.path ? `https://pub-627cbf9419a14072a2a8e53fdd266960.r2.dev/${a.path.replace(/^\/+/, '')}` : '')
        }));
    });

    // Synchronize assets when props update
    useEffect(() => {
        const rawList = (initialAssets && initialAssets.length > 0)
            ? initialAssets
            : (project.project_assets && project.project_assets.length > 0)
                ? project.project_assets
                : [];
        if (rawList.length > 0) {
            setAssets(rawList.map(a => ({
                ...a,
                url: a.url || (a.path ? `https://pub-627cbf9419a14072a2a8e53fdd266960.r2.dev/${a.path.replace(/^\/+/, '')}` : '')
            })));
        }
    }, [initialAssets, project.project_assets]);

    const [isUploadingAsset, setIsUploadingAsset] = useState<boolean>(false);
    const [isReplacingAsset, setIsReplacingAsset] = useState<boolean>(false);
    const [assetSearchQuery, setAssetSearchQuery] = useState<string>('');
    const [editingAsset, setEditingAsset] = useState<ProjectAsset | null>(null);
    const [assetToReplace, setAssetToReplace] = useState<ProjectAsset | null>(null);
    const [assetPickerModal, setAssetPickerModal] = useState<{
        isOpen: boolean;
        targetType: 'image' | 'card';
        targetIndex: number;
    } | null>(null);

    // Asset Input Refs
    const newAssetFileInputRef = useRef<HTMLInputElement>(null);
    const replaceAssetFileInputRef = useRef<HTMLInputElement>(null);
    const directUploadFileInputRef = useRef<HTMLInputElement>(null);
    const targetDirectUploadRef = useRef<{ type: 'image' | 'card'; index: number } | null>(null);

    // Responsive sidebar toggles (layers panel and inspector panel)
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1280;
        }
        return true;
    });
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    // Layers & Selected Section
    const [layers, setLayers] = useState<LayerSection[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [currentColors, setCurrentColors] = useState<ColorPalette>(() => extractCurrentColors(project.html_content || ''));

    // Highlighted element tracking (bi-directional canvas <-> right sidebar settings)
    const [highlightedTarget, setHighlightedTarget] = useState<{
        type: 'heading' | 'paragraph' | 'link' | 'image' | 'card' | 'section';
        index: number;
        subField?: 'title' | 'description' | 'button' | 'image' | 'badge' | 'card' | 'icon';
        timestamp: number;
    } | null>(null);

    // Icon Picker Modal State
    const [iconPickerTarget, setIconPickerTarget] = useState<{
        type: 'card' | 'link' | 'card-button' | 'card-badge' | 'paragraph';
        cardIndex?: number;
        linkIndex?: number;
        paragraphIndex?: number;
        currentSvg?: string;
        currentPosition?: 'left' | 'right';
        currentContainerStyle?: 'none' | 'badge-soft' | 'badge-outline' | 'circle';
        label: string;
        allowPosition?: boolean;
        allowContainerStyle?: boolean;
    } | null>(null);

    // References
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const selectedSectionIdRef = useRef<string | null>(null);
    useEffect(() => {
        selectedSectionIdRef.current = selectedSectionId;
    }, [selectedSectionId]);
    const handleUpdateCardContentRef = useRef<any>(null);
    const handleUpdateImageRef = useRef<any>(null);
    const handleUploadAssetRef = useRef<any>(null);

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
            if (parentChildren.length < 2) {
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

// Helper to accurately extract standalone buttons and links outside cards (ensuring 100% index parity everywhere)
const getStandaloneLinks = (sectionEl: HTMLElement, cards: HTMLElement[]): HTMLElement[] => {
    return Array.from(sectionEl.querySelectorAll<HTMLElement>('a, button, [role="button"]'))
        .filter(el => {
            if (cards.some(c => c.contains(el))) return false;
            if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden') return false;
            const text = (el.textContent || '').trim();
            const href = el.getAttribute('href');
            const hasSvg = !!el.querySelector('svg');
            const hasImg = !!el.querySelector('img');
            return text.length > 0 || !!href || hasSvg || hasImg;
        });
};

// Helper to safely update button/badge/link text while preserving any embedded <svg> icon
const updateElementTextPreservingSvg = (el: HTMLElement, newText: string) => {
    const existingSvg = el.querySelector('svg');
    if (!existingSvg) {
        el.textContent = newText;
        return;
    }
    const isSvgFirst = el.firstElementChild === existingSvg || (el.childNodes.length > 1 && el.childNodes[0] === existingSvg);
    const span = el.querySelector('span');
    if (span && span !== (existingSvg as any) && !span.contains(existingSvg)) {
        span.textContent = newText;
    } else {
        const svgClone = existingSvg.cloneNode(true) as SVGElement;
        el.innerHTML = '';
        if (isSvgFirst) {
            el.appendChild(svgClone);
            el.appendChild(el.ownerDocument.createTextNode(' ' + newText.trim()));
        } else {
            el.appendChild(el.ownerDocument.createTextNode(newText.trim() + ' '));
            el.appendChild(svgClone);
        }
    }
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

                // Card Icon detection (SVG not in button or badge)
                const cardSvgs = Array.from(el.querySelectorAll('svg')).filter(svg => {
                    if (buttonEl && buttonEl.contains(svg)) return false;
                    if (badgeEl && badgeEl.contains(svg)) return false;
                    return true;
                });
                const cardIconSvgEl = cardSvgs[0] as SVGElement | null;
                const hasCardIcon = !!cardIconSvgEl;
                const cardIconSvg = cardIconSvgEl ? cardIconSvgEl.outerHTML : '';
                const cardIconWrapper = cardIconSvgEl?.parentElement && cardIconSvgEl.parentElement !== el && cardIconSvgEl.parentElement.children.length === 1
                    ? cardIconSvgEl.parentElement as HTMLElement
                    : null;
                const cardIconBg = cardIconWrapper?.style.backgroundColor || '';
                const cardIconColor = (cardIconSvgEl as HTMLElement)?.style.color || '';

                // Card Button Icon detection
                const btnSvg = buttonEl?.querySelector('svg') || null;
                const btnHasIcon = !!btnSvg;
                const btnIconSvg = btnSvg ? btnSvg.outerHTML : '';
                let btnIconPos: 'left' | 'right' = 'left';
                if (btnSvg && buttonEl && buttonEl.childNodes.length > 1) {
                    const children = Array.from(buttonEl.childNodes);
                    const sIdx = children.indexOf(btnSvg);
                    const tIdx = children.findIndex(c => c !== btnSvg && (c.textContent || '').trim().length > 0);
                    if (tIdx !== -1 && sIdx > tIdx) btnIconPos = 'right';
                }

                // Card Badge Icon detection
                const badgeSvg = badgeEl?.querySelector('svg') || null;
                const badgeHasIcon = !!badgeSvg;
                const badgeIconSvg = badgeSvg ? badgeSvg.outerHTML : '';

                const titleText = headingEl?.textContent?.trim() || '';
                const label = titleText ? (titleText.length > 25 ? titleText.slice(0, 25) + '...' : titleText) : `Card #${index + 1}`;
                const hasBadgeEl = !!(badgeEl && badgeEl !== headingEl && badgeEl !== buttonEl);
                const badgeText = hasBadgeEl ? (badgeEl!.textContent || '').trim() : '';
                const isBtn = buttonEl ? (buttonEl.tagName.toLowerCase() === 'button' || /rounded|bg-|btn|px-|py-/.test(buttonEl.className)) : false;

                return {
                    index,
                    label,
                    hasIcon: hasCardIcon,
                    iconSvg: cardIconSvg,
                    iconColor: cardIconColor,
                    iconBg: cardIconBg,
                    hasBadge: hasBadgeEl,
                    badge: badgeText,
                    badgeColor: badgeEl?.style.color || '',
                    badgeBg: badgeEl?.style.backgroundColor || '',
                    badgeHasIcon,
                    badgeIconSvg,
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
                    buttonHasIcon: btnHasIcon,
                    buttonIconSvg: btnIconSvg,
                    buttonIconPosition: btnIconPos,
                    imageSrc: imgEl ? (imgEl.getAttribute('src') || imgEl.src || '') : '',
                    imageAlt: imgEl?.getAttribute('alt') || '',
                    imageObjectFit: (() => {
                        if (!imgEl) return 'cover';
                        const raw = imgEl.style.objectFit || (imgEl.classList.contains('object-contain') ? 'contain' : imgEl.classList.contains('object-fill') ? 'fill' : imgEl.classList.contains('object-none') ? 'none' : 'cover');
                        return (['cover', 'contain', 'fill', 'none'].includes(raw) ? raw : 'cover') as any;
                    })(),
                    imageObjectPosition: imgEl?.style.objectPosition || '50% 50%',
                    imagePositionX: (() => {
                        if (!imgEl) return 50;
                        const pos = imgEl.style.objectPosition || '';
                        if (pos) {
                            const parts = pos.trim().split(/\s+/);
                            const x = parseFloat(parts[0]);
                            if (!isNaN(x)) return Math.round(x);
                        }
                        if (imgEl.classList.contains('object-left')) return 0;
                        if (imgEl.classList.contains('object-right')) return 100;
                        return 50;
                    })(),
                    imagePositionY: (() => {
                        if (!imgEl) return 50;
                        const pos = imgEl.style.objectPosition || '';
                        if (pos) {
                            const parts = pos.trim().split(/\s+/);
                            if (parts.length >= 2) {
                                const y = parseFloat(parts[1]);
                                if (!isNaN(y)) return Math.round(y);
                            }
                        }
                        if (imgEl.classList.contains('object-top')) return 0;
                        if (imgEl.classList.contains('object-bottom')) return 100;
                        return 50;
                    })(),
                    imageHeight: imgEl?.style.height || '',
                    imageAspectRatio: imgEl?.style.aspectRatio || '',
                    imageScale: (() => {
                        if (!imgEl || !imgEl.style.transform) return 100;
                        const m = imgEl.style.transform.match(/scale\(([\d.]+)\)/);
                        return m ? Math.round(parseFloat(m[1]) * 100) : 100;
                    })(),
                    imagePlacement: (imgEl && el.firstElementChild === imgEl) ? 'top' : (imgEl && el.lastElementChild === imgEl) ? 'bottom' : 'top',
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
            const paragraphs: EditableParagraph[] = pEls.map((el, index) => {
                const pSvg = el.querySelector('svg') || (el.parentElement?.classList.contains('rounded-full') ? el.parentElement.querySelector('svg') : null);
                return {
                    index,
                    tag: el.tagName.toLowerCase(),
                    text: el.textContent?.trim() || '',
                    color: (el as HTMLElement).style.color || '',
                    hasIcon: !!pSvg,
                    iconSvg: pSvg ? pSvg.outerHTML : ''
                };
            });

            // 4. Standalone Links & Buttons: a, button, [role="button"] (outside cards)
            const linkEls = getStandaloneLinks(sectionEl as HTMLElement, cardCandidateEls);
            const links: EditableLink[] = linkEls.map((el, index) => {
                const htmlEl = el as HTMLElement;
                const isBtn = el.tagName.toLowerCase() === 'button' || /rounded|bg-|btn|px-|py-/.test(el.className);
                const linkSvg = el.querySelector('svg');
                const linkHasIcon = !!linkSvg;
                const linkIconSvg = linkSvg ? linkSvg.outerHTML : '';
                let linkIconPos: 'left' | 'right' = 'left';
                if (linkSvg && el.childNodes.length > 1) {
                    const children = Array.from(el.childNodes);
                    const sIdx = children.indexOf(linkSvg);
                    const tIdx = children.findIndex(c => c !== linkSvg && (c.textContent || '').trim().length > 0);
                    if (tIdx !== -1 && sIdx > tIdx) linkIconPos = 'right';
                }
                return {
                    index,
                    tag: el.tagName.toLowerCase(),
                    text: el.textContent?.trim() || '',
                    href: el.getAttribute('href') || '',
                    target: el.getAttribute('target') || '',
                    backgroundColor: htmlEl.style.backgroundColor || '',
                    color: htmlEl.style.color || '',
                    borderColor: htmlEl.style.borderColor || '',
                    isButton: isBtn,
                    hasIcon: linkHasIcon,
                    iconSvg: linkIconSvg,
                    iconPosition: linkIconPos
                };
            });

            // 5. Standalone Images: img (outside cards)
            const imgEls = Array.from(sectionEl.querySelectorAll('img'))
                .filter(el => !cardCandidateEls.some(card => card.contains(el)));
            const images: EditableImage[] = imgEls.map((el, index) => {
                const rawFit = el.style.objectFit || (el.classList.contains('object-contain') ? 'contain' : el.classList.contains('object-fill') ? 'fill' : el.classList.contains('object-none') ? 'none' : 'cover');
                const objFit = (['cover', 'contain', 'fill', 'none'].includes(rawFit) ? rawFit : 'cover') as any;
                const posStr = el.style.objectPosition || '50% 50%';
                let posX = 50;
                let posY = 50;
                if (posStr) {
                    const parts = posStr.trim().split(/\s+/);
                    const x = parseFloat(parts[0]);
                    const y = parseFloat(parts[1]);
                    if (!isNaN(x)) posX = Math.round(x);
                    if (!isNaN(y)) posY = Math.round(y);
                }
                let scale = 100;
                if (el.style.transform) {
                    const m = el.style.transform.match(/scale\(([\d.]+)\)/);
                    if (m) scale = Math.round(parseFloat(m[1]) * 100);
                }
                return {
                    index,
                    src: el.getAttribute('src') || el.src || '',
                    alt: el.getAttribute('alt') || '',
                    objectFit: objFit,
                    objectPosition: posStr,
                    positionX: posX,
                    positionY: posY,
                    height: el.style.height || '',
                    aspectRatio: el.style.aspectRatio || '',
                    scale
                };
            });

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
            const links = getStandaloneLinks(sectionEl as HTMLElement, cards);
            targetEl = links[index] || null;
            if (subField === 'icon' && targetEl) {
                const iconEl = targetEl.querySelector('svg') as HTMLElement | null;
                if (iconEl) {
                    iconEl.classList.add('__ss-active-element');
                }
            }
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
                } else if (subField === 'icon') {
                    const btn = cardEl.querySelector('a, button, [role="button"]');
                    const badge = cardEl.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]');
                    const ic = Array.from(cardEl.querySelectorAll('svg')).find(s => {
                        if (btn && btn.contains(s)) return false;
                        if (badge && badge.contains(s)) return false;
                        return true;
                    });
                    if (ic) {
                        const host = (ic.parentElement && ic.parentElement !== cardEl && ic.parentElement.children.length === 1 ? ic.parentElement : ic) as HTMLElement;
                        host.classList.add('__ss-active-element');
                    }
                }
            }
        } else if (type === 'section') {
            targetEl = sectionEl as HTMLElement;
        }

        // Remove old selection overlays
        doc.getElementById('__ss-selection-overlay__')?.remove();
        doc.getElementById('__ss-selection-label-badge__')?.remove();

        if (targetEl) {
            if (type !== 'card' && type !== 'section') {
                targetEl.classList.add('__ss-active-element');
            }
            const labelText = type === 'card'
                ? (subField && subField !== 'card' ? subField.charAt(0).toUpperCase() + subField.slice(1) : `Card #${index + 1}`)
                : (type === 'heading' ? targetEl.tagName.toUpperCase()
                    : type === 'section' ? (sectionEl.getAttribute('data-section-id') || sectionEl.id || 'Section').toUpperCase() + ' Section'
                    : type === 'paragraph' ? (targetEl.tagName.toLowerCase() === 'p' ? 'Paragraph' : targetEl.tagName.toLowerCase() === 'span' ? 'Label' : 'Text')
                    : type.charAt(0).toUpperCase() + type.slice(1));

            // Find the actual highlighted sub-element for the overlay position
            const activeChild = (type === 'card' && subField && subField !== 'card')
                ? (targetEl.querySelector('.__ss-active-element') as HTMLElement | null)
                : null;
            const overlayHost = activeChild || targetEl;

            // Smoothly scroll the highlighted element into center view
            overlayHost.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const updateOverlayPos = () => {
                if (!overlayHost || !doc.body.contains(overlayHost)) return;
                const win = doc.defaultView || iframe.contentWindow;
                const sx = win ? (win.scrollX || win.pageXOffset || doc.documentElement.scrollLeft || 0) : 0;
                const sy = win ? (win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0) : 0;
                const rect = overlayHost.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) return;

                let overlay = doc.getElementById('__ss-selection-overlay__');
                if (!overlay) {
                    overlay = doc.createElement('div');
                    overlay.id = '__ss-selection-overlay__';
                    overlay.className = '__ss-selection-overlay';
                    doc.body.appendChild(overlay);
                }
                overlay.style.left = `${rect.left + sx - 3}px`;
                overlay.style.top = `${rect.top + sy - 3}px`;
                overlay.style.width = `${rect.width + 6}px`;
                overlay.style.height = `${rect.height + 6}px`;

                let labelEl = doc.getElementById('__ss-selection-label-badge__');
                if (!labelEl) {
                    labelEl = doc.createElement('div');
                    labelEl.id = '__ss-selection-label-badge__';
                    labelEl.className = '__ss-selection-label';
                    doc.body.appendChild(labelEl);
                }
                labelEl.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#c4b5fd;box-shadow:0 0 6px #ddd6fe;"></span> Editing: ${labelText}`;
                labelEl.style.left = `${Math.max(4, rect.left + sx - 3)}px`;
                const topPos = rect.top + sy - 28;
                labelEl.style.top = `${topPos < 0 ? rect.bottom + sy + 4 : topPos}px`;
            };

            updateOverlayPos();
            setTimeout(updateOverlayPos, 150);
            setTimeout(updateOverlayPos, 350);
        }
    }, [selectedSectionId]);

    // Sidebar-first selection: highlights element in iframe AND updates sidebar state
    const handleSidebarSelect = useCallback((type: 'heading' | 'paragraph' | 'link' | 'image' | 'card' | 'section', index: number, subField?: string) => {
        highlightElementInIframe(type, index, subField);
        setHighlightedTarget({ type, index, subField: subField as any, timestamp: Date.now() });
    }, [highlightElementInIframe]);

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
                    outline: 2.5px dashed #3b82f6 !important;
                    outline-offset: -2px !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2), inset 0 0 0 2px rgba(59, 130, 246, 0.12) !important;
                    position: relative !important;
                    transition: outline 0.2s ease, box-shadow 0.2s ease !important;
                }
                /* Section label badge */
                .__ss-section-badge {
                    position: absolute !important;
                    background: #2563eb !important;
                    color: #ffffff !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.04em !important;
                    padding: 4px 10px !important;
                    border-radius: 6px !important;
                    z-index: 2147483645 !important;
                    pointer-events: none !important;
                    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35) !important;
                    white-space: nowrap !important;
                }
                /* Selected card container */
                .__ss-active-card {
                    outline: 2.5px solid #3b82f6 !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.25), 0 0 20px rgba(59, 130, 246, 0.2) !important;
                    position: relative;
                    z-index: 15 !important;
                    transition: all 0.2s ease !important;
                }
                /* Selected individual element */
                .__ss-active-element {
                    outline: 2.5px solid #8b5cf6 !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 16px rgba(139, 92, 246, 0.35) !important;
                    transition: all 0.2s ease !important;
                    animation: __ss-pulse 1.5s ease-in-out 1 !important;
                }
                @keyframes __ss-pulse {
                    0% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3); }
                    50% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.45); }
                    100% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3); }
                }
                /* Hover preview outline (before clicking) */
                .__ss-hover-element {
                    outline: 1.5px dashed rgba(59, 130, 246, 0.6) !important;
                    outline-offset: 2px !important;
                    cursor: pointer !important;
                    transition: outline 0.1s ease !important;
                }
                /* Absolute overlay highlight for selected element (tracks document coordinates) */
                .__ss-selection-overlay {
                    position: absolute !important;
                    pointer-events: none !important;
                    border: 2.5px solid #8b5cf6 !important;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.4) !important;
                    border-radius: 4px !important;
                    z-index: 2147483646 !important;
                    transition: left 0.1s ease, top 0.1s ease, width 0.1s ease, height 0.1s ease !important;
                    animation: __ss-selection-pulse 1.8s ease-in-out infinite !important;
                }
                @keyframes __ss-selection-pulse {
                    0%, 100% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 16px rgba(139, 92, 246, 0.3); }
                    50% { box-shadow: 0 0 0 7px rgba(139, 92, 246, 0.45), 0 0 24px rgba(139, 92, 246, 0.6); }
                }
                /* Absolute overlay for hover highlight */
                .__ss-hover-overlay {
                    position: absolute !important;
                    pointer-events: none !important;
                    border: 1.5px dashed rgba(59, 130, 246, 0.75) !important;
                    border-radius: 3px !important;
                    z-index: 2147483645 !important;
                    transition: all 0.08s ease !important;
                }
                /* Label badge attached to selection overlay */
                .__ss-selection-label {
                    position: absolute !important;
                    background: #7c3aed !important;
                    color: #ffffff !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    padding: 3px 10px !important;
                    border-radius: 5px !important;
                    z-index: 2147483647 !important;
                    pointer-events: none !important;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    line-height: 1.4 !important;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35) !important;
                    white-space: nowrap !important;
                    letter-spacing: 0.02em !important;
                }
                /* Hover label badge */
                .__ss-hover-label {
                    position: absolute !important;
                    background: #3b82f6 !important;
                    color: white !important;
                    font-size: 10px !important;
                    font-weight: 600 !important;
                    padding: 2px 7px !important;
                    border-radius: 4px !important;
                    z-index: 2147483647 !important;
                    pointer-events: none !important;
                    font-family: ui-monospace, SFMono-Regular, monospace !important;
                    white-space: nowrap !important;
                    line-height: 1.4 !important;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
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
                /* Always ensure elements with scroll reveal / AOS remain 100% visible in the editor canvas */
                [data-aos] {
                    opacity: 1 !important;
                    transform: none !important;
                    transition: none !important;
                    visibility: visible !important;
                }
                [data-aos].aos-animate {
                    opacity: 1 !important;
                    transform: none !important;
                }
                /* Responsive guard rules for all device preview modes */
                html, body {
                    max-width: 100% !important;
                    overflow-x: hidden !important;
                    -webkit-text-size-adjust: 100%;
                }
                img, svg, video, canvas, iframe {
                    max-width: 100% !important;
                }
                @media (max-width: 768px) {
                    h1, h2, h3, h4, p, a, button {
                        overflow-wrap: break-word !important;
                    }
                    [data-bento-grid] {
                        grid-template-columns: minmax(0, 1fr) !important;
                    }
                }
                /* Figma-style image drag-to-align / pan styles */
                .__ss-image-panning {
                    cursor: grabbing !important;
                    user-select: none !important;
                }
                img.__ss-active-element, .__ss-active-card img {
                    cursor: grab !important;
                }
                /* Figma-style card drop zone when dragging images */
                .__ss-card-drop-target {
                    outline: 3px dashed #3b82f6 !important;
                    outline-offset: 3px !important;
                    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.35) !important;
                    position: relative !important;
                }
                .__ss-card-drop-badge {
                    position: absolute !important;
                    transform: translate(-50%, -50%) !important;
                    background: #2563eb !important;
                    color: #ffffff !important;
                    font-size: 12px !important;
                    font-weight: 700 !important;
                    padding: 8px 16px !important;
                    border-radius: 9999px !important;
                    z-index: 2147483647 !important;
                    pointer-events: none !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    white-space: nowrap !important;
                    font-family: ui-sans-serif, system-ui, sans-serif !important;
                }
                .__ss-pan-badge {
                    position: absolute !important;
                    background: rgba(15, 23, 42, 0.92) !important;
                    backdrop-filter: blur(8px) !important;
                    color: #60a5fa !important;
                    border: 1px solid rgba(59, 130, 246, 0.5) !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    font-family: ui-monospace, monospace !important;
                    padding: 4px 12px !important;
                    border-radius: 6px !important;
                    z-index: 2147483647 !important;
                    pointer-events: none !important;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.5) !important;
                    white-space: nowrap !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
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

        // Overlay-based helpers: fixed-position overlay elements sit on top of the content
        // This avoids clipping by overflow:hidden, inline display, or z-index stacking.

        const removeOverlay = (id: string) => {
            doc.getElementById(id)?.remove();
        };

        const showOverlay = (el: HTMLElement, id: string, cssClass: string) => {
            removeOverlay(id);
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;
            const win = doc.defaultView || iframe.contentWindow;
            const sx = win ? (win.scrollX || win.pageXOffset || doc.documentElement.scrollLeft || 0) : 0;
            const sy = win ? (win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0) : 0;
            const overlay = doc.createElement('div');
            overlay.id = id;
            overlay.className = cssClass;
            overlay.style.left = `${rect.left + sx - 2}px`;
            overlay.style.top = `${rect.top + sy - 2}px`;
            overlay.style.width = `${rect.width + 4}px`;
            overlay.style.height = `${rect.height + 4}px`;
            doc.body.appendChild(overlay);
        };

        const showLabelOverlay = (el: HTMLElement, labelId: string, labelClass: string, text: string, dotColor: string = '#a78bfa') => {
            removeOverlay(labelId);
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;
            const win = doc.defaultView || iframe.contentWindow;
            const sx = win ? (win.scrollX || win.pageXOffset || doc.documentElement.scrollLeft || 0) : 0;
            const sy = win ? (win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0) : 0;
            const label = doc.createElement('div');
            label.id = labelId;
            label.className = labelClass;
            label.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${dotColor};"></span> ${text}`;
            const topPos = rect.top + sy - 26;
            label.style.top = `${topPos < 0 ? rect.bottom + sy + 4 : topPos}px`;
            label.style.left = `${Math.max(4, rect.left + sx - 2)}px`;
            doc.body.appendChild(label);
        };

        // Helper: show hover overlay + label
        const showHoverLabel = (el: HTMLElement) => {
            const label = getElementTypeLabel(el);
            showOverlay(el, '__ss-hover-overlay__', '__ss-hover-overlay');
            showLabelOverlay(el, '__ss-hover-label-badge__', '__ss-hover-label', label, '#60a5fa');
        };

        const removeHoverLabel = () => {
            removeOverlay('__ss-hover-overlay__');
            removeOverlay('__ss-hover-label-badge__');
        };

        // Helper: inject selection overlay + label on active element
        const showSelectionLabel = (el: HTMLElement, label: string) => {
            removeSelectionLabel();
            showOverlay(el, '__ss-selection-overlay__', '__ss-selection-overlay');
            showLabelOverlay(el, '__ss-selection-label-badge__', '__ss-selection-label', label, '#a78bfa');
        };

        const removeSelectionLabel = () => {
            removeOverlay('__ss-selection-overlay__');
            removeOverlay('__ss-selection-label-badge__');
        };

        // Hover handler: show dashed outline + type label on mouseover
        const handleMouseOver = (e: MouseEvent) => {
            const rawTarget = e.target as Node | null;
            const target = (rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement) as HTMLElement | null;
            if (!target || target === doc.body || target === doc.documentElement) return;

            // Don't show hover if element is already selected
            if (target.classList.contains('__ss-active-element') || target.classList.contains('__ss-active-card')) return;

            // Don't hover on overlay badges themselves
            if (target.id === '__ss-hover-overlay__' || target.id === '__ss-hover-label-badge__' ||
                target.id === '__ss-selection-overlay__' || target.id === '__ss-selection-label-badge__') return;
            if (target.classList.contains('__ss-hover-label') || target.classList.contains('__ss-selection-label') ||
                target.classList.contains('__ss-hover-overlay') || target.classList.contains('__ss-selection-overlay')) return;

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

        // Interactive Canvas Image Dragging & Repositioning (Figma Pan/Crop Mode)
        let isMouseDownOnImg = false;
        let panTargetImg: HTMLImageElement | null = null;
        let panStartClientX = 0;
        let panStartClientY = 0;
        let panStartPosX = 50;
        let panStartPosY = 50;
        let hasDraggedImage = false;
        let panCardIndex = -1;
        let panStandaloneImgIndex = -1;
        let panSectionId = '';

        // Prevent external link navigation in preview; instead clicking an element selects it and highlights its settings on the right
        const handleClick = (e: MouseEvent) => {
            if (hasDraggedImage) {
                return;
            }

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

                let subField: 'title' | 'description' | 'button' | 'image' | 'badge' | 'card' | 'icon' = 'card';

                const badgeInCard = (target.closest('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') ||
                    (clickedCard === target ? clickedCard.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') : null)) as HTMLElement | null;
                const headingInCard = (target.closest('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') ||
                    (clickedCard === target ? clickedCard.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-semibold"], [class*="font-bold"], [class*="text-xl"], [class*="text-2xl"]') : null)) as HTMLElement | null;
                const pInCard = (target.closest('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') ||
                    (clickedCard === target ? clickedCard.querySelector('p, [class*="text-muted"], [class*="text-gray"], [class*="text-zinc"]') : null)) as HTMLElement | null;
                const btnInCard = (target.closest('a, button, [role="button"]') ||
                    (clickedCard === target ? clickedCard.querySelector('a, button, [role="button"]') : null)) as HTMLElement | null;
                const imgInCard = (target.tagName === 'IMG' ? target : (target.querySelector('img') || target.closest('img') || (clickedCard === target ? clickedCard.querySelector('img') : null))) as HTMLElement | null;
                const svgInCard = (target.closest('svg') || (target.tagName === 'DIV' && target.children.length === 1 && target.querySelector('svg') ? target.querySelector('svg') : null)) as SVGElement | null;

                if (badgeInCard && clickedCard.contains(badgeInCard) && (target === badgeInCard || badgeInCard.contains(target))) {
                    subField = 'badge';
                    badgeInCard.classList.add('__ss-active-element');
                    showSelectionLabel(badgeInCard, 'Badge');
                } else if (btnInCard && clickedCard.contains(btnInCard) && (target === btnInCard || btnInCard.contains(target))) {
                    subField = 'button';
                    btnInCard.classList.add('__ss-active-element');
                    showSelectionLabel(btnInCard, 'Button');
                } else if (svgInCard && clickedCard.contains(svgInCard) && !btnInCard?.contains(svgInCard) && !badgeInCard?.contains(svgInCard)) {
                    subField = 'icon';
                    const iconHost = (svgInCard.parentElement && svgInCard.parentElement !== clickedCard && svgInCard.parentElement.children.length === 1 ? svgInCard.parentElement : svgInCard) as HTMLElement;
                    iconHost.classList.add('__ss-active-element');
                    showSelectionLabel(iconHost, 'Card Icon');
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
                const standaloneLinks = getStandaloneLinks(sectionEl, cards);
                const index = standaloneLinks.indexOf(linkEl);
                if (index !== -1) {
                    linkEl.classList.add('__ss-active-element');
                    const isIconClick = !!(target.closest('svg') || target.tagName.toLowerCase() === 'path');
                    const subField = isIconClick ? 'icon' : 'button';
                    const iconEl = linkEl.querySelector('svg');
                    if (isIconClick && iconEl) {
                        iconEl.classList.add('__ss-active-element');
                    }
                    const label = isIconClick
                        ? (linkEl.tagName === 'BUTTON' ? 'Button Icon' : 'Link Icon')
                        : (linkEl.tagName === 'BUTTON' ? 'Button' : 'Link');
                    showSelectionLabel(isIconClick && iconEl ? iconEl as HTMLElement : linkEl, label);
                    setHighlightedTarget({ type: 'link', index, subField, timestamp: Date.now() });
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
                    cleanDoc.querySelectorAll('.__ss-active-section, .__ss-active-element, .__ss-active-card, .__ss-hover-element, .__ss-inline-editing, .__ss-card-drop-target, .__ss-image-panning').forEach(el => {
                        el.classList.remove('__ss-active-section', '__ss-active-element', '__ss-active-card', '__ss-hover-element', '__ss-inline-editing', '__ss-card-drop-target', '__ss-image-panning');
                    });
                    cleanDoc.querySelectorAll('#__studiosync_preview_styles__, #__ss-selection-label-badge__, #__ss-hover-label-badge__, #__ss-selection-overlay__, #__ss-hover-overlay__, #__ss-pan-badge__, #__ss-card-drop-badge__').forEach(el => {
                        el.remove();
                    });
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

        // Figma Canvas Drag-to-Align (Pan/Crop Mode) Handlers
        const handleMouseDown = (e: MouseEvent) => {
            // Only handle primary left-click
            if (e.button !== 0) return;
            const rawTarget = e.target as HTMLElement | null;
            if (!rawTarget) return;

            const imgEl = (rawTarget.tagName === 'IMG' ? rawTarget : null) as HTMLImageElement | null;
            if (!imgEl) return;

            let sectionEl = (imgEl.closest('section, header, footer, nav, main, [id]') || imgEl.closest('[data-section-id]')) as HTMLElement;
            if (!sectionEl || sectionEl === doc.body || sectionEl === doc.documentElement) {
                const directChild = Array.from(doc.body.children).find(child => child.contains(imgEl)) as HTMLElement;
                if (directChild) sectionEl = directChild;
            }
            if (!sectionEl) return;

            const cards = getCardCandidates(sectionEl);
            const parentCard = cards.find(c => c.contains(imgEl));

            panSectionId = sectionEl.id || sectionEl.getAttribute('data-section-id') || '';
            panCardIndex = parentCard ? cards.indexOf(parentCard) : -1;

            if (panCardIndex === -1) {
                const standaloneImgs = Array.from(sectionEl.querySelectorAll('img')).filter(el => !cards.some(c => c.contains(el)));
                panStandaloneImgIndex = standaloneImgs.indexOf(imgEl);
            } else {
                panStandaloneImgIndex = -1;
            }

            isMouseDownOnImg = true;
            panTargetImg = imgEl;
            panStartClientX = e.clientX;
            panStartClientY = e.clientY;
            hasDraggedImage = false;

            let initX = 50;
            let initY = 50;
            const currentPos = imgEl.style.objectPosition || '';
            if (currentPos) {
                const parts = currentPos.trim().split(/\s+/);
                const xVal = parseFloat(parts[0]);
                const yVal = parseFloat(parts[1]);
                if (!isNaN(xVal)) initX = Math.round(xVal);
                if (!isNaN(yVal)) initY = Math.round(yVal);
            } else {
                if (imgEl.classList.contains('object-left')) initX = 0;
                else if (imgEl.classList.contains('object-right')) initX = 100;
                if (imgEl.classList.contains('object-top')) initY = 0;
                else if (imgEl.classList.contains('object-bottom')) initY = 100;
            }
            panStartPosX = initX;
            panStartPosY = initY;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isMouseDownOnImg || !panTargetImg) return;

            const dx = e.clientX - panStartClientX;
            const dy = e.clientY - panStartClientY;
            const dist = Math.hypot(dx, dy);

            if (!hasDraggedImage && dist > 4) {
                hasDraggedImage = true;
                panTargetImg.classList.add('__ss-image-panning');
                e.preventDefault();
            }

            if (hasDraggedImage) {
                e.preventDefault();
                const rect = panTargetImg.getBoundingClientRect();
                const deltaX = (dx / (rect.width || 200)) * 100;
                const deltaY = (dy / (rect.height || 200)) * 100;

                const newX = Math.round(Math.max(0, Math.min(100, panStartPosX - deltaX)));
                const newY = Math.round(Math.max(0, Math.min(100, panStartPosY - deltaY)));

                panTargetImg.style.objectPosition = `${newX}% ${newY}%`;

                let panBadge = doc.getElementById('__ss-pan-badge__');
                if (!panBadge) {
                    panBadge = doc.createElement('div');
                    panBadge.id = '__ss-pan-badge__';
                    panBadge.className = '__ss-pan-badge';
                    doc.body.appendChild(panBadge);
                }
                panBadge.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#38bdf8;"></span> Aligning: <strong>${newX}% ${newY}%</strong>`;
                const win = doc.defaultView || iframe.contentWindow;
                const sx = win ? (win.scrollX || win.pageXOffset || doc.documentElement.scrollLeft || 0) : 0;
                const sy = win ? (win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0) : 0;
                panBadge.style.left = `${Math.max(10, rect.left + sx + 8)}px`;
                const topPos = rect.top + sy - 28;
                panBadge.style.top = `${topPos < 0 ? rect.bottom + sy + 6 : topPos}px`;
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!isMouseDownOnImg || !panTargetImg) return;

            const wasDragged = hasDraggedImage;
            const img = panTargetImg;
            const cardIdx = panCardIndex;
            const standIdx = panStandaloneImgIndex;

            isMouseDownOnImg = false;
            panTargetImg = null;

            img.classList.remove('__ss-image-panning');
            doc.getElementById('__ss-pan-badge__')?.remove();

            if (wasDragged) {
                e.preventDefault();
                e.stopPropagation();
                const finalPos = img.style.objectPosition || '50% 50%';

                if (panSectionId) {
                    setSelectedSectionId(panSectionId);
                }

                if (cardIdx !== -1 && handleUpdateCardContentRef.current) {
                    handleUpdateCardContentRef.current(cardIdx, { imageObjectPosition: finalPos });
                    toast.success(`Card image aligned: ${finalPos}`, { duration: 1500 });
                } else if (standIdx !== -1 && handleUpdateImageRef.current) {
                    handleUpdateImageRef.current(standIdx, { objectPosition: finalPos });
                    toast.success(`Image aligned: ${finalPos}`, { duration: 1500 });
                }

                setTimeout(() => {
                    hasDraggedImage = false;
                }, 50);
            } else {
                hasDraggedImage = false;
            }
        };

        // Figma Canvas Drag-and-Drop Handlers (Assets & Desktop Files -> Cards/Images)
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'copy';
            }
            const rawTarget = e.target as HTMLElement | null;
            if (!rawTarget) return;

            const card = rawTarget.closest('[data-card], [data-bento-card], .card, [class*="card"], [class*="rounded-xl"], [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-lg"]') as HTMLElement | null;
            const img = (rawTarget.tagName === 'IMG' ? rawTarget : rawTarget.querySelector('img')) as HTMLImageElement | null;
            const dropTarget = img || card;

            doc.querySelectorAll('.__ss-card-drop-target').forEach(el => {
                if (el !== dropTarget) el.classList.remove('__ss-card-drop-target');
            });

            if (dropTarget) {
                dropTarget.classList.add('__ss-card-drop-target');
                let badge = doc.getElementById('__ss-card-drop-badge__');
                if (!badge) {
                    badge = doc.createElement('div');
                    badge.id = '__ss-card-drop-badge__';
                    badge.className = '__ss-card-drop-badge';
                    doc.body.appendChild(badge);
                }
                const targetName = img ? 'Image' : 'Card';
                badge.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Drop image onto ${targetName}`;
                const win = doc.defaultView || iframe.contentWindow;
                const sx = win ? (win.scrollX || win.pageXOffset || doc.documentElement.scrollLeft || 0) : 0;
                const sy = win ? (win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0) : 0;
                const r = dropTarget.getBoundingClientRect();
                badge.style.left = `${r.left + sx + r.width / 2}px`;
                badge.style.top = `${r.top + sy + r.height / 2}px`;
            }
        };

        const handleDragLeave = (e: DragEvent) => {
            if (!e.relatedTarget || e.relatedTarget === doc.documentElement) {
                doc.querySelectorAll('.__ss-card-drop-target').forEach(el => el.classList.remove('__ss-card-drop-target'));
                doc.getElementById('__ss-card-drop-badge__')?.remove();
            }
        };

        const handleDrop = async (e: DragEvent) => {
            e.preventDefault();
            doc.querySelectorAll('.__ss-card-drop-target').forEach(el => el.classList.remove('__ss-card-drop-target'));
            doc.getElementById('__ss-card-drop-badge__')?.remove();

            const rawTarget = e.target as HTMLElement | null;
            if (!rawTarget) return;

            let sectionEl = (rawTarget.closest('section, header, footer, nav, main, [id]') || rawTarget.closest('[data-section-id]')) as HTMLElement;
            if (!sectionEl || sectionEl === doc.body || sectionEl === doc.documentElement) {
                const directChild = Array.from(doc.body.children).find(child => child.contains(rawTarget)) as HTMLElement;
                if (directChild) sectionEl = directChild;
            }
            if (!sectionEl) return;

            const sectionId = sectionEl.id || sectionEl.getAttribute('data-section-id');
            if (sectionId) {
                setSelectedSectionId(sectionId);
            }

            const cards = getCardCandidates(sectionEl);
            const targetCard = cards.find(c => c === rawTarget || c.contains(rawTarget));
            const cardIndex = targetCard ? cards.indexOf(targetCard) : -1;

            const standaloneImgs = Array.from(sectionEl.querySelectorAll('img')).filter(el => !cards.some(c => c.contains(el)));
            const targetImg = rawTarget.tagName === 'IMG' ? (rawTarget as HTMLImageElement) : rawTarget.querySelector('img');
            const imgIndex = targetImg && standaloneImgs.includes(targetImg) ? standaloneImgs.indexOf(targetImg) : -1;

            let assetUrl = '';
            let assetName = '';

            const jsonStr = e.dataTransfer?.getData('application/json');
            if (jsonStr) {
                try {
                    const parsed = JSON.parse(jsonStr);
                    assetUrl = parsed.assetUrl || '';
                    assetName = parsed.assetName || '';
                } catch {}
            }
            if (!assetUrl) {
                assetUrl = e.dataTransfer?.getData('text/plain') || '';
            }

            const file = e.dataTransfer?.files?.[0];
            if (file && file.type.startsWith('image/')) {
                const toastId = toast.loading(`Uploading "${file.name}" to Cloudflare R2...`);
                if (handleUploadAssetRef.current) {
                    const uploaded = await handleUploadAssetRef.current(file);
                    if (uploaded && uploaded.url) {
                        assetUrl = uploaded.url;
                        assetName = uploaded.name;
                        toast.success(`Asset uploaded! Applying to element...`, { id: toastId });
                    } else {
                        return;
                    }
                }
            }

            if (assetUrl) {
                if (cardIndex !== -1 && handleUpdateCardContentRef.current) {
                    handleUpdateCardContentRef.current(cardIndex, { imageSrc: assetUrl, imageAlt: assetName || 'Card image' });
                    toast.success(`Applied image to Card #${cardIndex + 1}!`);
                } else if (imgIndex !== -1 && handleUpdateImageRef.current) {
                    handleUpdateImageRef.current(imgIndex, { src: assetUrl, alt: assetName || 'Image' });
                    toast.success(`Applied image!`);
                } else if (targetImg) {
                    targetImg.src = assetUrl;
                    targetImg.setAttribute('src', assetUrl);
                    pushHistory(doc.documentElement.outerHTML);
                    toast.success(`Applied image!`);
                }
            }
        };

        doc.addEventListener('click', handleClick, true);
        doc.addEventListener('dblclick', handleDblClick, true);
        doc.addEventListener('auxclick', handleAuxClick, true);
        doc.addEventListener('submit', handleSubmit, true);
        doc.addEventListener('mouseover', handleMouseOver, true);
        doc.addEventListener('mouseout', handleMouseOut, true);
        doc.addEventListener('mousedown', handleMouseDown, true);
        doc.addEventListener('mousemove', handleMouseMove, true);
        doc.addEventListener('mouseup', handleMouseUp, true);
        doc.addEventListener('dragover', handleDragOver, true);
        doc.addEventListener('dragleave', handleDragLeave, true);
        doc.addEventListener('drop', handleDrop, true);

        // On scroll, update overlay positions so they stay precisely synced
        const handleScroll = () => {
            const selOverlay = doc.getElementById('__ss-selection-overlay__');
            const selLabel = doc.getElementById('__ss-selection-label-badge__');
            const activeEl = (doc.querySelector('.__ss-active-card .__ss-active-element') || doc.querySelector('.__ss-active-element, .__ss-active-card')) as HTMLElement | null;
            if (selOverlay && activeEl) {
                const win = doc.defaultView || iframe.contentWindow;
                const sx = win ? (win.scrollX || win.pageXOffset || doc.documentElement.scrollLeft || 0) : 0;
                const sy = win ? (win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0) : 0;
                const rect = activeEl.getBoundingClientRect();
                selOverlay.style.left = `${rect.left + sx - 3}px`;
                selOverlay.style.top = `${rect.top + sy - 3}px`;
                selOverlay.style.width = `${rect.width + 6}px`;
                selOverlay.style.height = `${rect.height + 6}px`;
                if (selLabel) {
                    selLabel.style.left = `${Math.max(4, rect.left + sx - 3)}px`;
                    const topPos = rect.top + sy - 28;
                    selLabel.style.top = `${topPos < 0 ? rect.bottom + sy + 4 : topPos}px`;
                }
            }
            // Remove hover overlays on scroll
            removeHoverLabel();
            doc.querySelectorAll('.__ss-hover-element').forEach(el => el.classList.remove('__ss-hover-element'));
        };
        const contentWin = doc.defaultView || iframe.contentWindow;
        if (contentWin) {
            contentWin.addEventListener('scroll', handleScroll, { passive: true });
        }
        doc.addEventListener('scroll', handleScroll, true);

        return () => {
            if (contentWin) {
                contentWin.removeEventListener('scroll', handleScroll);
            }
            doc.removeEventListener('click', handleClick, true);
            doc.removeEventListener('dblclick', handleDblClick, true);
            doc.removeEventListener('auxclick', handleAuxClick, true);
            doc.removeEventListener('submit', handleSubmit, true);
            doc.removeEventListener('mouseover', handleMouseOver, true);
            doc.removeEventListener('mouseout', handleMouseOut, true);
            doc.removeEventListener('mousedown', handleMouseDown, true);
            doc.removeEventListener('mousemove', handleMouseMove, true);
            doc.removeEventListener('mouseup', handleMouseUp, true);
            doc.removeEventListener('dragover', handleDragOver, true);
            doc.removeEventListener('dragleave', handleDragLeave, true);
            doc.removeEventListener('drop', handleDrop, true);
            doc.removeEventListener('scroll', handleScroll, true);
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
                // If user already focused an input inside this control (sidebar-first flow),
                // skip auto-scroll and re-focus to avoid disrupting their editing
                const activeEl = document.activeElement;
                const isAlreadyFocusedInside = activeEl && targetEl.contains(activeEl) &&
                    (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');

                if (isAlreadyFocusedInside) return;

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
        doc.querySelectorAll('.__ss-active-card').forEach(el => el.classList.remove('__ss-active-card'));
        doc.getElementById('__ss-selection-overlay__')?.remove();
        doc.getElementById('__ss-selection-label-badge__')?.remove();
        doc.getElementById('__ss-section-badge__')?.remove();

        const el = doc.getElementById(sectionId) || doc.querySelector(`[data-section-id="${sectionId}"]`);
        if (el) {
            el.classList.add('__ss-active-section');
            const layer = layers.find(l => l.id === sectionId);
            const sectionLabel = layer ? layer.label : (el.getAttribute('data-section-id') || el.id || 'Section');

            const badge = doc.createElement('div');
            badge.id = '__ss-section-badge__';
            badge.className = '__ss-section-badge';
            badge.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#60a5fa;box-shadow:0 0 6px #93c5fd;"></span> Active Section: ${sectionLabel}`;

            const updateSectionBadge = () => {
                if (!el || !doc.body.contains(el)) return;
                const win = doc.defaultView || iframe.contentWindow;
                const sx = win ? (win.scrollX || win.pageXOffset || doc.documentElement.scrollLeft || 0) : 0;
                const sy = win ? (win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0) : 0;
                const rect = el.getBoundingClientRect();
                badge.style.left = `${Math.max(8, rect.left + sx + 12)}px`;
                badge.style.top = `${rect.top + sy + 12}px`;
            };

            updateSectionBadge();
            doc.body.appendChild(badge);
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(updateSectionBadge, 200);
            setTimeout(updateSectionBadge, 500);
        }
    };

    const handleSelectSection = (sectionId: string) => {
        setSelectedSectionId(sectionId);
        highlightSectionInIframe(sectionId);
        setHighlightedTarget(null);
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsLeftSidebarOpen(false);
            setIsRightSidebarOpen(true);
        }
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
        const linkEls = getStandaloneLinks(sectionEl, cards);

        if (linkEls[index]) {
            const el = linkEls[index] as HTMLElement;
            let hasChanged = false;

            if (fields.text !== undefined && (linkEls[index].textContent || '').trim() !== fields.text.trim()) {
                updateElementTextPreservingSvg(linkEls[index] as HTMLElement, fields.text);
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
                const liveLinks = liveSection ? getStandaloneLinks(liveSection, liveCards) : [];
                if (liveLinks[index]) {
                    const liveEl = liveLinks[index] as HTMLElement;
                    if (fields.text !== undefined) updateElementTextPreservingSvg(liveEl, fields.text);
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

    // Update Standalone Image (src, alt, objectFit, objectPosition, height, aspectRatio, scale) via Right Sidebar
    const handleUpdateImage = (
        index: number,
        fields: {
            src?: string;
            alt?: string;
            objectFit?: string;
            objectPosition?: string;
            height?: string;
            aspectRatio?: string;
            scale?: number;
        }
    ) => {
        if (!selectedSectionId) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;

        const cards = getCardCandidates(sectionEl);
        const imgEls = Array.from(sectionEl.querySelectorAll('img')).filter(el => !cards.some(c => c.contains(el)));
        const targetImg = imgEls[index];
        if (targetImg) {
            let hasChanged = false;
            if (fields.src !== undefined && targetImg.getAttribute('src') !== fields.src) {
                targetImg.setAttribute('src', fields.src);
                hasChanged = true;
            }
            if (fields.alt !== undefined && targetImg.getAttribute('alt') !== fields.alt) {
                targetImg.setAttribute('alt', fields.alt);
                hasChanged = true;
            }
            if (fields.objectFit !== undefined && targetImg.style.objectFit !== fields.objectFit) {
                targetImg.style.objectFit = fields.objectFit;
                hasChanged = true;
            }
            if (fields.objectPosition !== undefined && targetImg.style.objectPosition !== fields.objectPosition) {
                targetImg.style.objectPosition = fields.objectPosition;
                hasChanged = true;
            }
            if (fields.height !== undefined && targetImg.style.height !== fields.height) {
                targetImg.style.height = fields.height;
                hasChanged = true;
            }
            if (fields.aspectRatio !== undefined) {
                const val = (fields.aspectRatio && fields.aspectRatio !== 'auto') ? fields.aspectRatio : '';
                if (targetImg.style.aspectRatio !== val) {
                    targetImg.style.aspectRatio = val;
                    hasChanged = true;
                }
            }
            if (fields.scale !== undefined) {
                const tr = fields.scale === 100 ? '' : `scale(${fields.scale / 100})`;
                if (targetImg.style.transform !== tr) {
                    targetImg.style.transform = tr;
                    hasChanged = true;
                }
            }
            if (!hasChanged) return;

            const updatedHtml = doc.documentElement.outerHTML;
            pushHistory(updatedHtml);

            if (iframeRef.current?.contentDocument) {
                const liveSection = iframeRef.current.contentDocument.getElementById(selectedSectionId);
                const liveCards = liveSection ? getCardCandidates(liveSection) : [];
                const liveImgs = liveSection ? Array.from(liveSection.querySelectorAll('img')).filter(el => !liveCards.some(c => c.contains(el))) : [];
                const liveImg = liveImgs[index];
                if (liveImg) {
                    if (fields.src !== undefined) liveImg.setAttribute('src', fields.src);
                    if (fields.alt !== undefined) liveImg.setAttribute('alt', fields.alt);
                    if (fields.objectFit !== undefined) liveImg.style.objectFit = fields.objectFit;
                    if (fields.objectPosition !== undefined) liveImg.style.objectPosition = fields.objectPosition;
                    if (fields.height !== undefined) liveImg.style.height = fields.height;
                    if (fields.aspectRatio !== undefined) liveImg.style.aspectRatio = (fields.aspectRatio && fields.aspectRatio !== 'auto') ? fields.aspectRatio : '';
                    if (fields.scale !== undefined) liveImg.style.transform = fields.scale === 100 ? '' : `scale(${fields.scale / 100})`;
                }
            }
        }
    };
    handleUpdateImageRef.current = handleUpdateImage;

    // CSRF Token Helper
    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || (document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)![1]) : '');
    };

    // Fetch Project Assets from Backend
    const fetchAssets = useCallback(async () => {
        try {
            const res = await fetch(`/projects/${project.id}/assets`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (res.ok) {
                const data = await res.json();
                const list = (data.assets || []).map((a: ProjectAsset) => ({
                    ...a,
                    url: resolveAssetUrl(a)
                }));
                setAssets(list);
            }
        } catch (err) {
            console.error('Failed to fetch assets:', err);
        }
    }, [project.id, resolveAssetUrl]);

    // Upload New Asset to Cloudflare R2 (Max 10MB)
    const handleUploadAsset = async (file: File, description?: string, customName?: string): Promise<ProjectAsset | null> => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size exceeds 10MB limit. Please upload an image under 10MB.');
            return null;
        }

        setIsUploadingAsset(true);
        const toastId = toast.loading('Uploading asset to Cloudflare R2...');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('image', file);
            if (customName) formData.append('name', customName);
            if (description) formData.append('description', description);

            const res = await fetch(`/projects/${project.id}/assets`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.asset) {
                toast.success('Asset uploaded successfully to Cloudflare R2!', { id: toastId });
                setAssets(prev => [data.asset, ...prev]);
                return data.asset;
            } else {
                toast.error(data.message || 'Failed to upload asset', { id: toastId });
                return null;
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error uploading asset', { id: toastId });
            return null;
        } finally {
            setIsUploadingAsset(false);
        }
    };
    handleUploadAssetRef.current = handleUploadAsset;

    // Direct Upload Handler for Specific Image or Card
    const handleDirectUploadForTarget = async (file: File) => {
        const target = targetDirectUploadRef.current;
        if (!target) return;

        const asset = await handleUploadAsset(file);
        if (asset && asset.url) {
            if (target.type === 'image') {
                handleUpdateImage(target.index, { src: asset.url, alt: asset.name });
                toast.success('Applied new uploaded asset to image!');
            } else if (target.type === 'card') {
                handleUpdateCardContent(target.index, { imageSrc: asset.url, imageAlt: asset.name });
                toast.success('Applied new uploaded asset to card!');
            }
        }
        targetDirectUploadRef.current = null;
    };

    // Replace Existing Asset on Cloudflare R2 (Deletes Old File for Storage Efficiency)
    const handleReplaceAsset = async (asset: ProjectAsset, newFile: File) => {
        if (newFile.size > 10 * 1024 * 1024) {
            toast.error('Replacement image exceeds 10MB limit.');
            return;
        }

        setIsReplacingAsset(true);
        const toastId = toast.loading('Replacing asset on Cloudflare R2 (cleaning up old storage)...');

        try {
            const formData = new FormData();
            formData.append('file', newFile);
            formData.append('image', newFile);

            const res = await fetch(`/projects/${project.id}/assets/${asset.id}/replace`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.asset) {
                toast.success('Asset replaced successfully! Previous file deleted from R2 storage.', { id: toastId });
                const updatedAsset: ProjectAsset = data.asset;
                setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));

                // If the old asset URL was used in the current page HTML, update to new URL
                if (asset.url && updatedAsset.url && asset.url !== updatedAsset.url) {
                    if (html.includes(asset.url)) {
                        const newHtml = html.replaceAll(asset.url, updatedAsset.url);
                        pushHistory(newHtml);
                        if (iframeRef.current?.contentDocument) {
                            iframeRef.current.contentDocument.querySelectorAll(`img[src="${asset.url}"]`).forEach(img => {
                                img.setAttribute('src', updatedAsset.url!);
                            });
                        }
                        toast.info('Updated image references in your page to the new URL.');
                    }
                }
                setAssetToReplace(null);
            } else {
                toast.error(data.message || 'Failed to replace asset', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error replacing asset', { id: toastId });
        } finally {
            setIsReplacingAsset(false);
        }
    };

    // Update Asset Metadata (name, description)
    const handleUpdateAssetMetadata = async (assetId: number, name: string, description: string) => {
        try {
            const res = await fetch(`/projects/${project.id}/assets/${assetId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ name, description })
            });

            const data = await res.json();
            if (res.ok && data.asset) {
                toast.success('Asset details updated!');
                setAssets(prev => prev.map(a => a.id === assetId ? data.asset : a));
                setEditingAsset(null);
            } else {
                toast.error(data.message || 'Failed to update asset');
            }
        } catch {
            toast.error('Error updating asset details');
        }
    };

    // Delete Asset from Cloudflare R2 and Database
    const handleDeleteAsset = async (asset: ProjectAsset) => {
        if (!confirm(`Are you sure you want to delete "${asset.name}"?\n\nThis will permanently delete the file from Cloudflare R2 storage to save space.`)) {
            return;
        }

        try {
            const res = await fetch(`/projects/${project.id}/assets/${asset.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Asset permanently deleted from Cloudflare R2.');
                setAssets(prev => prev.filter(a => a.id !== asset.id));
            } else {
                toast.error(data.message || 'Failed to delete asset');
            }
        } catch {
            toast.error('Error deleting asset');
        }
    };

    // Apply an Asset URL to the Active / Target Element
    const applyAssetToTarget = (assetUrl: string, assetName?: string) => {
        if (assetPickerModal) {
            if (assetPickerModal.targetType === 'image') {
                handleUpdateImage(assetPickerModal.targetIndex, { src: assetUrl, alt: assetName });
                toast.success('Applied asset to image');
            } else if (assetPickerModal.targetType === 'card') {
                handleUpdateCardContent(assetPickerModal.targetIndex, { imageSrc: assetUrl, imageAlt: assetName });
                toast.success('Applied asset to card');
            }
            setAssetPickerModal(null);
            return;
        }

        if (highlightedTarget?.type === 'image') {
            handleUpdateImage(highlightedTarget.index, { src: assetUrl, alt: assetName });
            toast.success('Applied asset to selected image');
        } else if (highlightedTarget?.type === 'card') {
            handleUpdateCardContent(highlightedTarget.index, { imageSrc: assetUrl, imageAlt: assetName });
            toast.success('Applied asset to selected card');
        } else {
            navigator.clipboard.writeText(assetUrl);
            toast.info('Asset URL copied to clipboard! Select an image or paste anywhere.');
        }
    };

    // Filtered Assets based on Search
    const filteredAssets = useMemo(() => {
        if (!assetSearchQuery.trim()) return assets;
        const query = assetSearchQuery.toLowerCase();
        return assets.filter(a =>
            a.name?.toLowerCase().includes(query) ||
            a.description?.toLowerCase().includes(query)
        );
    }, [assets, assetSearchQuery]);

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

    // Apply Icon from IconPickerModal to target element
    const handleApplyIcon = (svgString: string, meta: {
        iconId: string;
        iconName: string;
        size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        color: string;
        position?: 'left' | 'right';
        containerStyle?: 'none' | 'badge-soft' | 'badge-outline' | 'circle';
    }) => {
        if (!selectedSectionId || !iconPickerTarget) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;
        const cards = getCardCandidates(sectionEl);

        let hasChanged = false;

        // Case A: Card Icon
        if (iconPickerTarget.type === 'card' && iconPickerTarget.cardIndex !== undefined) {
            const cardEl = cards[iconPickerTarget.cardIndex];
            if (cardEl) {
                const buttonEl = cardEl.querySelector('a, button, [role="button"]');
                const badgeEl = cardEl.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]');
                const existingSvgs = Array.from(cardEl.querySelectorAll('svg')).filter(s => {
                    if (buttonEl && buttonEl.contains(s)) return false;
                    if (badgeEl && badgeEl.contains(s)) return false;
                    return true;
                });

                const tempDiv = doc.createElement('div');
                tempDiv.innerHTML = svgString.trim();
                const newSvg = tempDiv.querySelector('svg');

                if (newSvg) {
                    if (existingSvgs.length > 0) {
                        existingSvgs[0].replaceWith(newSvg);
                        hasChanged = true;
                    } else {
                        const iconWrap = doc.createElement('div');
                        if (meta.containerStyle === 'badge-soft') {
                            iconWrap.className = 'w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 shrink-0';
                        } else if (meta.containerStyle === 'circle') {
                            iconWrap.className = 'w-12 h-12 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-primary mb-4 shrink-0 shadow-sm';
                        } else {
                            iconWrap.className = 'inline-flex items-center justify-center mb-3 text-primary shrink-0';
                        }
                        iconWrap.appendChild(newSvg);

                        const heading = cardEl.querySelector('h1, h2, h3, h4, h5, h6');
                        if (heading) {
                            cardEl.insertBefore(iconWrap, heading);
                        } else {
                            cardEl.prepend(iconWrap);
                        }
                        hasChanged = true;
                    }
                }
            }
        }

        // Case B: Button / Link Icon
        else if (iconPickerTarget.type === 'link' || iconPickerTarget.type === 'card-button') {
            let targetBtn: HTMLElement | null = null;
            if (iconPickerTarget.type === 'link' && iconPickerTarget.linkIndex !== undefined) {
                const linkEls = getStandaloneLinks(sectionEl, cards);
                targetBtn = linkEls[iconPickerTarget.linkIndex] || null;
            } else if (iconPickerTarget.type === 'card-button' && iconPickerTarget.cardIndex !== undefined) {
                const cardEl = cards[iconPickerTarget.cardIndex];
                targetBtn = cardEl ? cardEl.querySelector('a, button, [role="button"]') as HTMLElement : null;
            }

            if (targetBtn) {
                const tempDiv = doc.createElement('div');
                tempDiv.innerHTML = svgString.trim();
                const newSvg = tempDiv.querySelector('svg');

                if (newSvg) {
                    if (!targetBtn.className.includes('inline-flex') && !targetBtn.className.includes('flex')) {
                        targetBtn.className = targetBtn.className + ' inline-flex items-center justify-center gap-2';
                    } else if (!targetBtn.className.includes('gap-')) {
                        targetBtn.className = targetBtn.className + ' gap-2';
                    }

                    const existingSvg = targetBtn.querySelector('svg');
                    if (existingSvg) existingSvg.remove();

                    if (meta.position === 'right') {
                        targetBtn.appendChild(newSvg);
                    } else {
                        targetBtn.prepend(newSvg);
                    }
                    hasChanged = true;
                }
            }
        }

        // Case C: Card Badge Icon
        else if (iconPickerTarget.type === 'card-badge' && iconPickerTarget.cardIndex !== undefined) {
            const cardEl = cards[iconPickerTarget.cardIndex];
            const badgeEl = cardEl ? cardEl.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') as HTMLElement : null;
            if (badgeEl) {
                const tempDiv = doc.createElement('div');
                tempDiv.innerHTML = svgString.trim();
                const newSvg = tempDiv.querySelector('svg');
                if (newSvg) {
                    if (!badgeEl.className.includes('inline-flex') && !badgeEl.className.includes('flex')) {
                        badgeEl.className = badgeEl.className + ' inline-flex items-center gap-1.5';
                    } else if (!badgeEl.className.includes('gap-')) {
                        badgeEl.className = badgeEl.className + ' gap-1.5';
                    }
                    const existingSvg = badgeEl.querySelector('svg');
                    if (existingSvg) existingSvg.remove();
                    if (meta.position === 'right') {
                        badgeEl.appendChild(newSvg);
                    } else {
                        badgeEl.prepend(newSvg);
                    }
                    hasChanged = true;
                }
            }
        }

        // Case D: Standalone Paragraph / Kicker
        else if (iconPickerTarget.type === 'paragraph' && iconPickerTarget.paragraphIndex !== undefined) {
            const pEls = getStandaloneTextElements(sectionEl, cards);
            const targetP = pEls[iconPickerTarget.paragraphIndex];
            if (targetP) {
                const tempDiv = doc.createElement('div');
                tempDiv.innerHTML = svgString.trim();
                const newSvg = tempDiv.querySelector('svg');
                if (newSvg) {
                    const parentKicker = targetP.parentElement && targetP.parentElement.classList.contains('rounded-full') ? targetP.parentElement : targetP;
                    if (!parentKicker.className.includes('inline-flex') && !parentKicker.className.includes('flex')) {
                        parentKicker.className = parentKicker.className + ' inline-flex items-center gap-2';
                    }
                    const existingSvg = parentKicker.querySelector('svg');
                    if (existingSvg) existingSvg.remove();
                    if (meta.position === 'right') {
                        parentKicker.appendChild(newSvg);
                    } else {
                        parentKicker.prepend(newSvg);
                    }
                    hasChanged = true;
                }
            }
        }

        if (!hasChanged) return;
        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);

        // Surgical live DOM update (does NOT wipe section innerHTML, preserving AOS state & animations)
        if (iframeRef.current?.contentDocument) {
            const liveDoc = iframeRef.current.contentDocument;
            const liveSection = liveDoc.getElementById(selectedSectionId);
            if (liveSection) {
                const liveCards = getCardCandidates(liveSection);
                let surgicalSuccess = false;

                const createLiveSvg = (): SVGElement | null => {
                    const temp = liveDoc.createElement('div');
                    temp.innerHTML = svgString.trim();
                    return temp.querySelector('svg');
                };

                if (iconPickerTarget.type === 'link' && iconPickerTarget.linkIndex !== undefined) {
                    const liveLinks = getStandaloneLinks(liveSection, liveCards);
                    const liveBtn = liveLinks[iconPickerTarget.linkIndex];
                    const newSvg = createLiveSvg();
                    if (liveBtn && newSvg) {
                        if (!liveBtn.className.includes('inline-flex') && !liveBtn.className.includes('flex')) {
                            liveBtn.className = liveBtn.className + ' inline-flex items-center justify-center gap-2';
                        } else if (!liveBtn.className.includes('gap-')) {
                            liveBtn.className = liveBtn.className + ' gap-2';
                        }
                        liveBtn.querySelector('svg')?.remove();
                        if (meta.position === 'right') {
                            liveBtn.appendChild(newSvg);
                        } else {
                            liveBtn.prepend(newSvg);
                        }
                        surgicalSuccess = true;
                    }
                } else if (iconPickerTarget.type === 'card-button' && iconPickerTarget.cardIndex !== undefined) {
                    const liveCard = liveCards[iconPickerTarget.cardIndex];
                    const liveBtn = liveCard ? liveCard.querySelector('a, button, [role="button"]') as HTMLElement : null;
                    const newSvg = createLiveSvg();
                    if (liveBtn && newSvg) {
                        if (!liveBtn.className.includes('inline-flex') && !liveBtn.className.includes('flex')) {
                            liveBtn.className = liveBtn.className + ' inline-flex items-center justify-center gap-2';
                        } else if (!liveBtn.className.includes('gap-')) {
                            liveBtn.className = liveBtn.className + ' gap-2';
                        }
                        liveBtn.querySelector('svg')?.remove();
                        if (meta.position === 'right') {
                            liveBtn.appendChild(newSvg);
                        } else {
                            liveBtn.prepend(newSvg);
                        }
                        surgicalSuccess = true;
                    }
                } else if (iconPickerTarget.type === 'card' && iconPickerTarget.cardIndex !== undefined) {
                    const liveCard = liveCards[iconPickerTarget.cardIndex];
                    const newSvg = createLiveSvg();
                    if (liveCard && newSvg) {
                        const liveBtn = liveCard.querySelector('a, button, [role="button"]');
                        const liveBadge = liveCard.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]');
                        const liveExistingSvgs = Array.from(liveCard.querySelectorAll('svg')).filter(s => {
                            if (liveBtn && liveBtn.contains(s)) return false;
                            if (liveBadge && liveBadge.contains(s)) return false;
                            return true;
                        });
                        if (liveExistingSvgs.length > 0) {
                            liveExistingSvgs[0].replaceWith(newSvg);
                            surgicalSuccess = true;
                        } else {
                            const iconWrap = liveDoc.createElement('div');
                            if (meta.containerStyle === 'badge-soft') {
                                iconWrap.className = 'w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 shrink-0';
                            } else if (meta.containerStyle === 'circle') {
                                iconWrap.className = 'w-12 h-12 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-primary mb-4 shrink-0 shadow-sm';
                            } else {
                                iconWrap.className = 'inline-flex items-center justify-center mb-3 text-primary shrink-0';
                            }
                            iconWrap.appendChild(newSvg);
                            const heading = liveCard.querySelector('h1, h2, h3, h4, h5, h6');
                            if (heading) {
                                liveCard.insertBefore(iconWrap, heading);
                            } else {
                                liveCard.prepend(iconWrap);
                            }
                            surgicalSuccess = true;
                        }
                    }
                } else if (iconPickerTarget.type === 'card-badge' && iconPickerTarget.cardIndex !== undefined) {
                    const liveCard = liveCards[iconPickerTarget.cardIndex];
                    const liveBadge = liveCard ? liveCard.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]') as HTMLElement : null;
                    const newSvg = createLiveSvg();
                    if (liveBadge && newSvg) {
                        if (!liveBadge.className.includes('inline-flex') && !liveBadge.className.includes('flex')) {
                            liveBadge.className = liveBadge.className + ' inline-flex items-center gap-1.5';
                        } else if (!liveBadge.className.includes('gap-')) {
                            liveBadge.className = liveBadge.className + ' gap-1.5';
                        }
                        liveBadge.querySelector('svg')?.remove();
                        if (meta.position === 'right') {
                            liveBadge.appendChild(newSvg);
                        } else {
                            liveBadge.prepend(newSvg);
                        }
                        surgicalSuccess = true;
                    }
                } else if (iconPickerTarget.type === 'paragraph' && iconPickerTarget.paragraphIndex !== undefined) {
                    const livePs = getStandaloneTextElements(liveSection, liveCards);
                    const liveP = livePs[iconPickerTarget.paragraphIndex];
                    const newSvg = createLiveSvg();
                    if (liveP && newSvg) {
                        const parentKicker = liveP.parentElement && liveP.parentElement.classList.contains('rounded-full') ? liveP.parentElement : liveP;
                        if (!parentKicker.className.includes('inline-flex') && !parentKicker.className.includes('flex')) {
                            parentKicker.className = parentKicker.className + ' inline-flex items-center gap-2';
                        }
                        parentKicker.querySelector('svg')?.remove();
                        if (meta.position === 'right') {
                            parentKicker.appendChild(newSvg);
                        } else {
                            parentKicker.prepend(newSvg);
                        }
                        surgicalSuccess = true;
                    }
                }

                if (!surgicalDone) {
                    const updatedSection = doc.getElementById(selectedSectionId);
                    if (updatedSection) {
                        liveSection.innerHTML = updatedSection.innerHTML;
                        liveSection.querySelectorAll('[data-aos]').forEach(el => el.classList.add('aos-animate'));
                    }
                }

                // Re-highlight targeted element in iframe
                if (iconPickerTarget.type === 'link' && iconPickerTarget.linkIndex !== undefined) {
                    highlightElementInIframe('link', iconPickerTarget.linkIndex, 'icon');
                } else if (iconPickerTarget.type === 'card' && iconPickerTarget.cardIndex !== undefined) {
                    highlightElementInIframe('card', iconPickerTarget.cardIndex, 'icon');
                } else if (iconPickerTarget.type === 'card-button' && iconPickerTarget.cardIndex !== undefined) {
                    highlightElementInIframe('card', iconPickerTarget.cardIndex, 'button');
                } else if (iconPickerTarget.type === 'card-badge' && iconPickerTarget.cardIndex !== undefined) {
                    highlightElementInIframe('card', iconPickerTarget.cardIndex, 'badge');
                } else if (iconPickerTarget.type === 'paragraph' && iconPickerTarget.paragraphIndex !== undefined) {
                    highlightElementInIframe('paragraph', iconPickerTarget.paragraphIndex);
                }
            }
        }
        toast.success('Icon updated');
    };

    // Remove Icon from target element
    const handleRemoveIcon = (overrideTarget?: typeof iconPickerTarget) => {
        const target = overrideTarget || iconPickerTarget;
        if (!selectedSectionId || !target) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionEl = doc.getElementById(selectedSectionId);
        if (!sectionEl) return;
        const cards = getCardCandidates(sectionEl);

        let hasChanged = false;

        if (target.type === 'card' && target.cardIndex !== undefined) {
            const cardEl = cards[target.cardIndex];
            if (cardEl) {
                const buttonEl = cardEl.querySelector('a, button, [role="button"]');
                const badgeEl = cardEl.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]');
                const existingSvgs = Array.from(cardEl.querySelectorAll('svg')).filter(s => {
                    if (buttonEl && buttonEl.contains(s)) return false;
                    if (badgeEl && badgeEl.contains(s)) return false;
                    return true;
                });
                if (existingSvgs.length > 0) {
                    const svgEl = existingSvgs[0];
                    const parent = svgEl.parentElement;
                    if (parent && parent !== cardEl && (parent.textContent || '').trim().length === 0 && parent.children.length === 1) {
                        parent.remove();
                    } else {
                        svgEl.remove();
                    }
                    hasChanged = true;
                }
            }
        } else if (target.type === 'link' && target.linkIndex !== undefined) {
            const linkEls = getStandaloneLinks(sectionEl, cards);
            const link = linkEls[target.linkIndex];
            if (link) {
                link.querySelector('svg')?.remove();
                hasChanged = true;
            }
        } else if (target.type === 'card-button' && target.cardIndex !== undefined) {
            const cardEl = cards[target.cardIndex];
            const btn = cardEl?.querySelector('a, button, [role="button"]');
            if (btn) {
                btn.querySelector('svg')?.remove();
                hasChanged = true;
            }
        } else if (target.type === 'card-badge' && target.cardIndex !== undefined) {
            const cardEl = cards[target.cardIndex];
            const badge = cardEl?.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]');
            if (badge) {
                badge.querySelector('svg')?.remove();
                hasChanged = true;
            }
        } else if (target.type === 'paragraph' && target.paragraphIndex !== undefined) {
            const pEls = getStandaloneTextElements(sectionEl, cards);
            const p = pEls[target.paragraphIndex];
            if (p) {
                p.querySelector('svg')?.remove();
                p.parentElement?.querySelector('svg')?.remove();
                hasChanged = true;
            }
        }

        if (!hasChanged) return;
        const updatedHtml = doc.documentElement.outerHTML;
        pushHistory(updatedHtml);

        // Surgical live DOM removal
        if (iframeRef.current?.contentDocument) {
            const liveDoc = iframeRef.current.contentDocument;
            const liveSection = liveDoc.getElementById(selectedSectionId);
            if (liveSection) {
                const liveCards = getCardCandidates(liveSection);
                let surgicalDone = false;

                if (target.type === 'card' && target.cardIndex !== undefined) {
                    const liveCard = liveCards[target.cardIndex];
                    if (liveCard) {
                        const liveBtn = liveCard.querySelector('a, button, [role="button"]');
                        const liveBadge = liveCard.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]');
                        const liveExistingSvgs = Array.from(liveCard.querySelectorAll('svg')).filter(s => {
                            if (liveBtn && liveBtn.contains(s)) return false;
                            if (liveBadge && liveBadge.contains(s)) return false;
                            return true;
                        });
                        if (liveExistingSvgs.length > 0) {
                            const svgEl = liveExistingSvgs[0];
                            const parent = svgEl.parentElement;
                            if (parent && parent !== liveCard && (parent.textContent || '').trim().length === 0 && parent.children.length === 1) {
                                parent.remove();
                            } else {
                                svgEl.remove();
                            }
                            surgicalDone = true;
                        }
                    }
                } else if (target.type === 'link' && target.linkIndex !== undefined) {
                    const liveLinks = getStandaloneLinks(liveSection, liveCards);
                    const liveLink = liveLinks[target.linkIndex];
                    if (liveLink) {
                        liveLink.querySelector('svg')?.remove();
                        surgicalDone = true;
                    }
                } else if (target.type === 'card-button' && target.cardIndex !== undefined) {
                    const liveCard = liveCards[target.cardIndex];
                    const liveBtn = liveCard?.querySelector('a, button, [role="button"]');
                    if (liveBtn) {
                        liveBtn.querySelector('svg')?.remove();
                        surgicalDone = true;
                    }
                } else if (target.type === 'card-badge' && target.cardIndex !== undefined) {
                    const liveCard = liveCards[target.cardIndex];
                    const liveBadge = liveCard?.querySelector('[class*="rounded-full"], [class*="badge"], [class*="tag"], [class*="uppercase text-xs"]');
                    if (liveBadge) {
                        liveBadge.querySelector('svg')?.remove();
                        surgicalDone = true;
                    }
                } else if (target.type === 'paragraph' && target.paragraphIndex !== undefined) {
                    const livePs = getStandaloneTextElements(liveSection, liveCards);
                    const liveP = livePs[target.paragraphIndex];
                    if (liveP) {
                        liveP.querySelector('svg')?.remove();
                        liveP.parentElement?.querySelector('svg')?.remove();
                        surgicalDone = true;
                    }
                }

                if (!surgicalDone) {
                    const updatedSection = doc.getElementById(selectedSectionId);
                    if (updatedSection) {
                        liveSection.innerHTML = updatedSection.innerHTML;
                        liveSection.querySelectorAll('[data-aos]').forEach(el => el.classList.add('aos-animate'));
                    }
                }
            }
        }
        setIconPickerTarget(null);
        toast.success('Icon removed');
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
            imageObjectFit?: string;
            imageObjectPosition?: string;
            imageHeight?: string;
            imageAspectRatio?: string;
            imageScale?: number;
            imagePlacement?: 'top' | 'bottom';
            removeImage?: boolean;
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
                updateElementTextPreservingSvg(badgeEl, updates.badge);
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
                    updateElementTextPreservingSvg(btnEl, updates.buttonText);
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
        if (updates.removeImage) {
            const imgEl = cardEl.querySelector('img');
            if (imgEl) {
                imgEl.remove();
                hasChanged = true;
            }
        } else if (
            updates.imageSrc !== undefined ||
            updates.imageAlt !== undefined ||
            updates.imageObjectFit !== undefined ||
            updates.imageObjectPosition !== undefined ||
            updates.imageHeight !== undefined ||
            updates.imageAspectRatio !== undefined ||
            updates.imageScale !== undefined ||
            updates.imagePlacement !== undefined
        ) {
            let imgEl = cardEl.querySelector('img') as HTMLImageElement | null;
            if (!imgEl && updates.imageSrc) {
                imgEl = doc.createElement('img');
                imgEl.className = 'w-full h-48 object-cover rounded-xl mb-4';
                cardEl.prepend(imgEl);
                hasChanged = true;
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
                if (updates.imageObjectFit !== undefined && imgEl.style.objectFit !== updates.imageObjectFit) {
                    imgEl.style.objectFit = updates.imageObjectFit;
                    hasChanged = true;
                }
                if (updates.imageObjectPosition !== undefined && imgEl.style.objectPosition !== updates.imageObjectPosition) {
                    imgEl.style.objectPosition = updates.imageObjectPosition;
                    hasChanged = true;
                }
                if (updates.imageHeight !== undefined && imgEl.style.height !== updates.imageHeight) {
                    imgEl.style.height = updates.imageHeight;
                    hasChanged = true;
                }
                if (updates.imageAspectRatio !== undefined) {
                    const val = (updates.imageAspectRatio && updates.imageAspectRatio !== 'auto') ? updates.imageAspectRatio : '';
                    if (imgEl.style.aspectRatio !== val) {
                        imgEl.style.aspectRatio = val;
                        hasChanged = true;
                    }
                }
                if (updates.imageScale !== undefined) {
                    const tr = updates.imageScale === 100 ? '' : `scale(${updates.imageScale / 100})`;
                    if (imgEl.style.transform !== tr) {
                        imgEl.style.transform = tr;
                        if (!cardEl.classList.contains('overflow-hidden')) {
                            cardEl.classList.add('overflow-hidden');
                        }
                        hasChanged = true;
                    }
                }
                if (updates.imagePlacement !== undefined) {
                    if (updates.imagePlacement === 'top' && cardEl.firstElementChild !== imgEl) {
                        cardEl.prepend(imgEl);
                        hasChanged = true;
                    } else if (updates.imagePlacement === 'bottom' && cardEl.lastElementChild !== imgEl) {
                        cardEl.appendChild(imgEl);
                        hasChanged = true;
                    }
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
                        if (b) updateElementTextPreservingSvg(b, updates.badge);
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
                        const b = liveCard.querySelector('a, button, [role="button"]') as HTMLElement | null;
                        if (b) updateElementTextPreservingSvg(b, updates.buttonText);
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
                    if (updates.removeImage) {
                        const im = liveCard.querySelector('img');
                        if (im) im.remove();
                    } else if (
                        updates.imageSrc !== undefined ||
                        updates.imageAlt !== undefined ||
                        updates.imageObjectFit !== undefined ||
                        updates.imageObjectPosition !== undefined ||
                        updates.imageHeight !== undefined ||
                        updates.imageAspectRatio !== undefined ||
                        updates.imageScale !== undefined ||
                        updates.imagePlacement !== undefined
                    ) {
                        let im = liveCard.querySelector('img') as HTMLImageElement | null;
                        if (!im && updates.imageSrc) {
                            im = liveCard.ownerDocument.createElement('img');
                            im.className = 'w-full h-48 object-cover rounded-xl mb-4';
                            liveCard.prepend(im);
                        }
                        if (im) {
                            if (updates.imageSrc !== undefined) {
                                im.src = updates.imageSrc;
                                im.setAttribute('src', updates.imageSrc);
                            }
                            if (updates.imageAlt !== undefined) im.setAttribute('alt', updates.imageAlt);
                            if (updates.imageObjectFit !== undefined) im.style.objectFit = updates.imageObjectFit;
                            if (updates.imageObjectPosition !== undefined) im.style.objectPosition = updates.imageObjectPosition;
                            if (updates.imageHeight !== undefined) im.style.height = updates.imageHeight;
                            if (updates.imageAspectRatio !== undefined) im.style.aspectRatio = (updates.imageAspectRatio && updates.imageAspectRatio !== 'auto') ? updates.imageAspectRatio : '';
                            if (updates.imageScale !== undefined) {
                                im.style.transform = updates.imageScale === 100 ? '' : `scale(${updates.imageScale / 100})`;
                                if (!liveCard.classList.contains('overflow-hidden')) {
                                    liveCard.classList.add('overflow-hidden');
                                }
                            }
                            if (updates.imagePlacement !== undefined) {
                                if (updates.imagePlacement === 'top' && liveCard.firstElementChild !== im) {
                                    liveCard.prepend(im);
                                } else if (updates.imagePlacement === 'bottom' && liveCard.lastElementChild !== im) {
                                    liveCard.appendChild(im);
                                }
                            }
                        }
                    }
                    if (updates.bg !== undefined) liveCard.style.backgroundColor = updates.bg || '';
                    if (updates.border !== undefined) liveCard.style.borderColor = updates.border || '';
                    if (updates.color !== undefined) liveCard.style.color = updates.color || '';
                }
            }
        }
    };
    handleUpdateCardContentRef.current = handleUpdateCardContent;

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
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                || (document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)![1]) : '');

            // 1. Get the latest HTML from the live iframe or state
            let htmlToSave = '';

            if (iframeRef.current?.contentDocument) {
                try {
                    const docClone = iframeRef.current.contentDocument.documentElement.cloneNode(true) as HTMLElement;
                    // Strip all editor selection/hover classes and badges
                    docClone.querySelectorAll('.__ss-active-section, .__ss-active-element, .__ss-active-card, .__ss-card-drop-target, .__ss-image-panning').forEach(el => {
                        el.classList.remove('__ss-active-section', '__ss-active-element', '__ss-active-card', '__ss-card-drop-target', '__ss-image-panning');
                    });
                    docClone.querySelectorAll('#__studiosync_preview_styles__, #__ss-selection-overlay__, #__ss-selection-label-badge__, #__ss-section-badge__, .__ss-section-badge, #__ss-pan-badge__, #__ss-card-drop-badge__').forEach(el => {
                        el.remove();
                    });
                    docClone.querySelectorAll('[contenteditable]').forEach(el => {
                        el.removeAttribute('contenteditable');
                    });
                    htmlToSave = '<!DOCTYPE html>\n' + docClone.outerHTML;
                } catch {
                    // Fallback to html state if clone fails
                }
            }

            if (!htmlToSave || !htmlToSave.trim()) {
                htmlToSave = html || project?.html_content || '';
            }

            // Remove editor visual preview artifacts if fallback html state was used
            if (htmlToSave) {
                htmlToSave = htmlToSave
                    .replace(/\s*__ss-active-(section|element|card)/g, '')
                    .replace(/\s*contenteditable="(true|false)"/g, '');
            }

            // Absolute guarantee: htmlToSave must never be empty
            if (!htmlToSave || !htmlToSave.trim()) {
                htmlToSave = project?.html_content || '<html><body></body></html>';
            }

            const payload = {
                html_content: htmlToSave,
                project_name: projectName || project?.project_name || 'Untitled Project',
            };

            const res = await fetch(`/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(payload)
            });

            const resText = await res.text();
            let data: any = null;
            try {
                data = JSON.parse(resText);
            } catch {
                // If response had PHP warning prepended to JSON, attempt to extract JSON substring
                const jsonStart = resText.indexOf('{');
                const jsonEnd = resText.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    try {
                        data = JSON.parse(resText.substring(jsonStart, jsonEnd + 1));
                    } catch {
                        console.error('Non-JSON response received:', resText);
                    }
                }
            }

            if (res.ok && data?.success) {
                setHtml(htmlToSave);
                setIsDirty(false);
                toast.success('Website changes saved successfully!');
            } else {
                const errorMsg = data?.message || (res.status === 422 ? 'Validation error: please check required fields.' : 'Failed to save changes.');
                toast.error(errorMsg);
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
            <header className="h-14 border-b border-zinc-800/80 bg-zinc-900/95 backdrop-blur px-2.5 sm:px-4 flex items-center justify-between shrink-0 z-30 gap-2">
                {/* Left: Brand, Project Name & Layers Toggle */}
                <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                    <Link
                        href={project.workspace ? `/workspaces/${project.workspace.id}` : '/dashboard'}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors shrink-0"
                        title="Back to Workspace"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Link>

                    {/* Left Sidebar Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsLeftSidebarOpen(prev => !prev)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            isLeftSidebarOpen
                                ? 'text-primary bg-primary/10 border border-primary/20 shadow-xs'
                                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                        }`}
                        title={isLeftSidebarOpen ? "Hide Layers (Left Sidebar)" : "Show Layers (Left Sidebar)"}
                    >
                        <PanelLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
                        <span className="text-zinc-500 font-medium hidden sm:inline">Projects /</span>
                        {isRenaming ? (
                            <input
                                type="text"
                                value={projectName}
                                onChange={e => { setProjectName(e.target.value); setIsDirty(true); }}
                                onBlur={() => setIsRenaming(false)}
                                onKeyDown={e => { if (e.key === 'Enter') setIsRenaming(false); }}
                                autoFocus
                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary w-24 sm:w-auto"
                            />
                        ) : (
                            <button
                                onClick={() => setIsRenaming(true)}
                                className="font-semibold text-zinc-100 hover:text-primary transition-colors cursor-pointer truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-[240px]"
                                title="Click to rename"
                            >
                                {projectName}
                            </button>
                        )}

                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 hidden md:inline">
                            Home
                        </span>

                        {isDirty ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 px-1.5 sm:px-2 py-0.5 rounded border border-amber-800/40 animate-pulse shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                <span className="hidden sm:inline">Unsaved</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-800/40 shrink-0">
                                <Check className="w-3 h-3" />
                                <span className="hidden sm:inline">Saved</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Center: Device Switcher & History Controls */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                    {/* Viewport Toggles */}
                    <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60">
                        <button
                            onClick={() => setViewportMode('desktop')}
                            className={`p-1 sm:p-1.5 rounded-md transition-all cursor-pointer ${viewportMode === 'desktop' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            title="Desktop View (100%)"
                        >
                            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={() => setViewportMode('tablet')}
                            className={`p-1 sm:p-1.5 rounded-md transition-all cursor-pointer ${viewportMode === 'tablet' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            title="Tablet View (768px)"
                        >
                            <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={() => setViewportMode('mobile')}
                            className={`p-1 sm:p-1.5 rounded-md transition-all cursor-pointer ${viewportMode === 'mobile' ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            title="Mobile View (375px)"
                        >
                            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-zinc-800"></div>

                    {/* Undo / Redo */}
                    <div className="flex items-center gap-0.5 sm:gap-1">
                        <button
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            className="p-1 sm:p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-1 sm:p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>

                    <div className="hidden md:block h-4 w-px bg-zinc-800"></div>

                    {/* Visual vs Code Mode */}
                    <div className="hidden md:flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60">
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

                {/* Right: Actions & Properties Toggle */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Right Sidebar Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsRightSidebarOpen(prev => !prev)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isRightSidebarOpen
                                ? 'text-primary bg-primary/10 border border-primary/20 shadow-xs'
                                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                        }`}
                        title={isRightSidebarOpen ? "Hide Inspector (Right Sidebar)" : "Show Inspector (Right Sidebar)"}
                    >
                        <PanelRight className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => {
                            const blob = new Blob([html], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                        }}
                        className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Preview generated site in a new browser tab"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                    </button>

                    <button
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-950/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        {isSaving ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="hidden sm:inline"> Saving...</span></>
                        ) : (
                            <><Save className="w-3.5 h-3.5" /><span className="hidden sm:inline"> Publish</span></>
                        )}
                    </button>
                </div>
            </header>

            {/* MAIN WORKSPACE AREA (3 COLUMNS / RESPONSIVE DRAWERS) */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Mobile Backdrop for Left Sidebar */}
                {isLeftSidebarOpen && (
                    <div
                        onClick={() => setIsLeftSidebarOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
                    />
                )}

                {/* LEFT SIDEBAR: LAYERS */}
                <aside className={`
                    ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}
                    fixed lg:static inset-y-0 left-0 z-40 lg:z-10
                    w-72 sm:w-80 lg:w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col shrink-0
                    transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
                `}>
                    <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Layers</span>
                            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                {layers.length}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsLeftSidebarOpen(false)}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Close Layers Panel"
                        >
                            <X className="w-4 h-4" />
                        </button>
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
                <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative min-w-0">
                    {/* Selection Breadcrumb Bar */}
                    {viewMode === 'visual' && (selectedSectionId || highlightedTarget) && (
                        <div className="h-9 px-3 sm:px-4 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center gap-1.5 text-xs shrink-0 z-20 overflow-x-auto whitespace-nowrap scrollbar-none">
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
                                        doc.getElementById('__ss-selection-label-badge__')?.remove();
                                        doc.getElementById('__ss-selection-overlay__')?.remove();
                                        doc.getElementById('__ss-hover-label-badge__')?.remove();
                                        doc.getElementById('__ss-hover-overlay__')?.remove();
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
                                            doc.getElementById('__ss-selection-label-badge__')?.remove();
                                            doc.getElementById('__ss-selection-overlay__')?.remove();
                                            doc.getElementById('__ss-hover-label-badge__')?.remove();
                                            doc.getElementById('__ss-hover-overlay__')?.remove();
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
                                    doc.getElementById('__ss-selection-label-badge__')?.remove();
                                    doc.getElementById('__ss-selection-overlay__')?.remove();
                                    doc.getElementById('__ss-hover-label-badge__')?.remove();
                                    doc.getElementById('__ss-hover-overlay__')?.remove();
                                }
                            }
                        }}
                        className="flex-1 p-2 sm:p-4 md:p-6 overflow-hidden flex flex-col items-center justify-center relative cursor-default min-w-0 min-h-0"
                    >
                        {viewMode === 'visual' ? (
                        <div
                            className={`h-full w-full flex items-center justify-center transition-all duration-300 min-w-0 ${
                                viewportMode === 'desktop'
                                    ? 'max-w-full'
                                    : viewportMode === 'tablet'
                                    ? 'max-w-[768px]'
                                    : 'max-w-[375px]'
                            }`}
                        >
                            <div className="w-full h-full bg-white rounded-lg sm:rounded-xl shadow-2xl border border-zinc-800 overflow-hidden relative flex flex-col min-w-0">
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

                {/* Mobile Backdrop for Right Sidebar */}
                {isRightSidebarOpen && (
                    <div
                        onClick={() => setIsRightSidebarOpen(false)}
                        className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
                    />
                )}

                {/* RIGHT SIDEBAR: FULL EDITING INSPECTOR PANEL */}
                <aside className={`
                    ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full xl:hidden'}
                    fixed xl:static inset-y-0 right-0 z-40 xl:z-10
                    w-full sm:w-96 xl:w-96 border-l border-zinc-800 bg-zinc-900/95 flex flex-col shrink-0 overflow-hidden
                    transition-transform duration-300 ease-in-out shadow-2xl xl:shadow-none
                `}>
                    {/* Tabs Header */}
                    <div className="flex items-center border-b border-zinc-800 shrink-0">
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors cursor-pointer border-b-2 truncate px-2 ${
                                activeTab === 'properties'
                                    ? 'border-primary text-zinc-100 bg-zinc-800/40'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            Content
                        </button>
                        <button
                            onClick={() => setActiveTab('design')}
                            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors cursor-pointer border-b-2 truncate px-2 ${
                                activeTab === 'design'
                                    ? 'border-primary text-zinc-100 bg-zinc-800/40'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            Design
                        </button>
                        <button
                            onClick={() => setActiveTab('assets')}
                            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 px-2 ${
                                activeTab === 'assets'
                                    ? 'border-primary text-zinc-100 bg-zinc-800/40'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <span>Assets</span>
                            {assets.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-mono">
                                    {assets.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsRightSidebarOpen(false)}
                            className="p-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border-l border-zinc-800 cursor-pointer shrink-0"
                            title="Close Inspector"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {activeTab === 'properties' && (
                            <div className="space-y-6">
                                {/* Section-Based Workflow Tip */}
                                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs">
                                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                                    <div className="text-[11px] leading-snug">
                                        <strong className="font-semibold text-zinc-100">Section Editor:</strong> Select a section on the left, then click any field below to instantly highlight and focus that element on your website.
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
                                                    Click any field below to edit and automatically highlight it on the live preview.
                                                </p>
                                            </div>
                                        )}

                                        {/* SECTION-LEVEL STYLING & GROUP COLORS */}
                                        <div
                                            id="editor-control-section-0"
                                            onClick={() => handleSidebarSelect('section', 0)}
                                            className={`space-y-3 p-3.5 rounded-xl transition-all duration-300 cursor-pointer ${
                                                highlightedTarget?.type === 'section'
                                                    ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
                                                    : 'bg-zinc-800/30 border border-zinc-800 hover:border-zinc-700'
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
                                                                    onClick={() => handleSidebarSelect('heading', heading.index)}
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
                                                                        onFocus={() => handleSidebarSelect('heading', heading.index)}
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
                                                                    onClick={() => handleSidebarSelect('paragraph', p.index)}
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
                                                                        onFocus={() => handleSidebarSelect('paragraph', p.index)}
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

                                                                    {/* Paragraph / Kicker Icon Control */}
                                                                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/70">
                                                                        <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5">
                                                                            <Smile className="w-3 h-3 text-amber-400" />
                                                                            <span>Icon:</span>
                                                                        </span>
                                                                        {p.hasIcon && p.iconSvg ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div
                                                                                    className="w-5 h-5 flex items-center justify-center text-primary bg-zinc-900 border border-zinc-700/60 rounded cursor-pointer overflow-hidden [&>svg]:w-3.5 [&>svg]:h-3.5"
                                                                                    dangerouslySetInnerHTML={{ __html: p.iconSvg }}
                                                                                    onClick={() => setIconPickerTarget({
                                                                                        type: 'paragraph',
                                                                                        paragraphIndex: p.index,
                                                                                        currentSvg: p.iconSvg,
                                                                                        label: `${p.tag === 'span' ? 'Badge' : 'Text'} #${p.index + 1} Icon`,
                                                                                        allowPosition: true,
                                                                                        currentPosition: 'left',
                                                                                    })}
                                                                                    title="Click to change icon"
                                                                                />
                                                                                <button
                                                                                    onClick={() => setIconPickerTarget({
                                                                                        type: 'paragraph',
                                                                                        paragraphIndex: p.index,
                                                                                        currentSvg: p.iconSvg,
                                                                                        label: `${p.tag === 'span' ? 'Badge' : 'Text'} #${p.index + 1} Icon`,
                                                                                        allowPosition: true,
                                                                                        currentPosition: 'left',
                                                                                    })}
                                                                                    className="text-[10px] text-primary hover:underline cursor-pointer"
                                                                                >
                                                                                    Change
                                                                                </button>
                                                                                <span className="text-zinc-600">·</span>
                                                                                <button
                                                                                    onClick={() => handleRemoveIcon({
                                                                                        type: 'paragraph',
                                                                                        paragraphIndex: p.index,
                                                                                        label: 'Paragraph Icon',
                                                                                    })}
                                                                                    className="text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer"
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setIconPickerTarget({
                                                                                    type: 'paragraph',
                                                                                    paragraphIndex: p.index,
                                                                                    currentSvg: '',
                                                                                    label: `${p.tag === 'span' ? 'Badge' : 'Text'} #${p.index + 1} Icon`,
                                                                                    allowPosition: true,
                                                                                    currentPosition: 'left',
                                                                                })}
                                                                                className="text-[10px] text-zinc-400 hover:text-primary flex items-center gap-1 py-0.5 px-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 cursor-pointer transition-colors"
                                                                            >
                                                                                <Plus className="w-2.5 h-2.5" />
                                                                                <span>Add Icon</span>
                                                                            </button>
                                                                        )}
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
                                                                onClick={() => handleSidebarSelect('card', card.index)}
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

                                                                {/* Card Icon */}
                                                                <div className="space-y-1.5 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                                                                            <Smile className="w-3.5 h-3.5 text-amber-400" />
                                                                            <span>Card Icon</span>
                                                                        </label>
                                                                        {card.hasIcon && card.iconSvg && (
                                                                            <div className="flex items-center gap-1">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setIconPickerTarget({
                                                                                        type: 'card',
                                                                                        cardIndex: card.index,
                                                                                        currentSvg: card.iconSvg,
                                                                                        label: `Card #${card.index + 1} Icon`,
                                                                                        allowContainerStyle: true,
                                                                                    })}
                                                                                    className="text-[10px] text-primary hover:underline cursor-pointer"
                                                                                >
                                                                                    Change
                                                                                </button>
                                                                                <span className="text-zinc-600">·</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveIcon({
                                                                                        type: 'card',
                                                                                        cardIndex: card.index,
                                                                                        label: `Card #${card.index + 1} Icon`,
                                                                                    })}
                                                                                    className="text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer"
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {card.hasIcon && card.iconSvg ? (
                                                                        <div
                                                                            onClick={() => {
                                                                                handleSidebarSelect('card', card.index, 'icon');
                                                                                setIconPickerTarget({
                                                                                    type: 'card',
                                                                                    cardIndex: card.index,
                                                                                    currentSvg: card.iconSvg,
                                                                                    label: `Card #${card.index + 1} Icon`,
                                                                                    allowContainerStyle: true,
                                                                                });
                                                                            }}
                                                                            className="flex items-center gap-3 p-2 rounded bg-zinc-850 border border-zinc-700/60 hover:border-primary/60 cursor-pointer transition-colors group"
                                                                        >
                                                                            <div
                                                                                className="w-8 h-8 rounded flex items-center justify-center bg-zinc-900 border border-zinc-700/80 text-primary shrink-0 [&>svg]:w-5 [&>svg]:h-5 group-hover:scale-105 transition-transform"
                                                                                dangerouslySetInnerHTML={{ __html: card.iconSvg }}
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs text-zinc-200 truncate font-medium">Active Card Icon</p>
                                                                                <p className="text-[10px] text-zinc-500">Click to change icon or container style</p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                handleSidebarSelect('card', card.index);
                                                                                setIconPickerTarget({
                                                                                    type: 'card',
                                                                                    cardIndex: card.index,
                                                                                    currentSvg: '',
                                                                                    label: `Card #${card.index + 1} Icon`,
                                                                                    allowContainerStyle: true,
                                                                                });
                                                                            }}
                                                                            className="w-full py-1.5 px-2.5 rounded text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-850 hover:bg-zinc-800 border border-dashed border-zinc-700/80 hover:border-zinc-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                                                        >
                                                                            <Plus className="w-3.5 h-3.5 text-primary" />
                                                                            <span>Add Icon to Card</span>
                                                                        </button>
                                                                    )}
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
                                                                                    onFocus={() => handleSidebarSelect('card', card.index, 'badge')}
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
                                                                            onFocus={() => handleSidebarSelect('card', card.index, 'badge')}
                                                                            onChange={(e) => handleUpdateCardContent(card.index, { badge: e.target.value })}
                                                                            className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                                        />
                                                                        <div className="flex items-center justify-between pt-1">
                                                                            <span className="text-[10px] text-zinc-400">Badge Icon:</span>
                                                                            {card.badgeHasIcon && card.badgeIconSvg ? (
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div
                                                                                        className="w-5 h-5 flex items-center justify-center text-primary bg-zinc-900 border border-zinc-700/60 rounded cursor-pointer overflow-hidden [&>svg]:w-3.5 [&>svg]:h-3.5"
                                                                                        dangerouslySetInnerHTML={{ __html: card.badgeIconSvg }}
                                                                                        onClick={() => setIconPickerTarget({
                                                                                            type: 'card-badge',
                                                                                            cardIndex: card.index,
                                                                                            currentSvg: card.badgeIconSvg,
                                                                                            label: `Card #${card.index + 1} Badge Icon`,
                                                                                            allowPosition: true,
                                                                                            currentPosition: 'left',
                                                                                        })}
                                                                                    />
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setIconPickerTarget({
                                                                                            type: 'card-badge',
                                                                                            cardIndex: card.index,
                                                                                            currentSvg: card.badgeIconSvg,
                                                                                            label: `Card #${card.index + 1} Badge Icon`,
                                                                                            allowPosition: true,
                                                                                            currentPosition: 'left',
                                                                                        })}
                                                                                        className="text-[10px] text-primary hover:underline cursor-pointer"
                                                                                    >
                                                                                        Change
                                                                                    </button>
                                                                                    <span className="text-zinc-600">·</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleRemoveIcon({
                                                                                            type: 'card-badge',
                                                                                            cardIndex: card.index,
                                                                                            label: `Card #${card.index + 1} Badge Icon`,
                                                                                        })}
                                                                                        className="text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer"
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setIconPickerTarget({
                                                                                        type: 'card-badge',
                                                                                        cardIndex: card.index,
                                                                                        currentSvg: '',
                                                                                        label: `Card #${card.index + 1} Badge Icon`,
                                                                                        allowPosition: true,
                                                                                        currentPosition: 'left',
                                                                                    })}
                                                                                    className="text-[10px] text-zinc-400 hover:text-primary flex items-center gap-1 py-0.5 px-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 cursor-pointer transition-colors"
                                                                                >
                                                                                    <Plus className="w-2.5 h-2.5" />
                                                                                    <span>Add Badge Icon</span>
                                                                                </button>
                                                                            )}
                                                                        </div>
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
                                                                                onFocus={() => handleSidebarSelect('card', card.index, 'title')}
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
                                                                        onFocus={() => handleSidebarSelect('card', card.index, 'title')}
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
                                                                                onFocus={() => handleSidebarSelect('card', card.index, 'description')}
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
                                                                        onFocus={() => handleSidebarSelect('card', card.index, 'description')}
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
                                                                                    onFocus={() => handleSidebarSelect('card', card.index, 'button')}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { buttonBg: e.target.value })}
                                                                                    className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                                                                                    title="Button Background Color"
                                                                                />
                                                                                <span className="text-[10px] text-zinc-500">Text:</span>
                                                                                <input
                                                                                    type="color"
                                                                                    value={normalizeHex(card.buttonColor || currentColors.primaryText || '#ffffff')}
                                                                                    onFocus={() => handleSidebarSelect('card', card.index, 'button')}
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
                                                                            onFocus={() => handleSidebarSelect('card', card.index, 'button')}
                                                                            onChange={(e) => handleUpdateCardContent(card.index, { buttonText: e.target.value })}
                                                                            className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={card.buttonHref}
                                                                            placeholder="URL (e.g. #contact, /about)"
                                                                            onFocus={() => handleSidebarSelect('card', card.index, 'button')}
                                                                            onChange={(e) => handleUpdateCardContent(card.index, { buttonHref: e.target.value })}
                                                                            className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-mono text-[11px]"
                                                                        />
                                                                    </div>

                                                                    {/* Card Button Icon */}
                                                                    {card.buttonText && (
                                                                        <div className="flex items-center justify-between pt-1">
                                                                            <span className="text-[10px] text-zinc-400">Button Icon:</span>
                                                                            {card.buttonHasIcon && card.buttonIconSvg ? (
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div
                                                                                        className="w-5 h-5 flex items-center justify-center text-primary bg-zinc-900 border border-zinc-700/60 rounded cursor-pointer overflow-hidden [&>svg]:w-3.5 [&>svg]:h-3.5"
                                                                                        dangerouslySetInnerHTML={{ __html: card.buttonIconSvg }}
                                                                                        onClick={() => setIconPickerTarget({
                                                                                            type: 'card-button',
                                                                                            cardIndex: card.index,
                                                                                            currentSvg: card.buttonIconSvg,
                                                                                            currentPosition: card.buttonIconPosition || 'right',
                                                                                            label: `Card #${card.index + 1} Button Icon`,
                                                                                            allowPosition: true,
                                                                                        })}
                                                                                    />
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setIconPickerTarget({
                                                                                            type: 'card-button',
                                                                                            cardIndex: card.index,
                                                                                            currentSvg: card.buttonIconSvg,
                                                                                            currentPosition: card.buttonIconPosition || 'right',
                                                                                            label: `Card #${card.index + 1} Button Icon`,
                                                                                            allowPosition: true,
                                                                                        })}
                                                                                        className="text-[10px] text-primary hover:underline cursor-pointer"
                                                                                    >
                                                                                        Change ({card.buttonIconPosition || 'right'})
                                                                                    </button>
                                                                                    <span className="text-zinc-600">·</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleRemoveIcon({
                                                                                            type: 'card-button',
                                                                                            cardIndex: card.index,
                                                                                            label: `Card #${card.index + 1} Button Icon`,
                                                                                        })}
                                                                                        className="text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer"
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setIconPickerTarget({
                                                                                        type: 'card-button',
                                                                                        cardIndex: card.index,
                                                                                        currentSvg: '',
                                                                                        currentPosition: 'right',
                                                                                        label: `Card #${card.index + 1} Button Icon`,
                                                                                        allowPosition: true,
                                                                                    })}
                                                                                    className="text-[10px] text-zinc-400 hover:text-primary flex items-center gap-1 py-0.5 px-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 cursor-pointer transition-colors"
                                                                                >
                                                                                    <Plus className="w-2.5 h-2.5" />
                                                                                    <span>Add Button Icon</span>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* 4. Card Image & Figma Alignment Inspector */}
                                                                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                                                                            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                                                                            <span>Card Image</span>
                                                                        </label>
                                                                        {card.imageSrc && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateCardContent(card.index, { removeImage: true })}
                                                                                className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                                                                                title="Remove image from card"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                                <span>Remove</span>
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {!card.imageSrc ? (
                                                                        <div className="p-3 border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl bg-zinc-900/40 text-center space-y-2 transition-colors">
                                                                            <div className="text-[11px] text-zinc-400">No image on this card</div>
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setAssetPickerModal({
                                                                                        isOpen: true,
                                                                                        targetType: 'card',
                                                                                        targetIndex: card.index
                                                                                    })}
                                                                                    className="flex-1 py-1.5 px-2 bg-primary/15 hover:bg-primary/25 border border-primary/30 rounded-lg text-primary text-[10.5px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                                                                >
                                                                                    <ImageIcon className="w-3 h-3" />
                                                                                    <span>Choose Asset</span>
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        targetDirectUploadRef.current = { type: 'card', index: card.index };
                                                                                        directUploadFileInputRef.current?.click();
                                                                                    }}
                                                                                    className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 text-[10.5px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                                                                >
                                                                                    <Upload className="w-3 h-3 text-zinc-400" />
                                                                                    <span>Upload R2</span>
                                                                                </button>
                                                                            </div>
                                                                            <p className="text-[9.5px] text-zinc-500">Or drag an image from Assets tab onto this card</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-3 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                                                                            {/* Thumbnail + URL + Alt */}
                                                                            <div className="flex items-start gap-2.5">
                                                                                <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-700/80 bg-zinc-950 shrink-0 relative group flex items-center justify-center">
                                                                                    <img
                                                                                        src={card.imageSrc}
                                                                                        alt={card.imageAlt || 'Card image'}
                                                                                        className="w-full h-full"
                                                                                        style={{
                                                                                            objectFit: card.imageObjectFit || 'cover',
                                                                                            objectPosition: card.imageObjectPosition || '50% 50%'
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1 space-y-1.5 min-w-0">
                                                                                    <input
                                                                                        type="text"
                                                                                        data-card-field="image"
                                                                                        value={card.imageSrc}
                                                                                        placeholder="Image URL..."
                                                                                        onFocus={() => handleSidebarSelect('card', card.index, 'image')}
                                                                                        onChange={(e) => handleUpdateCardContent(card.index, { imageSrc: e.target.value })}
                                                                                        className="w-full text-[11px] bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-zinc-200 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-mono truncate"
                                                                                    />
                                                                                    <input
                                                                                        type="text"
                                                                                        value={card.imageAlt}
                                                                                        placeholder="Alt description..."
                                                                                        onFocus={() => handleSidebarSelect('card', card.index, 'image')}
                                                                                        onChange={(e) => handleUpdateCardContent(card.index, { imageAlt: e.target.value })}
                                                                                        className="w-full text-[11px] bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-zinc-200 placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none truncate"
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            {/* Replace Buttons */}
                                                                            <div className="flex items-center gap-1.5">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setAssetPickerModal({
                                                                                        isOpen: true,
                                                                                        targetType: 'card',
                                                                                        targetIndex: card.index
                                                                                    })}
                                                                                    className="flex-1 py-1 px-2 bg-primary/15 hover:bg-primary/25 border border-primary/30 rounded text-primary text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                                                                >
                                                                                    <ImageIcon className="w-3 h-3" />
                                                                                    <span>Assets</span>
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        targetDirectUploadRef.current = { type: 'card', index: card.index };
                                                                                        directUploadFileInputRef.current?.click();
                                                                                    }}
                                                                                    className="flex-1 py-1 px-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                                                                >
                                                                                    <Upload className="w-3 h-3 text-zinc-400" />
                                                                                    <span>Upload R2</span>
                                                                                </button>
                                                                            </div>

                                                                            {/* Figma Fit Modes */}
                                                                            <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/80">
                                                                                <div className="flex items-center justify-between text-[10.5px]">
                                                                                    <span className="text-zinc-400 font-medium">Fit Mode</span>
                                                                                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase">{card.imageObjectFit || 'cover'}</span>
                                                                                </div>
                                                                                <div className="grid grid-cols-4 gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
                                                                                    {[
                                                                                        { id: 'cover', label: 'Fill', tip: 'Cover container' },
                                                                                        { id: 'contain', label: 'Fit', tip: 'Fit inside container' },
                                                                                        { id: 'none', label: 'Crop', tip: 'Original size, crop' },
                                                                                        { id: 'fill', label: 'Stretch', tip: 'Stretch to fit' }
                                                                                    ].map(mode => (
                                                                                        <button
                                                                                            key={mode.id}
                                                                                            type="button"
                                                                                            onClick={() => handleUpdateCardContent(card.index, { imageObjectFit: mode.id })}
                                                                                            title={mode.tip}
                                                                                            className={`py-1 rounded text-[10px] font-medium transition-all cursor-pointer text-center ${
                                                                                                (card.imageObjectFit || 'cover') === mode.id
                                                                                                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                                                                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                                                                                            }`}
                                                                                        >
                                                                                            {mode.label}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* 9-Point Alignment Matrix & Live Position */}
                                                                            <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/80">
                                                                                <div className="flex items-center justify-between text-[10.5px]">
                                                                                    <span className="text-zinc-400 font-medium flex items-center gap-1">
                                                                                        <Move className="w-3 h-3 text-primary" />
                                                                                        <span>Figma Alignment Matrix</span>
                                                                                    </span>
                                                                                    <span className="text-[10px] font-mono text-primary font-semibold">
                                                                                        X: {card.imagePositionX ?? 50}% Y: {card.imagePositionY ?? 50}%
                                                                                    </span>
                                                                                </div>

                                                                                <div className="flex items-center gap-3">
                                                                                    {/* 3x3 Matrix */}
                                                                                    <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800/80 w-24 h-24 shrink-0">
                                                                                        {[
                                                                                            { pos: '0% 0%', label: 'Top Left' },
                                                                                            { pos: '50% 0%', label: 'Top Center' },
                                                                                            { pos: '100% 0%', label: 'Top Right' },
                                                                                            { pos: '0% 50%', label: 'Center Left' },
                                                                                            { pos: '50% 50%', label: 'Center' },
                                                                                            { pos: '100% 50%', label: 'Center Right' },
                                                                                            { pos: '0% 100%', label: 'Bottom Left' },
                                                                                            { pos: '50% 100%', label: 'Bottom Center' },
                                                                                            { pos: '100% 100%', label: 'Bottom Right' }
                                                                                        ].map((anchor) => {
                                                                                            const isSelected = (card.imageObjectPosition || '50% 50%').trim() === anchor.pos;
                                                                                            return (
                                                                                                <button
                                                                                                    key={anchor.pos}
                                                                                                    type="button"
                                                                                                    onClick={() => handleUpdateCardContent(card.index, { imageObjectPosition: anchor.pos })}
                                                                                                    title={`Align ${anchor.label} (${anchor.pos})`}
                                                                                                    className={`rounded flex items-center justify-center transition-all cursor-pointer ${
                                                                                                        isSelected
                                                                                                            ? 'bg-primary text-primary-foreground ring-1 ring-primary shadow-sm'
                                                                                                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                                                                                    }`}
                                                                                                >
                                                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white scale-125' : 'bg-zinc-600'}`} />
                                                                                                </button>
                                                                                            );
                                                                                        })}
                                                                                    </div>

                                                                                    {/* Canvas Pan Hint */}
                                                                                    <div className="flex-1 space-y-1.5 text-[10px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/50 leading-relaxed">
                                                                                        <div className="text-zinc-300 font-medium flex items-center gap-1">
                                                                                            <span>💡 Canvas Drag & Pan:</span>
                                                                                        </div>
                                                                                        <p className="text-[9.5px] text-zinc-400">
                                                                                            Drag the image directly on the canvas to pan and align in real time.
                                                                                        </p>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleUpdateCardContent(card.index, { imageObjectPosition: '50% 50%' })}
                                                                                            className="text-[9.5px] text-primary hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                                                                                        >
                                                                                            <RotateCcw className="w-2.5 h-2.5" />
                                                                                            <span>Reset to 50% 50%</span>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Position Sliders (X & Y) */}
                                                                            <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                                                                                <div className="space-y-1">
                                                                                    <div className="flex items-center justify-between text-[10px]">
                                                                                        <span className="text-zinc-400">X Position (Horizontal)</span>
                                                                                        <span className="font-mono text-zinc-300">{card.imagePositionX ?? 50}%</span>
                                                                                    </div>
                                                                                    <input
                                                                                        type="range"
                                                                                        min="0"
                                                                                        max="100"
                                                                                        value={card.imagePositionX ?? 50}
                                                                                        onChange={(e) => {
                                                                                            const newX = e.target.value;
                                                                                            const curY = card.imagePositionY ?? 50;
                                                                                            handleUpdateCardContent(card.index, { imageObjectPosition: `${newX}% ${curY}%` });
                                                                                        }}
                                                                                        className="w-full accent-primary h-1 bg-zinc-800 rounded cursor-pointer"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <div className="flex items-center justify-between text-[10px]">
                                                                                        <span className="text-zinc-400">Y Position (Vertical)</span>
                                                                                        <span className="font-mono text-zinc-300">{card.imagePositionY ?? 50}%</span>
                                                                                    </div>
                                                                                    <input
                                                                                        type="range"
                                                                                        min="0"
                                                                                        max="100"
                                                                                        value={card.imagePositionY ?? 50}
                                                                                        onChange={(e) => {
                                                                                            const curX = card.imagePositionX ?? 50;
                                                                                            const newY = e.target.value;
                                                                                            handleUpdateCardContent(card.index, { imageObjectPosition: `${curX}% ${newY}%` });
                                                                                        }}
                                                                                        className="w-full accent-primary h-1 bg-zinc-800 rounded cursor-pointer"
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            {/* Aspect Ratio Presets */}
                                                                            <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/80">
                                                                                <div className="flex items-center justify-between text-[10.5px]">
                                                                                    <span className="text-zinc-400 font-medium">Aspect Ratio</span>
                                                                                    <span className="text-[9.5px] font-mono text-zinc-500">
                                                                                        {card.imageAspectRatio || 'Default / Auto'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="grid grid-cols-5 gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
                                                                                    {[
                                                                                        { id: 'auto', label: 'Auto' },
                                                                                        { id: '16/9', label: '16:9' },
                                                                                        { id: '4/3', label: '4:3' },
                                                                                        { id: '1/1', label: '1:1' },
                                                                                        { id: '3/4', label: '3:4' }
                                                                                    ].map(ratio => {
                                                                                        const isMatch = (card.imageAspectRatio || 'auto') === ratio.id || (!card.imageAspectRatio && ratio.id === 'auto');
                                                                                        return (
                                                                                            <button
                                                                                                key={ratio.id}
                                                                                                type="button"
                                                                                                onClick={() => handleUpdateCardContent(card.index, { imageAspectRatio: ratio.id === 'auto' ? '' : ratio.id })}
                                                                                                className={`py-1 rounded text-[10px] font-medium transition-all cursor-pointer text-center ${
                                                                                                    isMatch
                                                                                                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                                                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                                                                                                }`}
                                                                                            >
                                                                                                {ratio.label}
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>

                                                                            {/* Height Slider */}
                                                                            <div className="space-y-1 pt-1">
                                                                                <div className="flex items-center justify-between text-[10px]">
                                                                                    <span className="text-zinc-400">Card Image Height</span>
                                                                                    <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                                                                                        <span>{card.imageHeight || 'Default (192px)'}</span>
                                                                                        {card.imageHeight && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleUpdateCardContent(card.index, { imageHeight: '' })}
                                                                                                className="text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                                                                                            >
                                                                                                (Reset)
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <input
                                                                                    type="range"
                                                                                    min="120"
                                                                                    max="450"
                                                                                    step="10"
                                                                                    value={card.imageHeight ? parseInt(card.imageHeight) || 192 : 192}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { imageHeight: `${e.target.value}px` })}
                                                                                    className="w-full accent-primary h-1 bg-zinc-800 rounded cursor-pointer"
                                                                                />
                                                                            </div>

                                                                            {/* Zoom / Scale Slider */}
                                                                            <div className="space-y-1 pt-1.5 border-t border-zinc-800/80">
                                                                                <div className="flex items-center justify-between text-[10px]">
                                                                                    <span className="text-zinc-400 flex items-center gap-1">
                                                                                        <ZoomIn className="w-3 h-3 text-primary" />
                                                                                        <span>Zoom & Crop Scale</span>
                                                                                    </span>
                                                                                    <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                                                                                        <span>{card.imageScale || 100}%</span>
                                                                                        {(card.imageScale && card.imageScale !== 100) && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleUpdateCardContent(card.index, { imageScale: 100 })}
                                                                                                className="text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                                                                                            >
                                                                                                (100%)
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <input
                                                                                    type="range"
                                                                                    min="100"
                                                                                    max="200"
                                                                                    step="5"
                                                                                    value={card.imageScale || 100}
                                                                                    onChange={(e) => handleUpdateCardContent(card.index, { imageScale: Number(e.target.value) })}
                                                                                    className="w-full accent-primary h-1 bg-zinc-800 rounded cursor-pointer"
                                                                                />
                                                                            </div>

                                                                            {/* Placement (Top of Card vs Bottom of Card) */}
                                                                            <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/80">
                                                                                <div className="flex items-center justify-between text-[10.5px]">
                                                                                    <span className="text-zinc-400 font-medium">Placement in Card</span>
                                                                                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase">{card.imagePlacement || 'top'}</span>
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleUpdateCardContent(card.index, { imagePlacement: 'top' })}
                                                                                        className={`py-1 rounded text-[10px] font-medium transition-all cursor-pointer text-center ${
                                                                                            (card.imagePlacement || 'top') === 'top'
                                                                                                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                                                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                                                                                        }`}
                                                                                    >
                                                                                        Top of Card
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleUpdateCardContent(card.index, { imagePlacement: 'bottom' })}
                                                                                        className={`py-1 rounded text-[10px] font-medium transition-all cursor-pointer text-center ${
                                                                                            card.imagePlacement === 'bottom'
                                                                                                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                                                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                                                                                        }`}
                                                                                    >
                                                                                        Bottom of Card
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

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
                                                                                    onFocus={() => handleSidebarSelect('card', card.index)}
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
                                                                                    onFocus={() => handleSidebarSelect('card', card.index)}
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
                                                                                    onFocus={() => handleSidebarSelect('card', card.index)}
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
                                                                onClick={() => handleSidebarSelect('link', link.index)}
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
                                                                        onFocus={() => handleSidebarSelect('link', link.index)}
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
                                                                        onFocus={() => handleSidebarSelect('link', link.index)}
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
                                                                                onFocus={() => handleSidebarSelect('link', link.index)}
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
                                                                                onFocus={() => handleSidebarSelect('link', link.index)}
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

                                                                {/* Button / Link Icon */}
                                                                <div className={`flex items-center justify-between pt-1 border-t border-zinc-800/80 transition-colors ${
                                                                    isHighlighted && highlightedTarget?.subField === 'icon'
                                                                        ? 'p-1.5 rounded-lg bg-primary/20 border-primary ring-1 ring-primary'
                                                                        : ''
                                                                }`}>
                                                                    <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5">
                                                                        <Smile className="w-3 h-3 text-emerald-400" />
                                                                        <span>Icon:</span>
                                                                    </span>
                                                                    {link.hasIcon && link.iconSvg ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div
                                                                                className="w-5 h-5 flex items-center justify-center text-primary bg-zinc-900 border border-zinc-700/60 rounded cursor-pointer overflow-hidden [&>svg]:w-3.5 [&>svg]:h-3.5"
                                                                                dangerouslySetInnerHTML={{ __html: link.iconSvg }}
                                                                                onClick={() => setIconPickerTarget({
                                                                                    type: 'link',
                                                                                    linkIndex: link.index,
                                                                                    currentSvg: link.iconSvg,
                                                                                    currentPosition: link.iconPosition || 'left',
                                                                                    label: `${link.isButton ? 'Button' : 'Link'} #${link.index + 1} Icon`,
                                                                                    allowPosition: true,
                                                                                })}
                                                                                title="Click to change icon"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setIconPickerTarget({
                                                                                    type: 'link',
                                                                                    linkIndex: link.index,
                                                                                    currentSvg: link.iconSvg,
                                                                                    currentPosition: link.iconPosition || 'left',
                                                                                    label: `${link.isButton ? 'Button' : 'Link'} #${link.index + 1} Icon`,
                                                                                    allowPosition: true,
                                                                                })}
                                                                                className="text-[10px] text-primary hover:underline cursor-pointer"
                                                                            >
                                                                                Change ({link.iconPosition || 'left'})
                                                                            </button>
                                                                            <span className="text-zinc-600">·</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveIcon({
                                                                                    type: 'link',
                                                                                    linkIndex: link.index,
                                                                                    label: `${link.isButton ? 'Button' : 'Link'} #${link.index + 1} Icon`,
                                                                                })}
                                                                                className="text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setIconPickerTarget({
                                                                                type: 'link',
                                                                                linkIndex: link.index,
                                                                                currentSvg: '',
                                                                                currentPosition: 'right',
                                                                                label: `${link.isButton ? 'Button' : 'Link'} #${link.index + 1} Icon`,
                                                                                allowPosition: true,
                                                                            })}
                                                                            className="text-[10px] text-zinc-400 hover:text-primary flex items-center gap-1 py-0.5 px-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 cursor-pointer transition-colors"
                                                                        >
                                                                            <Plus className="w-2.5 h-2.5" />
                                                                            <span>Add Icon</span>
                                                                        </button>
                                                                    )}
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
                                                                onClick={() => handleSidebarSelect('image', img.index)}
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
                                                                        onFocus={() => handleSidebarSelect('image', img.index)}
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
                                                                        onFocus={() => handleSidebarSelect('image', img.index)}
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
                                                                                    handleSidebarSelect('image', img.index);
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

                                                            {/* Asset Picker and Direct Upload UI */}
                                                            <div className="pt-2 border-t border-zinc-800 space-y-2">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setAssetPickerModal({
                                                                            isOpen: true,
                                                                            targetType: 'image',
                                                                            targetIndex: img.index
                                                                        })}
                                                                        className="py-1.5 px-2 bg-primary/15 hover:bg-primary/25 border border-primary/30 rounded-lg text-primary text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                                                    >
                                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                                        <span>Choose Asset</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            targetDirectUploadRef.current = { type: 'image', index: img.index };
                                                                            directUploadFileInputRef.current?.click();
                                                                        }}
                                                                        className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                                                    >
                                                                        <Upload className="w-3.5 h-3.5 text-zinc-400" />
                                                                        <span>Upload to R2</span>
                                                                    </button>
                                                                </div>
                                                                <p className="text-[10px] text-zinc-500 text-center">
                                                                    Max 10MB • Stored on Cloudflare R2
                                                                </p>
                                                            </div>

                                                            {/* Figma Fit & Alignment Controls for Section Image */}
                                                            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
                                                                {/* Fit Modes */}
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between text-[10.5px]">
                                                                        <span className="text-zinc-400 font-medium">Fit Mode</span>
                                                                        <span className="text-[9.5px] font-mono text-zinc-500 uppercase">{img.objectFit || 'cover'}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-4 gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
                                                                        {[
                                                                            { id: 'cover', label: 'Fill', tip: 'Cover container' },
                                                                            { id: 'contain', label: 'Fit', tip: 'Fit inside container' },
                                                                            { id: 'none', label: 'Crop', tip: 'Original size, crop' },
                                                                            { id: 'fill', label: 'Stretch', tip: 'Stretch to fit' }
                                                                        ].map(mode => (
                                                                            <button
                                                                                key={mode.id}
                                                                                type="button"
                                                                                onClick={() => handleUpdateImage(img.index, { objectFit: mode.id })}
                                                                                title={mode.tip}
                                                                                className={`py-1 rounded text-[10px] font-medium transition-all cursor-pointer text-center ${
                                                                                    (img.objectFit || 'cover') === mode.id
                                                                                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                                                                                }`}
                                                                            >
                                                                                {mode.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* 9-Point Alignment Grid & Live Position */}
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between text-[10.5px]">
                                                                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                                                                            <Move className="w-3 h-3 text-primary" />
                                                                            <span>Figma Alignment Matrix</span>
                                                                        </span>
                                                                        <span className="text-[10px] font-mono text-primary font-semibold">
                                                                            X: {img.positionX ?? 50}% Y: {img.positionY ?? 50}%
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        {/* 3x3 Matrix */}
                                                                        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800/80 w-24 h-24 shrink-0">
                                                                            {[
                                                                                { pos: '0% 0%', label: 'Top Left' },
                                                                                { pos: '50% 0%', label: 'Top Center' },
                                                                                { pos: '100% 0%', label: 'Top Right' },
                                                                                { pos: '0% 50%', label: 'Center Left' },
                                                                                { pos: '50% 50%', label: 'Center' },
                                                                                { pos: '100% 50%', label: 'Center Right' },
                                                                                { pos: '0% 100%', label: 'Bottom Left' },
                                                                                { pos: '50% 100%', label: 'Bottom Center' },
                                                                                { pos: '100% 100%', label: 'Bottom Right' }
                                                                            ].map((anchor) => {
                                                                                const isSelected = (img.objectPosition || '50% 50%').trim() === anchor.pos;
                                                                                return (
                                                                                    <button
                                                                                        key={anchor.pos}
                                                                                        type="button"
                                                                                        onClick={() => handleUpdateImage(img.index, { objectPosition: anchor.pos })}
                                                                                        title={`Align ${anchor.label} (${anchor.pos})`}
                                                                                        className={`rounded flex items-center justify-center transition-all cursor-pointer ${
                                                                                            isSelected
                                                                                                ? 'bg-primary text-primary-foreground ring-1 ring-primary shadow-sm'
                                                                                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                                                                        }`}
                                                                                    >
                                                                                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white scale-125' : 'bg-zinc-600'}`} />
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>

                                                                        {/* Canvas Pan Hint */}
                                                                        <div className="flex-1 space-y-1.5 text-[10px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/50 leading-relaxed">
                                                                            <div className="text-zinc-300 font-medium flex items-center gap-1">
                                                                                <span>💡 Canvas Drag & Pan:</span>
                                                                            </div>
                                                                            <p className="text-[9.5px] text-zinc-400">
                                                                                Drag the image directly on the canvas to pan and align in real time.
                                                                            </p>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateImage(img.index, { objectPosition: '50% 50%' })}
                                                                                className="text-[9.5px] text-primary hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                                                                            >
                                                                                <RotateCcw className="w-2.5 h-2.5" />
                                                                                <span>Reset to 50% 50%</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Position Sliders (X & Y) */}
                                                                <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center justify-between text-[10px]">
                                                                            <span className="text-zinc-400">X Position (Horizontal)</span>
                                                                            <span className="font-mono text-zinc-300">{img.positionX ?? 50}%</span>
                                                                        </div>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={img.positionX ?? 50}
                                                                            onChange={(e) => {
                                                                                const newX = e.target.value;
                                                                                const curY = img.positionY ?? 50;
                                                                                handleUpdateImage(img.index, { objectPosition: `${newX}% ${curY}%` });
                                                                            }}
                                                                            className="w-full accent-primary h-1 bg-zinc-800 rounded cursor-pointer"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center justify-between text-[10px]">
                                                                            <span className="text-zinc-400">Y Position (Vertical)</span>
                                                                            <span className="font-mono text-zinc-300">{img.positionY ?? 50}%</span>
                                                                        </div>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={img.positionY ?? 50}
                                                                            onChange={(e) => {
                                                                                const curX = img.positionX ?? 50;
                                                                                const newY = e.target.value;
                                                                                handleUpdateImage(img.index, { objectPosition: `${curX}% ${newY}%` });
                                                                            }}
                                                                            className="w-full accent-primary h-1 bg-zinc-800 rounded cursor-pointer"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Aspect Ratio Presets */}
                                                                <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/80">
                                                                    <div className="flex items-center justify-between text-[10.5px]">
                                                                        <span className="text-zinc-400 font-medium">Aspect Ratio</span>
                                                                        <span className="text-[9.5px] font-mono text-zinc-500">
                                                                            {img.aspectRatio || 'Default / Auto'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-5 gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
                                                                        {[
                                                                            { id: 'auto', label: 'Auto' },
                                                                            { id: '16/9', label: '16:9' },
                                                                            { id: '4/3', label: '4:3' },
                                                                            { id: '1/1', label: '1:1' },
                                                                            { id: '3/4', label: '3:4' }
                                                                        ].map(ratio => {
                                                                            const isMatch = (img.aspectRatio || 'auto') === ratio.id || (!img.aspectRatio && ratio.id === 'auto');
                                                                            return (
                                                                                <button
                                                                                    key={ratio.id}
                                                                                    type="button"
                                                                                    onClick={() => handleUpdateImage(img.index, { aspectRatio: ratio.id === 'auto' ? '' : ratio.id })}
                                                                                    className={`py-1 rounded text-[10px] font-medium transition-all cursor-pointer text-center ${
                                                                                        isMatch
                                                                                            ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                                                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                                                                                    }`}
                                                                                >
                                                                                    {ratio.label}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* Height Slider */}
                                                                <div className="space-y-1 pt-1">
                                                                    <div className="flex items-center justify-between text-[10px]">
                                                                        <span className="text-zinc-400">Image Height</span>
                                                                        <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                                                                            <span>{img.height || 'Auto / CSS default'}</span>
                                                                            {img.height && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleUpdateImage(img.index, { height: '' })}
                                                                                    className="text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                                                                                >
                                                                                    (Reset)
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="120"
                                                                        max="600"
                                                                        step="10"
                                                                        value={img.height ? parseInt(img.height) || 240 : 240}
                                                                        onChange={(e) => handleUpdateImage(img.index, { height: `${e.target.value}px` })}
                                                                        className="w-full accent-primary h-1 bg-zinc-800 rounded cursor-pointer"
                                                                    />
                                                                </div>

                                                                {/* Zoom / Scale Slider */}
                                                                <div className="space-y-1 pt-1.5 border-t border-zinc-800/80">
                                                                    <div className="flex items-center justify-between text-[10px]">
                                                                        <span className="text-zinc-400 flex items-center gap-1">
                                                                            <ZoomIn className="w-3 h-3 text-primary" />
                                                                            <span>Zoom & Crop Scale</span>
                                                                        </span>
                                                                        <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                                                                            <span>{img.scale || 100}%</span>
                                                                            {(img.scale && img.scale !== 100) && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleUpdateImage(img.index, { scale: 100 })}
                                                                                    className="text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                                                                                >
                                                                                    (100%)
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="100"
                                                                        max="200"
                                                                        step="5"
                                                                        value={img.scale || 100}
                                                                        onChange={(e) => handleUpdateImage(img.index, { scale: Number(e.target.value) })}
                                                                        className="w-full accent-primary h-1 bg-zinc-800 rounded cursor-pointer"
                                                                    />
                                                                </div>
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
                        )}

                        {activeTab === 'design' && (
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

                        {activeTab === 'assets' && (
                            /* ASSETS MANAGEMENT TAB (Cloudflare R2) */
                            <div className="space-y-5">
                                {/* Header / Notice card */}
                                <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 font-semibold text-xs text-zinc-200">
                                            <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                            <span>Project Assets</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded-full border border-zinc-800">
                                            {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                                        Stored securely on Cloudflare R2 cloud storage. Max <strong className="text-zinc-300 font-medium">10MB</strong> per image.
                                    </p>
                                    
                                    {/* Subtle Storage Efficiency Warning */}
                                    <div className="flex items-start gap-1.5 p-2 bg-amber-950/20 border border-amber-800/30 rounded-lg text-[10.5px] text-amber-300/90 leading-snug">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                                        <span>
                                            <strong className="font-semibold text-amber-200">Storage Efficiency:</strong> Replacing an image will automatically delete the previous file from R2.
                                        </span>
                                    </div>
                                </div>

                                {/* Upload Dropzone / Button */}
                                <div
                                    onClick={() => !isUploadingAsset && newAssetFileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                        isUploadingAsset
                                            ? 'border-primary/50 bg-primary/5 cursor-wait'
                                            : 'border-zinc-700/80 hover:border-primary/60 bg-zinc-900/40 hover:bg-zinc-850/60'
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                            {isUploadingAsset ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <UploadCloud className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-zinc-200">
                                                {isUploadingAsset ? 'Uploading to R2 Storage...' : 'Upload Image to R2'}
                                            </p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                                PNG, JPG, SVG, WebP up to 10MB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Selection Quick Helper (if an image/card is selected on canvas) */}
                                {highlightedTarget && (highlightedTarget.type === 'image' || highlightedTarget.type === 'card') && (
                                    <div className="flex items-center justify-between p-2.5 bg-primary/10 border border-primary/25 rounded-xl text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-zinc-200 text-[11px]">
                                                Ready to assign to: <strong className="text-primary font-semibold capitalize">{highlightedTarget.type} #{highlightedTarget.index + 1}</strong>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Search & Filter Bar */}
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="text"
                                            value={assetSearchQuery}
                                            onChange={(e) => setAssetSearchQuery(e.target.value)}
                                            placeholder="Search assets by name or tag..."
                                            className="w-full pl-8 pr-7 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {assetSearchQuery && (
                                            <button
                                                onClick={() => setAssetSearchQuery('')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Asset Grid / List */}
                                {filteredAssets.length === 0 ? (
                                    <div className="py-8 text-center text-zinc-500 space-y-2 bg-zinc-900/30 rounded-xl border border-zinc-800/60 p-4">
                                        <FileImage className="w-8 h-8 mx-auto text-zinc-600" />
                                        <p className="text-xs text-zinc-400">
                                            {assetSearchQuery ? 'No matching assets found.' : 'No assets uploaded yet.'}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">
                                            Upload pictures to use anywhere across your website pages.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {filteredAssets.map((asset) => {
                                            const assetUrl = resolveAssetUrl(asset);
                                            return (
                                                <div
                                                    key={asset.id}
                                                    draggable={true}
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('application/json', JSON.stringify({
                                                            assetUrl: assetUrl,
                                                            assetName: asset.name,
                                                            assetId: asset.id
                                                        }));
                                                        e.dataTransfer.setData('text/plain', assetUrl);
                                                        e.dataTransfer.effectAllowed = 'copy';
                                                    }}
                                                    className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-primary/50 transition-all space-y-2 group cursor-grab active:cursor-grabbing hover:shadow-lg select-none"
                                                    title="Drag onto any card or image on the canvas to apply"
                                                >
                                                    <div className="flex gap-3">
                                                        {/* Thumbnail */}
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-center">
                                                            {assetUrl ? (
                                                                <img
                                                                    src={assetUrl}
                                                                    alt={asset.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        const fb = e.currentTarget.parentElement?.querySelector('.fallback-sidebar-thumb');
                                                                        if (fb) fb.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={`fallback-sidebar-thumb ${assetUrl ? 'hidden' : ''} flex flex-col items-center justify-center text-zinc-600`}>
                                                                <FileImage className="w-6 h-6" />
                                                            </div>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-zinc-200 truncate" title={asset.name}>
                                                                    {asset.name}
                                                                </h4>
                                                                {asset.description ? (
                                                                    <p className="text-[10.5px] text-zinc-400 truncate mt-0.5" title={asset.description}>
                                                                        {asset.description}
                                                                    </p>
                                                                ) : (
                                                                    <span className="text-[10px] text-zinc-500 italic">No description</span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between text-[9.5px] text-zinc-500 font-mono">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span>R2 Stored</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <span className="text-[9px] text-primary font-medium flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                                                                    <Move className="w-2.5 h-2.5" /> Drag to canvas
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-zinc-800/80">
                                                        <button
                                                            type="button"
                                                            onClick={() => applyAssetToTarget(assetUrl, asset.name)}
                                                            className="py-1 px-1.5 bg-primary/15 hover:bg-primary/25 border border-primary/30 rounded text-primary text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer col-span-2"
                                                            title="Apply to active selection or copy URL"
                                                        >
                                                            <Check className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">
                                                                {highlightedTarget && (highlightedTarget.type === 'image' || highlightedTarget.type === 'card')
                                                                    ? 'Apply to Selection'
                                                                    : 'Copy URL'}
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setAssetToReplace(asset)}
                                                            className="py-1 px-1 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-800/30 text-amber-400 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                                            title="Replace file (automatically deletes old file from R2)"
                                                        >
                                                            <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                                                            <span>Replace</span>
                                                        </button>

                                                        <div className="flex items-center gap-1 justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingAsset(asset)}
                                                                className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors cursor-pointer"
                                                                title="Edit Details"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAsset(asset)}
                                                                className="p-1 bg-red-950/30 hover:bg-red-900/40 text-red-400 rounded border border-red-800/30 transition-colors cursor-pointer"
                                                                title="Delete from R2"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* MOBILE QUICK BOTTOM NAVIGATION (< md screens) */}
            <nav className="md:hidden h-14 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur px-2 flex items-center justify-around shrink-0 z-20">
                <button
                    onClick={() => {
                        setIsLeftSidebarOpen(prev => !prev);
                        setIsRightSidebarOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        isLeftSidebarOpen ? 'text-primary bg-primary/10 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <Layers className="w-4 h-4 mb-0.5" />
                    <span>Layers ({layers.length})</span>
                </button>
                <button
                    onClick={() => {
                        setIsLeftSidebarOpen(false);
                        setIsRightSidebarOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        !isLeftSidebarOpen && !isRightSidebarOpen ? 'text-primary bg-primary/10 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <Eye className="w-4 h-4 mb-0.5" />
                    <span>Preview</span>
                </button>
                <button
                    onClick={() => {
                        setIsRightSidebarOpen(true);
                        setIsLeftSidebarOpen(false);
                        setActiveTab('properties');
                    }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        isRightSidebarOpen && activeTab === 'properties' ? 'text-primary bg-primary/10 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <Sliders className="w-4 h-4 mb-0.5" />
                    <span>Inspector</span>
                </button>
                <button
                    onClick={() => {
                        setIsRightSidebarOpen(true);
                        setIsLeftSidebarOpen(false);
                        setActiveTab('design');
                    }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        isRightSidebarOpen && activeTab === 'design' ? 'text-primary bg-primary/10 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <Palette className="w-4 h-4 mb-0.5" />
                    <span>Themes</span>
                </button>
                <button
                    onClick={() => {
                        setIsRightSidebarOpen(true);
                        setIsLeftSidebarOpen(false);
                        setActiveTab('assets');
                    }}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        isRightSidebarOpen && activeTab === 'assets' ? 'text-primary bg-primary/10 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <ImageIcon className="w-4 h-4 mb-0.5" />
                    <span>Assets</span>
                </button>
            </nav>

            {/* Icon Picker Modal */}
            <IconPickerModal
                isOpen={!!iconPickerTarget}
                onClose={() => setIconPickerTarget(null)}
                onSelectIcon={handleApplyIcon}
                onRemoveIcon={handleRemoveIcon}
                currentSvg={iconPickerTarget?.currentSvg}
                title={iconPickerTarget ? `Choose ${iconPickerTarget.label}` : 'Choose an Icon'}
                description="Select from 100+ curated icons or paste custom SVG code"
                allowPosition={iconPickerTarget?.allowPosition}
                initialPosition={iconPickerTarget?.currentPosition || 'left'}
                allowContainerStyle={iconPickerTarget?.allowContainerStyle}
                initialContainerStyle={iconPickerTarget?.currentContainerStyle || 'badge-soft'}
                themeColors={currentColors}
            />

            {/* Asset Picker Modal */}
            {assetPickerModal?.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900/90">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-100">
                                        Select Image Asset
                                    </h3>
                                    <p className="text-[11px] text-zinc-400">
                                        Applying to {assetPickerModal.targetType === 'image' ? 'Section Image' : 'Card Image'} • Max 10MB per image
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        targetDirectUploadRef.current = {
                                            type: assetPickerModal.targetType,
                                            index: assetPickerModal.targetIndex
                                        };
                                        directUploadFileInputRef.current?.click();
                                    }}
                                    className="py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>Upload New</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAssetPickerModal(null)}
                                    className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-3 border-b border-zinc-800 shrink-0 bg-zinc-950/40">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    value={assetSearchQuery}
                                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                                    placeholder="Search assets by name or tag..."
                                    className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* Modal Body: Assets Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {filteredAssets.length === 0 ? (
                                <div className="py-16 text-center text-zinc-500 space-y-3">
                                    <FileImage className="w-12 h-12 mx-auto text-zinc-600" />
                                    <p className="text-xs text-zinc-300 font-medium">
                                        {assetSearchQuery ? 'No matching assets found' : 'No assets uploaded yet'}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                                        Click "Upload New" above to upload an image from your computer directly to Cloudflare R2.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                                    {filteredAssets.map((asset) => {
                                        const assetUrl = resolveAssetUrl(asset);
                                        return (
                                            <div
                                                key={asset.id}
                                                onClick={() => applyAssetToTarget(assetUrl, asset.name)}
                                                className="group relative border border-zinc-800 hover:border-primary/80 rounded-xl overflow-hidden bg-zinc-950/70 cursor-pointer transition-all hover:shadow-xl flex flex-col"
                                            >
                                                <div className="h-32 w-full overflow-hidden bg-zinc-950 relative flex items-center justify-center">
                                                    {assetUrl ? (
                                                        <img
                                                            src={assetUrl}
                                                            alt={asset.name}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const fb = e.currentTarget.parentElement?.querySelector('.fallback-picker-img');
                                                                if (fb) fb.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`fallback-picker-img ${assetUrl ? 'hidden' : ''} flex flex-col items-center justify-center text-zinc-500 p-2 text-center`}>
                                                        <FileImage className="w-8 h-8 mb-1 text-zinc-600" />
                                                        <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">{asset.name}</span>
                                                    </div>
                                                </div>
                                                <div className="p-2.5 bg-zinc-900 border-t border-zinc-800/80 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-200 truncate" title={asset.name}>
                                                            {asset.name}
                                                        </p>
                                                        {asset.description ? (
                                                            <p className="text-[10px] text-zinc-400 truncate mt-0.5" title={asset.description}>
                                                                {asset.description}
                                                            </p>
                                                        ) : (
                                                            <span className="text-[10px] text-zinc-500 italic">No description</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/50 text-[9.5px] text-zinc-500 font-mono">
                                                        <span>R2</span>
                                                        <span className="text-primary font-sans font-semibold group-hover:underline">Select</span>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-lg">
                                                        Select Image
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Cloudflare R2 storage • Max 10MB per file</span>
                            <button
                                type="button"
                                onClick={() => setAssetPickerModal(null)}
                                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-xs font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Replace Asset Modal with Subtle Warning */}
            {assetToReplace && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-zinc-100">Replace Image Asset</h3>
                            </div>
                            <button
                                onClick={() => setAssetToReplace(null)}
                                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Subtle Storage Efficiency Notice */}
                        <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-1 text-xs text-amber-300">
                            <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Storage Efficiency Notice</span>
                            </div>
                            <p className="text-[11px] text-amber-300/90 leading-relaxed">
                                Replacing <strong>"{assetToReplace.name}"</strong> will upload your new image and <span className="underline decoration-amber-400 font-medium">permanently delete the previous file</span> from Cloudflare R2 storage to keep your usage minimal.
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1">
                                Max size: <strong>10MB</strong>. Current references in your website canvas will automatically update.
                            </p>
                        </div>

                        {/* Current Asset Info */}
                        <div className="flex items-center gap-3 p-2 bg-zinc-800/40 rounded-xl border border-zinc-800">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0 flex items-center justify-center">
                                {resolveAssetUrl(assetToReplace) ? (
                                    <img
                                        src={resolveAssetUrl(assetToReplace)}
                                        alt={assetToReplace.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const fb = e.currentTarget.parentElement?.querySelector('.fallback-replace-thumb');
                                            if (fb) fb.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`fallback-replace-thumb ${resolveAssetUrl(assetToReplace) ? 'hidden' : ''} text-zinc-600`}>
                                    <FileImage className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-zinc-200 truncate">{assetToReplace.name}</p>
                                <p className="text-[11px] text-zinc-400 truncate">{assetToReplace.description || 'No description'}</p>
                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Asset ID #{assetToReplace.id}</p>
                            </div>
                        </div>

                        {/* File Selector Dropzone */}
                        <div
                            onClick={() => !isReplacingAsset && replaceAssetFileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                                isReplacingAsset
                                    ? 'border-amber-500/50 bg-amber-950/10 cursor-wait'
                                    : 'border-zinc-700 hover:border-amber-500/70 bg-zinc-950/40 hover:bg-zinc-850/40'
                            }`}
                        >
                            {isReplacingAsset ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                                    <p className="text-xs font-semibold text-zinc-200">Replacing on R2 Storage...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                    <Upload className="w-5 h-5 text-amber-400" />
                                    <p className="text-xs font-semibold text-zinc-200">Choose Replacement Image</p>
                                    <p className="text-[10px] text-zinc-400">Click to browse file (Max 10MB)</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setAssetToReplace(null)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Asset Metadata Modal */}
            {editingAsset && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Edit2 className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold text-zinc-100">Edit Asset Details</h3>
                            </div>
                            <button
                                onClick={() => setEditingAsset(null)}
                                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-2 bg-zinc-800/40 rounded-xl border border-zinc-800">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0 flex items-center justify-center">
                                {resolveAssetUrl(editingAsset) ? (
                                    <img
                                        src={resolveAssetUrl(editingAsset)}
                                        alt={editingAsset.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const fb = e.currentTarget.parentElement?.querySelector('.fallback-edit-thumb');
                                            if (fb) fb.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`fallback-edit-thumb ${resolveAssetUrl(editingAsset) ? 'hidden' : ''} text-zinc-600`}>
                                    <FileImage className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] text-zinc-500 font-mono">Asset ID #{editingAsset.id}</span>
                                <p className="text-xs font-semibold text-zinc-200 truncate">{editingAsset.name}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-zinc-400 block mb-1">Asset Name / Title</label>
                                <input
                                    type="text"
                                    value={editingAsset.name}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-zinc-400 block mb-1">Description / Section Tag</label>
                                <textarea
                                    rows={2}
                                    value={editingAsset.description || ''}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, description: e.target.value })}
                                    placeholder="e.g. Hero background image, Team member portrait, Feature illustration"
                                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-primary resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setEditingAsset(null)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleUpdateAssetMetadata(editingAsset.id, editingAsset.name, editingAsset.description || '')}
                                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden File Inputs for Asset Operations */}
            <input
                ref={newAssetFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleUploadAsset(file);
                        e.target.value = '';
                    }
                }}
            />
            <input
                ref={replaceAssetFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && assetToReplace) {
                        handleReplaceAsset(assetToReplace, file);
                        e.target.value = '';
                    }
                }}
            />
            <input
                ref={directUploadFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleDirectUploadForTarget(file);
                        e.target.value = '';
                    }
                }}
            />
        </div>
    );
}

ProjectEdit.layout = null;
