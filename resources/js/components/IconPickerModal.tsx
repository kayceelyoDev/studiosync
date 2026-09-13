import React, { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    ICON_CATALOG,
    ICON_CATEGORIES,
    IconItem,
    IconCategory,
    generateIconSvg,
    extractSvgPaths,
    matchSvgToCatalog,
    ICON_SIZES
} from '@/lib/iconCatalog';
import {
    Search,
    X,
    Check,
    Trash2,
    Code,
    Sparkles,
    SlidersHorizontal,
    Layers,
    ArrowLeftRight
} from 'lucide-react';

export interface IconPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectIcon: (svgString: string, meta: {
        iconId: string;
        iconName: string;
        size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        color: string;
        position?: 'left' | 'right';
        containerStyle?: 'none' | 'badge-soft' | 'badge-outline' | 'circle';
    }) => void;
    onRemoveIcon?: () => void;
    currentSvg?: string;
    title?: string;
    description?: string;
    allowPosition?: boolean;
    initialPosition?: 'left' | 'right';
    allowContainerStyle?: boolean;
    initialContainerStyle?: 'none' | 'badge-soft' | 'badge-outline' | 'circle';
    themeColors?: {
        primary?: string;
        secondary?: string;
        text?: string;
    };
}

export function IconPickerModal({
    isOpen,
    onClose,
    onSelectIcon,
    onRemoveIcon,
    currentSvg,
    title = 'Choose an Icon',
    description = 'Select an icon from the library or paste custom SVG code',
    allowPosition = false,
    initialPosition = 'left',
    allowContainerStyle = false,
    initialContainerStyle = 'none',
    themeColors
}: IconPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<IconCategory>('all');
    const [mode, setMode] = useState<'library' | 'custom'>('library');
    const [customSvgInput, setCustomSvgInput] = useState('');
    
    // Customization options (default empty string so we don't falsely claim arrow-right)
    const [selectedIconId, setSelectedIconId] = useState<string>('');
    const [size, setSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
    const [color, setColor] = useState<string>('currentColor');
    const [position, setPosition] = useState<'left' | 'right'>(initialPosition);
    const [containerStyle, setContainerStyle] = useState<'none' | 'badge-soft' | 'badge-outline' | 'circle'>(initialContainerStyle);

    // Initialize selection when opening or currentSvg changes
    useEffect(() => {
        if (!isOpen) return;
        setPosition(initialPosition);
        setContainerStyle(initialContainerStyle);

        if (currentSvg && currentSvg.trim()) {
            // High precision geometric matching against icon catalog
            const matchedId = matchSvgToCatalog(currentSvg);

            if (matchedId) {
                setSelectedIconId(matchedId);
                setMode('library');
            } else {
                setSelectedIconId('');
                setCustomSvgInput(currentSvg);
                setMode('library');
            }

            // Detect current size from classes if present
            if (currentSvg.includes('w-3.5') || currentSvg.includes('h-3.5')) setSize('xs');
            else if (currentSvg.includes('w-4') || currentSvg.includes('h-4')) setSize('sm');
            else if (currentSvg.includes('w-6') || currentSvg.includes('h-6')) setSize('lg');
            else if (currentSvg.includes('w-8') || currentSvg.includes('h-8')) setSize('xl');
            else setSize('md');

            // Detect color
            const styleColorMatch = currentSvg.match(/style="[^"]*color:\s*([^;"]+)/i);
            if (styleColorMatch) {
                setColor(styleColorMatch[1].trim());
            } else {
                setColor('currentColor');
            }
        } else {
            setSelectedIconId('arrow-right');
            setMode('library');
        }
    }, [isOpen, currentSvg, initialPosition, initialContainerStyle]);

    // Current matched icon from catalog if currentSvg is provided
    const currentMatchedIcon = useMemo(() => {
        if (!currentSvg || !currentSvg.trim()) return null;
        const matchedId = matchSvgToCatalog(currentSvg);
        return matchedId ? ICON_CATALOG.find(i => i.id === matchedId) || null : null;
    }, [currentSvg]);

    // Filter icons by category and search
    const filteredIcons = useMemo(() => {
        let list = ICON_CATALOG;
        if (selectedCategory !== 'all') {
            list = list.filter(i => i.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(i => 
                i.name.toLowerCase().includes(q) ||
                i.id.toLowerCase().includes(q) ||
                i.tags.some(t => t.toLowerCase().includes(q))
            );
        }
        return list;
    }, [selectedCategory, searchQuery]);

    // Current selected icon object
    const selectedIcon = useMemo(() => {
        if (!selectedIconId) return null;
        return ICON_CATALOG.find(i => i.id === selectedIconId) || null;
    }, [selectedIconId]);

    const handleApply = () => {
        let finalSvg = '';
        let finalId = '';
        let finalName = '';

        if (mode === 'custom') {
            finalSvg = customSvgInput.trim();
            finalId = 'custom-svg';
            finalName = 'Custom SVG';
        } else if (selectedIcon) {
            finalSvg = generateIconSvg(selectedIcon.paths, {
                size,
                color
            });
            finalId = selectedIcon.id;
            finalName = selectedIcon.name;
        } else if (currentSvg) {
            finalSvg = currentSvg.trim();
            finalId = currentMatchedIcon ? currentMatchedIcon.id : 'current-svg';
            finalName = currentMatchedIcon ? currentMatchedIcon.name : 'Current Icon';
        } else {
            return;
        }

        onSelectIcon(finalSvg, {
            iconId: finalId,
            iconName: finalName,
            size,
            color,
            position: allowPosition ? position : undefined,
            containerStyle: allowContainerStyle ? containerStyle : undefined
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-zinc-800/80 bg-zinc-900/60">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span>{title}</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                                {description}
                            </DialogDescription>
                        </div>
                        {/* Mode Switcher */}
                        <div className="flex items-center bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700/60 text-xs">
                            <button
                                type="button"
                                onClick={() => setMode('library')}
                                className={`px-3 py-1 rounded-md font-medium transition-all ${
                                    mode === 'library'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                Icon Library ({ICON_CATALOG.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('custom')}
                                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                                    mode === 'custom'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                <Code className="w-3.5 h-3.5" />
                                <span>Custom SVG</span>
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Current Icon Status Banner */}
                {currentSvg && currentSvg.trim() && (
                    <div className="px-6 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div
                                className="w-7 h-7 rounded-md bg-zinc-950 border border-zinc-800 flex items-center justify-center text-primary shrink-0 overflow-hidden [&>svg]:w-4 [&>svg]:h-4"
                                dangerouslySetInnerHTML={{ __html: currentSvg }}
                            />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-zinc-200">Current Icon:</span>
                                    {currentMatchedIcon ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                                            <Check className="w-3 h-3" />
                                            <span>{currentMatchedIcon.name}</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-full">
                                            <Sparkles className="w-3 h-3" />
                                            <span>Template / Custom SVG</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedIcon && selectedIcon.id !== currentMatchedIcon?.id && (
                            <div className="hidden sm:flex items-center gap-1.5 text-[11px] bg-primary/15 text-primary border border-primary/30 px-2.5 py-1 rounded-md font-medium shrink-0">
                                <span>Change to:</span>
                                <span className="font-bold underline">{selectedIcon.name}</span>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'library' ? (
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                        {/* Search & Category Filter Bar */}
                        <div className="p-4 border-b border-zinc-800/70 bg-zinc-900/30 space-y-3 shrink-0">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search 100+ icons (e.g. arrow, check, star, phone, camera)..."
                                    className="w-full pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                                {ICON_CATEGORIES.map((cat) => {
                                    const count = cat.id === 'all'
                                        ? ICON_CATALOG.length
                                        : ICON_CATALOG.filter(i => i.category === cat.id).length;
                                    const isActive = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'bg-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                                            }`}
                                        >
                                            {cat.label} <span className="opacity-60 text-[10px]">({count})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Icon Grid */}
                        <div className="flex-1 overflow-y-auto p-4 min-h-[220px] max-h-[340px]">
                            {filteredIcons.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {filteredIcons.map((icon) => {
                                        const isSelected = selectedIconId === icon.id;
                                        return (
                                            <button
                                                key={icon.id}
                                                type="button"
                                                onClick={() => setSelectedIconId(icon.id)}
                                                className={`group flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-150 cursor-pointer text-center relative ${
                                                    isSelected
                                                        ? 'bg-primary/20 border-primary text-primary-foreground ring-2 ring-primary/40 shadow-sm'
                                                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
                                                }`}
                                                title={icon.name}
                                            >
                                                {/* Icon SVG */}
                                                <svg
                                                    className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                                                        isSelected ? 'text-primary' : 'text-zinc-200'
                                                    }`}
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    dangerouslySetInnerHTML={{ __html: icon.paths }}
                                                />
                                                <span className="text-[10px] mt-1.5 truncate max-w-full font-medium text-zinc-400 group-hover:text-zinc-200">
                                                    {icon.name}
                                                </span>
                                                {isSelected && (
                                                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-500">
                                    <Search className="w-8 h-8 mb-2 opacity-30" />
                                    <p className="text-xs font-medium">No icons match "{searchQuery}"</p>
                                    <button
                                        type="button"
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                        className="text-[11px] text-primary hover:underline mt-1.5 cursor-pointer"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Custom SVG Code Editor Tab */
                    <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5 text-primary" />
                                <span>Paste SVG Markup</span>
                            </label>
                            <p className="text-[11px] text-zinc-400">
                                Paste raw SVG code from Figma, FontAwesome, or other design tools.
                            </p>
                            <textarea
                                rows={6}
                                value={customSvgInput}
                                onChange={(e) => setCustomSvgInput(e.target.value)}
                                placeholder='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> ... </svg>'
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                            />
                        </div>

                        {/* Live Preview of custom SVG */}
                        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                                {customSvgInput.trim() ? (
                                    <div
                                        className="w-7 h-7 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                                        dangerouslySetInnerHTML={{ __html: customSvgInput }}
                                    />
                                ) : (
                                    <span className="text-[10px] text-zinc-600">No SVG</span>
                                )}
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-zinc-200">Live Preview</h4>
                                <p className="text-[11px] text-zinc-500">
                                    {customSvgInput.trim() ? 'SVG parsed successfully' : 'Paste SVG code above to see preview'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Customization Controls Panel */}
                <div className="p-4 bg-zinc-900/90 border-t border-zinc-800/80 space-y-3 shrink-0">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Size Picker */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                                <SlidersHorizontal className="w-3 h-3" /> Size:
                            </span>
                            <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
                                {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSize(s)}
                                        className={`px-2 py-1 rounded font-semibold uppercase transition-all cursor-pointer ${
                                            size === s
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-zinc-400">Color:</span>
                            <div className="flex items-center gap-1.5">
                                {[
                                    { label: 'Inherit', val: 'currentColor' },
                                    { label: 'Primary', val: themeColors?.primary || '#3b82f6' },
                                    { label: 'Emerald', val: '#10b981' },
                                    { label: 'Amber', val: '#f59e0b' },
                                    { label: 'Rose', val: '#f43f5e' },
                                    { label: 'Purple', val: '#8b5cf6' },
                                ].map((c) => (
                                    <button
                                        key={c.val}
                                        type="button"
                                        onClick={() => setColor(c.val)}
                                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                                            color === c.val
                                                ? 'ring-2 ring-primary ring-offset-1 ring-offset-zinc-950 scale-110'
                                                : 'border-zinc-700 hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: c.val === 'currentColor' ? '#71717a' : c.val }}
                                        title={c.label}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={color === 'currentColor' ? '#ffffff' : color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer ml-1"
                                    title="Custom Color"
                                />
                            </div>
                        </div>

                        {/* Position (if applicable for buttons / badges) */}
                        {allowPosition && (
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                                    <ArrowLeftRight className="w-3 h-3" /> Position:
                                </span>
                                <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
                                    <button
                                        type="button"
                                        onClick={() => setPosition('left')}
                                        className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                                            position === 'left'
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        Left (Start)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPosition('right')}
                                        className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                                            position === 'right'
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        Right (End)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Card Container Style (if applicable for cards) */}
                        {allowContainerStyle && (
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> Style:
                                </span>
                                <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
                                    {[
                                        { id: 'none', label: 'Plain' },
                                        { id: 'badge-soft', label: 'Soft Box' },
                                        { id: 'circle', label: 'Circle' }
                                    ].map((st) => (
                                        <button
                                            key={st.id}
                                            type="button"
                                            onClick={() => setContainerStyle(st.id as any)}
                                            className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                                                containerStyle === st.id
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between">
                    <div>
                        {onRemoveIcon && currentSvg && (
                            <button
                                type="button"
                                onClick={() => {
                                    onRemoveIcon();
                                    onClose();
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Icon</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 border border-zinc-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply Icon</span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
