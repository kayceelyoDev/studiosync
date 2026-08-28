import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Check, Loader2, FolderOpen, FolderPlus, FilePlus, Trash2, User, Plus, LayoutTemplate, Palette } from 'lucide-react';

interface Asset {
    id: string;
    name: string;
    description: string;
    type: string;
}

interface Folder {
    id: string;
    name: string;
    assets: Asset[];
}

const LayoutWireframe = ({ layout }: { layout: string }) => {
    switch (layout) {
        case 'Minimalist & Clean':
            return (
                <div className="w-full h-full flex flex-col gap-2 p-3 bg-background border border-border rounded-lg shadow-sm">
                    <div className="w-full h-4 bg-muted rounded-sm"></div>
                    <div className="w-1/2 h-8 bg-muted rounded-md mx-auto mt-2"></div>
                    <div className="w-3/4 h-2 bg-muted rounded-sm mx-auto mt-1"></div>
                </div>
            );
        case 'Grid/Masonry Focus':
            return (
                <div className="w-full h-full grid grid-cols-2 gap-2 p-2 bg-background border border-border rounded-lg shadow-sm">
                    <div className="w-full h-full bg-muted rounded-md"></div>
                    <div className="w-full h-full bg-muted rounded-md row-span-2"></div>
                    <div className="w-full h-full bg-muted rounded-md"></div>
                </div>
            );
        case 'Split Screen (Text/Image)':
            return (
                <div className="w-full h-full flex p-0 bg-background border border-border rounded-lg shadow-sm overflow-hidden">
                    <div className="flex-1 flex flex-col justify-center p-2 gap-2">
                        <div className="w-full h-4 bg-muted rounded-sm"></div>
                        <div className="w-3/4 h-2 bg-muted rounded-sm"></div>
                    </div>
                    <div className="flex-1 bg-primary/20"></div>
                </div>
            );
        case 'Full-bleed Cinematic':
            return (
                <div className="w-full h-full relative bg-primary/10 border border-border rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5"></div>
                    <div className="w-1/2 h-8 bg-background/80 rounded-md backdrop-blur-sm z-10 border border-border/50"></div>
                </div>
            );
        case 'Bento Box UI':
            return (
                <div className="w-full h-full p-2 bg-background border border-border rounded-lg shadow-sm grid grid-cols-3 grid-rows-3 gap-1.5">
                    <div className="col-span-2 row-span-2 bg-muted rounded-md"></div>
                    <div className="bg-primary/20 rounded-md"></div>
                    <div className="bg-muted rounded-md"></div>
                    <div className="col-span-3 bg-muted rounded-md"></div>
                </div>
            );
        case 'Creative Agency (Bold Typography)':
            return (
                <div className="w-full h-full flex flex-col bg-background border border-border rounded-lg shadow-sm overflow-hidden p-2">
                    <div className="w-full h-3 border-b border-border mb-2"></div>
                    <div className="flex-1 flex flex-col justify-center gap-2 px-2">
                        <div className="w-full h-6 bg-foreground rounded-md"></div>
                        <div className="w-3/4 h-6 bg-foreground rounded-md"></div>
                        <div className="w-1/2 h-2 bg-muted rounded-full mt-2"></div>
                    </div>
                </div>
            );
        case 'Soft & Friendly':
            return (
                <div className="w-full h-full flex flex-col p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl shadow-sm gap-2 items-center justify-center">
                    <div className="w-10 h-10 bg-rose-200 dark:bg-rose-800/50 rounded-full"></div>
                    <div className="w-3/4 h-3 bg-rose-200 dark:bg-rose-800/50 rounded-full"></div>
                </div>
            );
        case 'Asymmetrical Editorial':
            return (
                <div className="w-full h-full flex p-2 bg-background border border-border rounded-lg shadow-sm relative">
                    <div className="w-1/2 h-3/4 bg-muted rounded-md mt-auto"></div>
                    <div className="w-2/3 h-1/2 bg-primary/10 rounded-md absolute top-2 right-2 border border-primary/20 backdrop-blur-sm"></div>
                </div>
            );
        case 'Hero-focused Single Page':
            return (
                <div className="w-full h-full flex flex-col bg-background border border-border rounded-lg shadow-sm overflow-hidden">
                    <div className="w-full h-2/3 bg-muted flex items-center justify-center flex-col gap-1">
                        <div className="w-1/2 h-3 bg-background rounded-sm shadow-sm"></div>
                        <div className="w-1/4 h-2 bg-background/70 rounded-sm"></div>
                    </div>
                    <div className="w-full h-1/3 p-2 grid grid-cols-3 gap-1">
                        <div className="bg-muted rounded-sm"></div>
                        <div className="bg-muted rounded-sm"></div>
                        <div className="bg-muted rounded-sm"></div>
                    </div>
                </div>
            );
        case 'Sidebar Navigation (Dashboard)':
            return (
                <div className="w-full h-full flex bg-background border border-border rounded-lg shadow-sm overflow-hidden">
                    <div className="w-1/4 h-full bg-muted border-r border-border flex flex-col gap-1 p-1">
                        <div className="w-full h-2 bg-background rounded-sm mb-2"></div>
                        <div className="w-3/4 h-1.5 bg-background/50 rounded-sm"></div>
                        <div className="w-3/4 h-1.5 bg-background/50 rounded-sm"></div>
                    </div>
                    <div className="flex-1 p-2 flex flex-col gap-2">
                        <div className="w-full h-4 bg-muted rounded-sm"></div>
                        <div className="w-full flex-1 bg-muted/50 rounded-md"></div>
                    </div>
                </div>
            );
        case 'Horizontal Scroll (Gallery)':
            return (
                <div className="w-full h-full flex items-center gap-2 p-2 bg-background border border-border rounded-lg shadow-sm overflow-hidden">
                    <div className="min-w-[70%] h-full bg-muted rounded-md border border-border/50"></div>
                    <div className="min-w-[70%] h-full bg-muted rounded-md border border-border/50"></div>
                </div>
            );
        case 'Neumorphism (Soft UI)':
            return (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg">
                    <div className="w-3/4 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.1)]"></div>
                    <div className="w-1/2 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-[2px_2px_5px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.1)]"></div>
                </div>
            );
        default:
            return (
                <div className="w-full h-full flex flex-col gap-1.5 p-2 bg-muted/50 rounded-lg border border-border/50">
                    <div className="w-full h-4 bg-muted-foreground/20 rounded-sm"></div>
                    <div className="flex gap-1.5 flex-1">
                        <div className="flex-1 bg-muted-foreground/10 rounded-sm"></div>
                        <div className="flex-[2] bg-muted-foreground/10 rounded-sm"></div>
                    </div>
                </div>
            );
    }
};

