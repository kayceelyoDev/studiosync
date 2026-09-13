import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Check, Loader2, FolderOpen, FolderPlus, FilePlus, Trash2, User, Plus, LayoutTemplate, Palette, Edit3, ExternalLink, UploadCloud, Image as ImageIcon, AlertCircle, Info } from 'lucide-react';

interface UploadedSectionAsset {
    id: string;
    section: string;
    file: File;
    previewUrl: string;
    purpose: string;
    customPurpose: string;
    description: string;
}

interface SectionGuide {
    title: string;
    description: string;
    recommendedPurposes: { label: string; hint: string }[];
}

const SECTION_ASSET_GUIDES: Record<string, SectionGuide> = {
    'Brand & Navigation (Logo)': {
        title: 'Brand & Navigation (Logo / Icon)',
        description: 'Upload your primary logo, site icon, or brand mark for the navigation bar and footer.',
        recommendedPurposes: [
            { label: 'Primary Logo (Color / Standard)', hint: 'Used on the main navigation bar' },
            { label: 'White / Inverse Logo', hint: 'Used on dark navigation bars or dark mode' },
            { label: 'Favicon / Icon Mark', hint: 'Used for compact mobile header or badge' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
    'Hero Section': {
        title: 'Hero Section',
        description: 'Upload high-impact imagery for the top banner, split hero panel, or showcase.',
        recommendedPurposes: [
            { label: 'Hero Banner / Background', hint: 'Cinematic or wide background visual' },
            { label: 'Featured Subject / Product', hint: 'Main subject or hero focal photo' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
    'About Me': {
        title: 'About Me / Profile',
        description: 'Upload personal portraits, founder headshots, or workspace/studio pictures.',
        recommendedPurposes: [
            { label: 'Founder / Profile Headshot', hint: 'Portrait of founder, creator, or professional' },
            { label: 'Studio / Workspace Picture', hint: 'Photo of your studio, workspace, or behind-the-scenes' },
            { label: 'Signature / Badge', hint: 'Handwritten signature or certification stamp' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
    'Portfolio Gallery': {
        title: 'Portfolio Gallery',
        description: 'Upload sample works, case studies, or photography pieces.',
        recommendedPurposes: [
            { label: 'Project / Portfolio Item', hint: 'Main sample work or case study visual' },
            { label: 'Gallery Photography', hint: 'Photo series or artistic artwork' },
            { label: 'Process / Before & After', hint: 'Visual showing your method or result' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
    'Services': {
        title: 'Services',
        description: 'Upload imagery or icons for each service package you offer.',
        recommendedPurposes: [
            { label: 'Service Feature Image', hint: 'Card visual for a specific service' },
            { label: 'Service Icon / Illustration', hint: 'Graphic or icon representing an offering' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
    'Testimonials': {
        title: 'Testimonials',
        description: 'Upload customer or client portraits for social proof.',
        recommendedPurposes: [
            { label: 'Client Avatar / Headshot', hint: 'Portrait of reviewer or testimonial author' },
            { label: 'Client Company Logo', hint: 'Logo of company that gave praise' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
    'Pricing': {
        title: 'Pricing',
        description: 'Upload plan badge or pricing tier highlight graphics.',
        recommendedPurposes: [
            { label: 'Tier Badge / Highlight Graphic', hint: 'Visual banner or badge for popular tier' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
    'Contact Form': {
        title: 'Contact Form',
        description: 'Upload office photo, studio building, or friendly banner.',
        recommendedPurposes: [
            { label: 'Office / Studio Location', hint: 'Exterior or interior photo of your base' },
            { label: 'Contact Visual Banner', hint: 'Friendly portrait or visual beside the form' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
    'Blog/News': {
        title: 'Blog / News',
        description: 'Upload featured article thumbnails or author photos.',
        recommendedPurposes: [
            { label: 'Article Featured Thumbnail', hint: 'Cover image for blog post' },
            { label: 'Author Avatar', hint: 'Writer or contributor headshot' },
            { label: 'Other', hint: 'Specify your own purpose' },
        ]
    },
};

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
    const [uploadedAssets, setUploadedAssets] = useState<UploadedSectionAsset[]>([]);

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

    // Asset Management
    const handleFilesSelected = (section: string, files: FileList | null) => {
        if (!files || files.length === 0) return;

        const maxSizeBytes = 10 * 1024 * 1024; // 10MB per file
        const maxTotalBytes = 40 * 1024 * 1024; // 40MB max total across all uploads
        const newAssets: UploadedSectionAsset[] = [];
        const guide = SECTION_ASSET_GUIDES[section];
        const defaultPurpose = guide?.recommendedPurposes[0]?.label || 'Image';

        const currentTotalBytes = uploadedAssets.reduce((sum, a) => sum + a.file.size, 0);
        let accumulatedBytes = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > maxSizeBytes) {
                toast.error(`"${file.name}" exceeds the 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose an image under 10MB.`);
                continue;
            }

            if (currentTotalBytes + accumulatedBytes + file.size > maxTotalBytes) {
                toast.error(`Cannot add "${file.name}": Total uploads across all sections would exceed 40MB.`);
                continue;
            }

            accumulatedBytes += file.size;

            const previewUrl = URL.createObjectURL(file);
            newAssets.push({
                id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                section,
                file,
                previewUrl,
                purpose: defaultPurpose,
                customPurpose: '',
                description: ''
            });
        }

        if (newAssets.length > 0) {
            setUploadedAssets(prev => [...prev, ...newAssets]);
            toast.success(`Added ${newAssets.length} image${newAssets.length > 1 ? 's' : ''} to ${section}`);
        }
    };

    const updateAssetField = (id: string, field: 'purpose' | 'customPurpose' | 'description', value: string) => {
        setUploadedAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const removeUploadedAsset = (id: string) => {
        setUploadedAssets(prev => {
            const item = prev.find(a => a.id === id);
            if (item?.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
            return prev.filter(a => a.id !== id);
        });
    };

    const skipAssets = () => {
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

        const formDataPayload = new FormData();
        if (workspace_id) {
            formDataPayload.append('workspace_id', String(workspace_id));
        }
        formDataPayload.append('project_name', formData.project_name || 'Untitled Project');

        compiledPreferences.forEach((pref, index) => {
            formDataPayload.append(`preferences[${index}]`, pref);
        });

        uploadedAssets.forEach((asset, index) => {
            formDataPayload.append(`assets[${index}][file]`, asset.file);
            formDataPayload.append(`assets[${index}][section]`, asset.section);
            formDataPayload.append(`assets[${index}][purpose]`, asset.purpose);
            if (asset.customPurpose) {
                formDataPayload.append(`assets[${index}][custom_purpose]`, asset.customPurpose);
            }
            if (asset.description) {
                formDataPayload.append(`assets[${index}][description]`, asset.description);
            }
        });

        try {
            const response = await fetch('/generate-prompt', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: formDataPayload
            });

            const contentType = response.headers.get('content-type') || '';
            let responseData: any = null;

            if (contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const rawText = await response.text();
                console.error("Non-JSON server response:", rawText);
                if (response.status === 413 || rawText.includes('POST Content-Length') || rawText.includes('Content Too Large')) {
                    toast.error("The uploaded assets exceed the server payload limit. Please try fewer or smaller images.");
                } else {
                    toast.error(`Server error (${response.status}): Failed to generate website.`);
                }
                setIsSubmitting(false);
                return;
            }
            
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

    const totalAssets = uploadedAssets.length;

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
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">Project Assets <span className="text-muted-foreground font-normal text-lg">(Optional)</span></h2>
                                            <p className="mt-1 text-muted-foreground">Upload real images from your PC for each selected section. The AI will place them directly using your descriptions.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={skipAssets}
                                            className="self-start sm:self-auto px-4 py-2 text-sm font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors"
                                        >
                                            Skip this step
                                        </button>
                                    </div>

                                    {/* 10MB Limit Awareness Notice */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm text-foreground">
                                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-primary">Upload guidance & limits: </span>
                                            <span>Each image must be under <strong className="text-foreground font-bold">10MB</strong> (supports PNG, JPG, WEBP, SVG). Images will be stored securely on Cloudflare R2 and linked to your website sections.</span>
                                        </div>
                                    </div>

                                    {/* Sections Asset Upload Blocks */}
                                    <div className="space-y-8">
                                        {[
                                            'Brand & Navigation (Logo)',
                                            ...(formData.content_strategy.length > 0 ? formData.content_strategy : ['Hero Section', 'About Me', 'Portfolio Gallery'])
                                        ].map((sectionName) => {
                                            const guide = SECTION_ASSET_GUIDES[sectionName] || {
                                                title: sectionName,
                                                description: `Upload imagery or graphic assets for the ${sectionName}.`,
                                                recommendedPurposes: [
                                                    { label: 'Feature Image', hint: 'Main visual for section' },
                                                    { label: 'Secondary Graphic', hint: 'Secondary illustration or photo' },
                                                    { label: 'Other', hint: 'Custom purpose' }
                                                ]
                                            };
                                            const sectionAssets = uploadedAssets.filter(a => a.section === sectionName);

                                            return (
                                                <div key={sectionName} className="border border-border bg-card rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-lg font-bold text-foreground">{guide.title}</h3>
                                                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                                    {sectionAssets.length} {sectionAssets.length === 1 ? 'image' : 'images'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{guide.description}</p>
                                                        </div>
                                                    </div>

                                                    {/* Dropzone */}
                                                    <label className="cursor-pointer border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center gap-2 group block">
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                handleFilesSelected(sectionName, e.target.files);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                        <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                                                            <UploadCloud className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                Click to select images from your PC or drag and drop
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                PNG, JPG, WEBP, SVG • <strong className="text-foreground">Max 10MB per image</strong>
                                                            </p>
                                                        </div>
                                                    </label>

                                                    {/* Uploaded Images List for this section */}
                                                    {sectionAssets.length > 0 && (
                                                        <div className="space-y-3 pt-2">
                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attached Images ({sectionAssets.length})</h4>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {sectionAssets.map((asset) => (
                                                                    <div key={asset.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-muted/30 border border-border items-start sm:items-center">
                                                                        <div className="relative shrink-0">
                                                                            <img
                                                                                src={asset.previewUrl}
                                                                                alt={asset.file.name}
                                                                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-border bg-background"
                                                                            />
                                                                            <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                                                                                {(asset.file.size / (1024 * 1024)).toFixed(1)} MB
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex-1 w-full space-y-2.5">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-md" title={asset.file.name}>
                                                                                    {asset.file.name}
                                                                                </span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeUploadedAsset(asset.id)}
                                                                                    className="text-muted-foreground hover:text-red-500 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                                                                                    title="Remove image"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </div>

                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                <div>
                                                                                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                                                        What is this image for?
                                                                                    </label>
                                                                                    <select
                                                                                        value={asset.purpose}
                                                                                        onChange={(e) => updateAssetField(asset.id, 'purpose', e.target.value)}
                                                                                        className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground focus:ring-1 focus:ring-ring"
                                                                                    >
                                                                                        {guide.recommendedPurposes.map(p => (
                                                                                            <option key={p.label} value={p.label}>{p.label}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>

                                                                                {asset.purpose === 'Other' ? (
                                                                                    <div>
                                                                                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                                                            Specify what it's for:
                                                                                        </label>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={asset.customPurpose}
                                                                                            onChange={(e) => updateAssetField(asset.id, 'customPurpose', e.target.value)}
                                                                                            placeholder="e.g. Award badge, signature, office exterior"
                                                                                            className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground focus:ring-1 focus:ring-ring"
                                                                                        />
                                                                                    </div>
                                                                                ) : (
                                                                                    <div>
                                                                                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                                                            Additional AI Context (Optional):
                                                                                        </label>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={asset.description}
                                                                                            onChange={(e) => updateAssetField(asset.id, 'description', e.target.value)}
                                                                                            placeholder="e.g. Founder portrait in studio setting"
                                                                                            className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground focus:ring-1 focus:ring-ring"
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {asset.purpose === 'Other' && (
                                                                                <div>
                                                                                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                                                                                        Additional AI Context (Optional):
                                                                                    </label>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={asset.description}
                                                                                        onChange={(e) => updateAssetField(asset.id, 'description', e.target.value)}
                                                                                        placeholder="e.g. Placement instructions or specific details"
                                                                                        className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground focus:ring-1 focus:ring-ring"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
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
                                                        <p className="text-3xl font-bold text-foreground">{uploadedAssets.length}</p>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Uploaded Images</p>
                                                    </div>
                                                </div>

                                                {uploadedAssets.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Breakdown</p>
                                                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                            {uploadedAssets.map(asset => (
                                                                <div key={asset.id} className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                                                                    <span className="truncate max-w-[140px] font-medium text-foreground">{asset.file.name}</span>
                                                                    <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded text-[11px] shrink-0">{asset.section}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
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
                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setCurrentStep(1);
                                        setGeneratedHtml('');
                                        setProjectId(null);
                                        setFormData({
                                            project_name: '', description: '', 
                                            content_strategy: [], layout_style: '', color_palette: '', 
                                            typography: '', contact_email: '', contact_phone: '',
                                            contact_address: '', social_links: [], about_bio: '',
                                            extra_details: ''
                                        });
                                        setUploadedAssets([]);
                                    }}
                                    className="px-3.5 py-2 text-sm font-medium transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                >
                                    Create Another
                                </button>
                                <button 
                                    onClick={() => {
                                        const blob = new Blob([generatedHtml], { type: 'text/html' });
                                        const url = URL.createObjectURL(blob);
                                        window.open(url, '_blank');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                >
                                    <ExternalLink className="w-4 h-4" /> Open in New Tab
                                </button>
                                <button
                                    onClick={() => {
                                        if (projectId) {
                                            router.visit(`/projects/${projectId}/edit`);
                                        } else {
                                            toast.error("Project ID is missing. Please refresh and try again.");
                                        }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all rounded-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                >
                                    <Edit3 className="w-4 h-4" /> Edit Page
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