const ColorPalettePreview = ({ palette }: { palette: string }) => {
    switch (palette) {
        case 'High-End Editorial (Beige & Charcoal)':
            return ( <><div className="flex-1 bg-[#1A1A1A]"></div><div className="flex-1 bg-[#F5F5DC]"></div><div className="flex-1 bg-[#8B8B8B]"></div></> );
        case 'Dark Mode Minimal (Black & White)':
            return ( <><div className="flex-1 bg-black"></div><div className="flex-1 bg-neutral-800"></div><div className="flex-1 bg-white"></div></> );
        case 'Vibrant & Playful (Pastels)':
            return ( <><div className="flex-1 bg-pink-300"></div><div className="flex-1 bg-purple-300"></div><div className="flex-1 bg-yellow-300"></div></> );
        case 'Neon Cyberpunk (Dark with glowing accents)':
            return ( <><div className="flex-1 bg-slate-900"></div><div className="flex-1 bg-fuchsia-500"></div><div className="flex-1 bg-cyan-400"></div></> );
        case 'Earthy & Organic (Greens, Browns, Creams)':
            return ( <><div className="flex-1 bg-[#2E3C2B]"></div><div className="flex-1 bg-[#8B5A2B]"></div><div className="flex-1 bg-[#FDF5E6]"></div></> );
        case 'Classic Corporate (Blues, Grays)':
            return ( <><div className="flex-1 bg-blue-800"></div><div className="flex-1 bg-blue-500"></div><div className="flex-1 bg-slate-200"></div></> );
        case 'Ocean Depth (Navy & Aqua)':
            return ( <><div className="flex-1 bg-blue-950"></div><div className="flex-1 bg-cyan-600"></div><div className="flex-1 bg-cyan-200"></div></> );
        case 'Sunset Glow (Orange & Purple)':
            return ( <><div className="flex-1 bg-purple-900"></div><div className="flex-1 bg-orange-500"></div><div className="flex-1 bg-yellow-400"></div></> );
        case 'Monochrome Gray (Sleek)':
            return ( <><div className="flex-1 bg-slate-900"></div><div className="flex-1 bg-slate-500"></div><div className="flex-1 bg-slate-100"></div></> );
        default:
            return ( <><div className="flex-1 bg-slate-800"></div><div className="flex-1 bg-slate-400"></div><div className="flex-1 bg-slate-200"></div></> );
    }
};

const TypographyPreview = ({ typography }: { typography: string }) => {
    let fontClass = 'font-sans';
    if (typography.includes('Serif') || typography.includes('Vintage')) fontClass = 'font-serif';
    if (typography.includes('Monospaced') || typography.includes('Retro')) fontClass = 'font-mono';
    
    return (
        <div className={`w-full mb-2 opacity-80 group-hover:opacity-100 transition-opacity text-left ${fontClass}`}>
            <span className="block text-2xl font-bold text-foreground mb-1 leading-none">Aa</span>
            <span className="block text-xs text-muted-foreground">The quick brown fox</span>
        </div>
    );
};

export default function GenerateAiPromptIndex({ workspace_id, workspace_name }: { workspace_id?: number, workspace_name?: string }) {
    const user = usePage().props.auth.user as { id: number };
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Polling and Generated State
    const [pollStatus, setPollStatus] = useState('');
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [projectId, setProjectId] = useState<number | null>(null);

    // Form State (Preferences)
    const [formData, setFormData] = useState({
        project_name: '',
        description: '',
        content_strategy: [] as string[],
        layout_style: '',
        color_palette: '',
        typography: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        social_links: [] as { platform: string, url: string }[],
        about_bio: '',
        extra_details: ''
    });

    // Form State (Assets)
    const [folders, setFolders] = useState<Folder[]>([]);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            social_links: [...prev.social_links, { platform: 'Instagram', url: '' }]
        }));
    };

    const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
        setFormData(prev => {
            const newLinks = [...prev.social_links];
            newLinks[index][field] = value;
            return { ...prev, social_links: newLinks };
        });
    };

    const removeSocialLink = (index: number) => {
        setFormData(prev => {
            const newLinks = [...prev.social_links];
            newLinks.splice(index, 1);
            return { ...prev, social_links: newLinks };
        });
    };

    const isStepValid = () => {
        if (currentStep === 1) {
            return formData.project_name.trim() !== '' && formData.content_strategy.length > 0;
        }
        if (currentStep === 2) {
            return formData.layout_style !== '';
        }
        if (currentStep === 3) {
            return formData.color_palette !== '' && formData.typography !== '';
        }
        return true;
    };

    const handleContinue = () => {
        if (currentStep === 1 && formData.project_name.trim() === '') {
            toast.error("Please enter a project name.");
            return;
        }
        if (currentStep === 1 && formData.content_strategy.length === 0) {
            toast.error("Please select at least one section for your content strategy.");
            return;
        }
        if (currentStep === 2 && formData.layout_style === '') {
            toast.error("Please select a layout style.");
            return;
        }
        if (currentStep === 3 && (formData.color_palette === '' || formData.typography === '')) {
            toast.error("Please select both a color palette and typography style.");
            return;
        }
        setCurrentStep(prev => Math.min(6, prev + 1));
    };

    const handleCheckboxToggle = (field: 'content_strategy', value: string) => {
        setFormData((prev) => {
            const currentArray = prev[field];
            if (currentArray.includes(value)) {
                return { ...prev, [field]: currentArray.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...currentArray, value] };
            }
        });
    };

    // Asset Folders Management
    const addFolder = () => {
        setFolders(prev => [
            ...prev,
            { id: Date.now().toString(), name: 'New Folder', assets: [] }
        ]);
    };

    const updateFolder = (id: string, name: string) => {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
    };

    const removeFolder = (id: string) => {
        setFolders(prev => prev.filter(f => f.id !== id));
    };

    const addAsset = (folderId: string) => {
        setFolders(prev => prev.map(f => {
            if (f.id === folderId) {
                return {
                    ...f,
                    assets: [...f.assets, { id: Date.now().toString(), name: '', description: '', type: 'image' }]
                };
            }
            return f;
        }));
    };

    const updateAsset = (folderId: string, assetId: string, field: keyof Asset, value: string) => {
        setFolders(prev => prev.map(f => {
            if (f.id === folderId) {
                return {
                    ...f,
                    assets: f.assets.map(a => a.id === assetId ? { ...a, [field]: value } : a)
                };
            }
            return f;
        }));
    };

    const removeAsset = (folderId: string, assetId: string) => {
        setFolders(prev => prev.map(f => {
            if (f.id === folderId) {
                return { ...f, assets: f.assets.filter(a => a.id !== assetId) };
            }
            return f;
        }));
    };

    const skipAssets = () => {
        setFolders([]);
        setCurrentStep(6);
    };

    const submitForm = async () => {
        setIsSubmitting(true);
        setPollStatus('Initializing...');
        
        const compiledPreferences = [
            `Description: ${formData.description}`,
            `Content: ${formData.content_strategy.join(', ')}`,
            `Layout: ${formData.layout_style}`,
            `Color Palette: ${formData.color_palette}`,
            `Typography: ${formData.typography}`,
            formData.contact_email ? `Contact Email: ${formData.contact_email}` : '',
            formData.contact_phone ? `Contact Phone: ${formData.contact_phone}` : '',
            formData.contact_address ? `Contact Address: ${formData.contact_address}` : '',
            formData.social_links.length > 0 ? `Social Links: ${formData.social_links.map(l => `${l.platform} (${l.url})`).join(', ')}` : '',
            formData.about_bio ? `About Bio: ${formData.about_bio}` : '',
            `Additional Details: ${formData.extra_details}`
        ].filter(p => p.trim() !== '');

        const payload = {
            workspace_id: workspace_id,
            project_name: formData.project_name || 'Untitled Project',
            preferences: compiledPreferences
            // assets data can be sent here if backend supported it, omitted as per instructions
        };

        try {
            const response = await fetch('/generate-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            
            if (response.ok && responseData.success) {
                setProjectId(responseData.project_id);
                pollProjectStatus(responseData.project_id);
            } else if (!response.ok) {
                if (responseData.errors) {
                    const errorMessages = Object.values(responseData.errors).flat().join('\n');
                    toast.error(`Validation Error:\n${errorMessages}`);
                } else if (responseData.message) {
                    toast.error(`Error: ${responseData.message}`);
                } else {
                    toast.error("An unexpected error occurred.");
                }
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("A network error occurred while submitting your preferences.");
            setIsSubmitting(false);
        }
    };

    const pollProjectStatus = async (id: number) => {
        try {
            const res = await fetch(`/projects/${id}/status`);
            const data = await res.json();

            if (data.status === 'pending') {
                setPollStatus('Drafting AI Prompt...');
            } else if (data.status === 'generating_html') {
                setPollStatus('Generating HTML & Tailwind Code...');
            } else if (data.status === 'reviewing_html') {
                setPollStatus('AI QA Engineer reviewing code for flaws...');
            } else if (data.status === 'completed') {
                setPollStatus('Website Generated Successfully!');
                setGeneratedHtml(data.html_content);
                setIsSubmitting(false);
                setIsSuccess(true);
                return;
            } else if (data.status === 'failed') {
                toast.error("Generation failed. Please try again or adjust your prompt.");
                setIsSubmitting(false);
                return;
            }

            // Continue polling every 3 seconds
            setTimeout(() => pollProjectStatus(id), 3000);
        } catch (error) {
            console.error("Polling failed:", error);
            setTimeout(() => pollProjectStatus(id), 5000);
        }
    };

    // UI Variants
    const steps = [
        { id: 1, title: 'Basics & Content', icon: <Sparkles className="w-5 h-5" /> },
        { id: 2, title: 'Layout', icon: <LayoutTemplate className="w-5 h-5" /> },
        { id: 3, title: 'Aesthetics', icon: <Palette className="w-5 h-5" /> },
        { id: 4, title: 'About & Contact', icon: <User className="w-5 h-5" /> },
        { id: 5, title: 'Assets', icon: <FolderOpen className="w-5 h-5" /> },
        { id: 6, title: 'Review', icon: <CheckCircle2 className="w-5 h-5" /> }
    ];

    const contentOptions = ['Hero Section', 'About Me', 'Portfolio Gallery', 'Services', 'Testimonials', 'Pricing', 'Contact Form', 'Blog/News'];
    const layoutOptions = [
        'Minimalist & Clean', 'Grid/Masonry Focus', 'Split Screen (Text/Image)', 
        'Full-bleed Cinematic', 'Bento Box UI', 'Creative Agency (Bold Typography)', 
        'Hero-focused Single Page', 'Horizontal Scroll (Gallery)', 'Neumorphism (Soft UI)'
    ];
    const colorOptions = [
        'High-End Editorial (Beige & Charcoal)', 'Dark Mode Minimal (Black & White)', 
        'Vibrant & Playful (Pastels)', 'Neon Cyberpunk (Dark with glowing accents)', 
        'Earthy & Organic (Greens, Browns, Creams)', 'Classic Corporate (Blues, Grays)',
        'Ocean Depth (Navy & Aqua)', 'Sunset Glow (Orange & Purple)', 'Monochrome Gray (Sleek)'
    ];
    const typographyOptions = [
        'Elegant Serif (Classic, Luxury)', 'Modern Sans-Serif (Clean, Tech)', 
        'Monospaced (Developer, Retro)', 'Bold & Brutalist (Large, High-impact)', 
        'Playful Rounded (Friendly)', 'Handwritten Script (Artistic)', 
        'Display Serif (Fashion)', 'Geometric Sans (Architecture)',
        'Classic Vintage (Retro, Nostalgic)'
    ];

    const totalAssets = folders.reduce((sum, f) => sum + f.assets.length, 0);

    return (
        <div className="flex flex-col flex-1 h-full gap-4 overflow-x-hidden rounded-xl text-foreground bg-background">
            <Head title="New Project" />

            <div className="relative z-10 w-full max-w-7xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Design Your Vision
                    </h1>
                    {workspace_name && (
                        <p className="mt-2 font-medium text-primary bg-primary/10 inline-block px-3 py-1 rounded-full text-sm">
                            Workspace: {workspace_name}
                        </p>
                    )}
                    <p className="max-w-2xl mx-auto mt-3 text-base text-muted-foreground">
                        Tell us exactly what you want. Our AI will translate your preferences into a stunning, production-ready portfolio.
                    </p>
                </div>

                {/* Wizard Container */}
                {!isSuccess && !isSubmitting ? (
                    <div className="overflow-hidden border bg-card text-card-foreground border-border rounded-xl shadow-sm">
                        
                        {/* Step Progress Bar */}
                        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border bg-muted/30 overflow-x-auto">
                            <nav aria-label="Progress">
                                <ol role="list" className="flex items-center justify-between">
                                    {steps.map((step, stepIdx) => (
                                        <li key={step.title} className={`relative flex items-center ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                                            <div className="flex items-center">
                                                <span className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 shadow-sm ${
                                                    currentStep > step.id ? 'bg-primary border-primary text-primary-foreground' : 
                                                    currentStep === step.id ? 'border-primary text-primary bg-background' : 
                                                    'border-muted-foreground/30 text-muted-foreground bg-background'
                                                }`}>
                                                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.icon}
                                                </span>
                                                <span className={`ml-4 text-sm font-semibold hidden sm:block whitespace-nowrap ${
                                                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                                                }`}>
                                                    {step.title}
                                                </span>
                                            </div>
                                            {stepIdx !== steps.length - 1 && (
                                                <div className={`hidden sm:block flex-1 h-[2px] mx-4 md:mx-6 rounded-full transition-colors duration-300 ${
                                                    currentStep > step.id ? 'bg-primary' : 'bg-border/60'
                                                }`} />
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </div>

                        {/* Step Content */}
                        <div className="p-4 sm:p-10 min-h-[350px]">
                            
                            {/* STEP 1: PREFERENCES */}
                            {currentStep === 1 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                    
                                    {/* Basics */}
                                    <div className="space-y-6">
                                        <div className="pb-4 border-b border-border/50">
                                            <h3 className="text-xl font-bold text-foreground">Essentials</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Start with the core identity of your website.</p>
                                        </div>
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground">Project Name</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-4 py-3 bg-background border rounded-lg shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    placeholder="e.g. Elena Rodriguez Portfolio"
                                                    value={formData.project_name}
                                                    onChange={(e) => handleInputChange('project_name', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground">Detailed Description <span className="font-normal text-muted-foreground">(Optional)</span></label>
                                                <textarea 
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-background border rounded-lg shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                                    placeholder="Describe the target audience, overall vibe, and specific needs..."
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-6 pt-4">
                                        <div className="pb-4 border-b border-border/50">
                                            <h3 className="text-xl font-bold text-foreground">Content Strategy</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Select the sections you want to include in your portfolio.</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            {contentOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleCheckboxToggle('content_strategy', option)}
                                                    className={`px-4 py-3 text-sm font-medium text-left border rounded-xl transition-all duration-200 flex justify-between items-center cursor-pointer group hover:-translate-y-0.5 hover:shadow-sm ${
                                                        formData.content_strategy.includes(option) 
                                                        ? 'bg-primary/5 border-primary text-foreground shadow-sm ring-1 ring-primary/20' 
                                                        : 'bg-background border-input text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                                    }`}
                                                >
                                                    {option}
                                                    <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${
                                                        formData.content_strategy.includes(option) ? 'bg-primary text-primary-foreground' : 'border border-muted-foreground/30'
                                                    }`}>
                                                        {formData.content_strategy.includes(option) && <Check className="w-3 h-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>


                                </div>
                            )}

                            {/* STEP 2: LAYOUT */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold text-foreground">Select a Layout Structure</h2>
                                        <p className="mt-1 text-muted-foreground">Choose the primary visual architecture for your website.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {layoutOptions.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => handleInputChange('layout_style', option)}
                                                className={`flex flex-col items-center p-4 text-center border rounded-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-md ${
                                                    formData.layout_style === option 
                                                    ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                                                    : 'bg-background border-border hover:border-primary/40'
                                                }`}
                                            >
                                                {/* Mini Wireframe Preview */}
                                                <div className="w-full h-32 mb-4 transition-opacity opacity-80 group-hover:opacity-100 overflow-hidden rounded-lg">
                                                    <LayoutWireframe layout={option} />
                                                </div>
                                                <span className={`text-sm font-semibold ${formData.layout_style === option ? 'text-primary' : 'text-foreground'}`}>
                                                    {option}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: AESTHETICS */}
                            {currentStep === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Define Your Aesthetics</h2>
                                        <p className="mt-1 text-muted-foreground">Select a color palette and typography that match your brand vibe.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Color Palette Vibe</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {colorOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleInputChange('color_palette', option)}
                                                    className={`flex flex-col p-4 border rounded-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-md ${
                                                        formData.color_palette === option 
                                                        ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                                                        : 'bg-background border-border hover:border-primary/40'
                                                    }`}
                                                >
                                                    {/* Color preview blocks */}
                                                    <div className="flex w-full h-8 mb-3 rounded-md overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity border border-border/20">
                                                        <ColorPalettePreview palette={option} />
                                                    </div>
                                                    <span className={`text-sm font-semibold text-left ${formData.color_palette === option ? 'text-primary' : 'text-foreground'}`}>
                                                        {option}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Typography Preference</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {typographyOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleInputChange('typography', option)}
                                                    className={`flex flex-col p-4 border rounded-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-md ${
                                                        formData.typography === option 
                                                        ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                                                        : 'bg-background border-border hover:border-primary/40'
                                                    }`}
                                                >
                                                    {/* Typography preview */}
                                                    <TypographyPreview typography={option} />
                                                    <span className={`text-sm font-semibold text-left ${formData.typography === option ? 'text-primary' : 'text-foreground'}`}>
                                                        {option}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: ABOUT & CONTACT */}
                            {currentStep === 4 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">About & Contact Details <span className="text-muted-foreground font-normal text-lg">(Optional)</span></h2>
                                        <p className="mt-1 text-muted-foreground">Add your contact information, bio, and social links for the AI to include in your generated site.</p>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">Short Bio / About You</label>
                                            <textarea 
                                                rows={4}
                                                className="w-full px-4 py-3 bg-background border rounded-lg shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                                placeholder="I'm a photographer based in NY with 10 years of experience..."
                                                value={formData.about_bio}
                                                onChange={(e) => handleInputChange('about_bio', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground">Contact Email</label>
                                                <input 
                                                    type="email" 
                                                    className="w-full px-4 py-3 bg-background border rounded-lg shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    placeholder="hello@example.com"
                                                    value={formData.contact_email}
                                                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground">Contact Phone</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-4 py-3 bg-background border rounded-lg shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    placeholder="+1 (555) 000-0000"
                                                    value={formData.contact_phone}
                                                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">Location / Address</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-4 py-3 bg-background border rounded-lg shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                placeholder="New York, NY"
                                                value={formData.contact_address}
                                                onChange={(e) => handleInputChange('contact_address', e.target.value)}
                                            />
                                        </div>
                                        
                                        {/* Dynamic Social Links */}
                                        <div className="pt-4 border-t border-border/50 space-y-4">
                                            <h3 className="text-sm font-semibold text-foreground">Social Links</h3>
                                            {formData.social_links.map((link, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row gap-3">
                                                    <select
                                                        value={link.platform}
                                                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                                                        className="w-full sm:w-48 px-4 py-3 transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                                    >
                                                        <option value="Instagram">Instagram</option>
                                                        <option value="Twitter/X">Twitter/X</option>
                                                        <option value="LinkedIn">LinkedIn</option>
                                                        <option value="Facebook">Facebook</option>
                                                        <option value="YouTube">YouTube</option>
                                                        <option value="TikTok">TikTok</option>
                                                        <option value="GitHub">GitHub</option>
                                                        <option value="Website">Website</option>
                                                    </select>
                                                    <input 
                                                        type="text" 
                                                        value={link.url}
                                                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                                                        placeholder="URL or handle (e.g. @elena)"
                                                        className="flex-1 px-4 py-3 transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeSocialLink(index)}
                                                        className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addSocialLink}
                                                className="inline-flex items-center mt-2 px-4 py-2 border-2 border-dashed border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/50 transition-colors"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Social Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: ASSETS */}
                            {currentStep === 5 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">Project Assets <span className="text-muted-foreground font-normal text-lg">(Optional)</span></h2>
                                            <p className="mt-1 text-muted-foreground">Add folders and assets (images, fonts, stylesheets) for AI context.</p>
                                        </div>
                                        <button 
                                            onClick={skipAssets}
                                            className="px-4 py-2 text-sm font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors"
                                        >
                                            Skip this step
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {folders.map((folder, index) => (
                                            <div key={folder.id} className="border border-border bg-muted/20 rounded-xl p-5 shadow-sm">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                        <FolderOpen className="w-5 h-5" />
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        value={folder.name}
                                                        onChange={(e) => updateFolder(folder.id, e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                                                        placeholder="Folder Name (e.g. Hero Images)"
                                                    />
                                                    <button 
                                                        onClick={() => removeFolder(folder.id)}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                        title="Remove Folder"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="space-y-3 pl-11">
                                                    {folder.assets.map(asset => (
                                                        <div key={asset.id} className="flex flex-col sm:flex-row gap-3 bg-background border border-border p-3 rounded-lg items-start sm:items-center">
                                                            <input 
                                                                type="text"
                                                                value={asset.name}
                                                                onChange={(e) => updateAsset(folder.id, asset.id, 'name', e.target.value)}
                                                                placeholder="Asset Name (e.g. logo.svg)"
                                                                className="flex-1 w-full sm:w-auto px-3 py-2 bg-transparent border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                            />
                                                            <input 
                                                                type="text"
                                                                value={asset.description}
                                                                onChange={(e) => updateAsset(folder.id, asset.id, 'description', e.target.value)}
                                                                placeholder="Description / Usage"
                                                                className="flex-[1.5] w-full sm:w-auto px-3 py-2 bg-transparent border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                            />
                                                            <select
                                                                value={asset.type}
                                                                onChange={(e) => updateAsset(folder.id, asset.id, 'type', e.target.value)}
                                                                className="w-full sm:w-32 px-3 py-2 bg-transparent border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                                            >
                                                                <option value="image">Image</option>
                                                                <option value="css">CSS</option>
                                                                <option value="js">JS</option>
                                                                <option value="font">Font</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                            <button 
                                                                onClick={() => removeAsset(folder.id, asset.id)}
                                                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => addAsset(folder.id)}
                                                        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-2"
                                                    >
                                                        <FilePlus className="w-4 h-4 mr-1.5" />
                                                        Add Asset
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={addFolder}
                                            className="w-full py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2"
                                        >
                                            <FolderPlus className="w-6 h-6" />
                                            <span className="font-medium">Add Folder</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 6: REVIEW */}
                            {currentStep === 6 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Review & Generate</h2>
                                        <p className="mt-1 text-muted-foreground">Double check your project configuration before handing it to the AI.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="p-6 border rounded-xl bg-card border-border shadow-sm">
                                                <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 flex items-center">
                                                    <Sparkles className="w-5 h-5 mr-2 text-primary" /> Preferences
                                                </h3>
                                                <dl className="space-y-4 text-sm">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <dt className="text-muted-foreground">Workspace</dt>
                                                        <dd className="col-span-2 font-medium text-foreground">{workspace_name || 'Not specified'}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <dt className="text-muted-foreground">Project Name</dt>
                                                        <dd className="col-span-2 font-medium text-foreground">{formData.project_name}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <dt className="text-muted-foreground">Layout</dt>
                                                        <dd className="col-span-2 font-medium text-foreground">{formData.layout_style}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <dt className="text-muted-foreground">Colors</dt>
                                                        <dd className="col-span-2 font-medium text-foreground">{formData.color_palette}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <dt className="text-muted-foreground">Typography</dt>
                                                        <dd className="col-span-2 font-medium text-foreground">{formData.typography}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <dt className="text-muted-foreground">Sections</dt>
                                                        <dd className="col-span-2 font-medium text-foreground">{formData.content_strategy.join(', ')}</dd>
                                                    </div>
                                                    {formData.extra_details && (
                                                        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
                                                            <dt className="text-muted-foreground">Extra Notes</dt>
                                                            <dd className="col-span-2 font-medium text-foreground">{formData.extra_details}</dd>
                                                        </div>
                                                    )}
                                                </dl>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-6 border rounded-xl bg-card border-border shadow-sm">
                                                <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 flex items-center">
                                                    <FolderOpen className="w-5 h-5 mr-2 text-primary" /> Assets
                                                </h3>
                                                <div className="flex items-center gap-4 justify-center py-4">
                                                    <div className="text-center">
                                                        <p className="text-3xl font-bold text-foreground">{folders.length}</p>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Folders</p>
                                                    </div>
                                                    <div className="h-10 w-px bg-border"></div>
                                                    <div className="text-center">
                                                        <p className="text-3xl font-bold text-foreground">{totalAssets}</p>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Assets</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-t bg-muted/20 border-border/50">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1 || isSubmitting}
                                className="flex items-center px-5 py-2.5 text-sm font-medium transition-colors bg-transparent border-none text-muted-foreground hover:text-foreground hover:bg-accent rounded-full cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </button>
                            
                            {currentStep < 6 ? (
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    className="flex items-center px-7 py-2.5 text-sm font-semibold transition-all rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                                >
                                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isStepValid()) {
                                            toast.error("Please fill out all required fields.");
                                            return;
                                        }
                                        submitForm();
                                    }}
                                    disabled={isSubmitting}
                                    className="flex items-center px-7 py-2.5 text-sm font-semibold transition-all rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {pollStatus}</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" /> Generate Project</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ) : isSubmitting ? (
                    // Loading State
                    <div className="max-w-xl p-12 mx-auto text-center border shadow-sm bg-card text-card-foreground border-border rounded-xl animate-in fade-in zoom-in-95 duration-700">
                        <div className="flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-primary/10 text-primary mb-8 relative">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping opacity-75"></div>
                            <Loader2 className="w-12 h-12 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">AI is Crafting Your Vision</h2>
                        <p className="mt-4 text-muted-foreground animate-pulse">
                            {pollStatus}
                        </p>
                        <div className="mt-8 flex justify-center">
                            <div className="w-full max-w-xs bg-muted rounded-full h-2 overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-full bg-primary rounded-full animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Success State with Preview
                    <div className="w-full mx-auto border shadow-sm bg-card text-card-foreground border-border rounded-xl animate-in fade-in zoom-in-95 duration-700 flex flex-col h-[80vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-500">
                                    <Check className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Website Generated</h2>
                                    <p className="text-xs text-muted-foreground">Previewing your personalized design</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setCurrentStep(1);
                                        setGeneratedHtml('');
                                        setProjectId(null);
                                        setFormData({
                                            project_name: '', description: '', 
                                            content_strategy: [], layout_style: '', color_palette: '', 
                                            typography: '', extra_details: ''
                                        });
                                        setFolders([]);
                                    }}
                                    className="px-4 py-2 text-sm font-medium transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    Create Another
                                </button>
                                <button 
                                    onClick={() => {
                                        const blob = new Blob([generatedHtml], { type: 'text/html' });
                                        const url = URL.createObjectURL(blob);
                                        window.open(url, '_blank');
                                    }}
                                    className="px-4 py-2 text-sm font-semibold transition-all rounded-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Open in New Tab
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full bg-white relative rounded-b-xl overflow-hidden">
                            <iframe 
                                srcDoc={generatedHtml} 
                                className="w-full h-full border-none absolute inset-0"
                                sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                                title="Generated Website Preview"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

GenerateAiPromptIndex.layout = (page: any) => {
    return {
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'New Project', href: '/generate-prompt' }
        ]
    };
};
