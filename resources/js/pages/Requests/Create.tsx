import { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    ChevronRight,
    Loader2,
    Upload,
    UploadCloud,
    X,
    Check,
    Globe,
    Calendar,
    Eye,
    Plus,
    ExternalLink,
    Rocket,
    Briefcase,
    Wrench,
    FileText,
    ArrowLeft,
    Sparkles,
    Search,
    Trash2,
    Info,
    FileCheck,
    File,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { store as requestsStore } from '@/routes/requests';

interface Category {
    value: string;
    label: string;
    description: string;
    icon: string;
}

interface Project {
    id: number;
    project_name: string;
    status?: string;
    deployment_status?: string;
    project_url?: string | null;
    created_at?: string;
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComp = (Icons as Record<string, any>)[name];
    if (!IconComp) return null;
    return <IconComp className={className} />;
}

interface UploadedRequestAsset {
    id: string;
    file: File;
    previewUrl?: string;
    purpose: string;
    customPurpose: string;
    description: string;
}

const FILE_PURPOSE_OPTIONS = [
    { value: 'Logo / Graphic', label: 'Logo / Graphic' },
    { value: 'Specification Document', label: 'Specification Document' },
    { value: 'Credentials / Config File', label: 'Credentials / Config File' },
    { value: 'Booking API Credentials', label: 'Booking API Credentials' },
    { value: 'Content / Image', label: 'Content / Image' },
    { value: 'Other', label: 'Other' },
];

export default function RequestsCreate({
    projects = [],
    categories = [],
    initialProjectId,
}: {
    projects: Project[];
    categories: Category[];
    initialProjectId?: string | number;
}) {
    const hasPreselectedProject = Boolean(
        (initialProjectId && projects.some((p) => String(p.id) === String(initialProjectId))) ||
        (projects.length === 1 && projects[0])
    );

    const [currentStep, setCurrentStep] = useState<number>(() => (hasPreselectedProject ? 2 : 1));
    const [uploadedAssets, setUploadedAssets] = useState<UploadedRequestAsset[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [viewingProjectModal, setViewingProjectModal] = useState<Project | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors } = useForm<{
        project_id: string;
        category: string;
        title: string;
        description: string;
        attachment: File | null;
    }>({
        project_id: initialProjectId ? String(initialProjectId) : projects.length === 1 ? String(projects[0].id) : '',
        category: '',
        title: '',
        description: '',
        attachment: null,
    });

    const selectedCategory = categories.find((c) => c.value === data.category) ?? null;
    const selectedProject = projects.find((p) => String(p.id) === data.project_id) ?? null;

    // Filter projects by search query
    const filteredProjects = useMemo(() => {
        if (!projectSearch.trim()) return projects;
        return projects.filter((p) =>
            p.project_name.toLowerCase().includes(projectSearch.toLowerCase())
        );
    }, [projects, projectSearch]);

    const handleFilesSelected = (files: FileList | File[] | null) => {
        if (!files || files.length === 0) return;
        const fileArray = Array.from(files);
        const newAssets: UploadedRequestAsset[] = [];

        fileArray.forEach((file) => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`File "${file.name}" exceeds the 10MB limit.`);
                return;
            }

            const isImg = file.type.startsWith('image/');
            const assetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            newAssets.push({
                id: assetId,
                file,
                previewUrl: isImg ? URL.createObjectURL(file) : undefined,
                purpose: 'Specification Document',
                customPurpose: '',
                description: '',
            });
        });

        if (newAssets.length > 0) {
            setUploadedAssets((prev) => [...prev, ...newAssets]);
        }
    };

    const updateAssetField = (id: string, field: keyof UploadedRequestAsset, value: string) => {
        setUploadedAssets((prev) =>
            prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
        );
    };

    const removeUploadedAsset = (id: string) => {
        setUploadedAssets((prev) => {
            const target = prev.find((a) => a.id === id);
            if (target?.previewUrl) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((a) => a.id !== id);
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isStep1Valid = Boolean(data.project_id);
    const isStep2Valid = Boolean(data.category);
    const isStep3Valid = data.description.length >= 20 && (data.category !== 'other' || data.title.trim() !== '');

    const handleNextStep = () => {
        if (currentStep === 1 && isStep1Valid) {
            setCurrentStep(2);
        } else if (currentStep === 2 && isStep2Valid) {
            setCurrentStep(3);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStep3Valid || processing || isSubmitting) return;

        const payload = new FormData();
        payload.append('project_id', data.project_id);
        payload.append('category', data.category);
        payload.append('title', data.category === 'other' ? data.title : selectedCategory?.label ?? '');
        payload.append('description', data.description);

        if (uploadedAssets.length > 0) {
            payload.append('attachment', uploadedAssets[0].file);
            uploadedAssets.forEach((asset, index) => {
                payload.append(`assets[${index}][file]`, asset.file);
                payload.append(`assets[${index}][purpose]`, asset.purpose);
                payload.append(`assets[${index}][custom_purpose]`, asset.customPurpose);
                payload.append(`assets[${index}][description]`, asset.description);
            });
        }

        router.post(requestsStore(), payload, {
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const wizardSteps = [
        { id: 1, title: 'Select Project', subtitle: 'Choose website project', icon: <Briefcase className="w-5 h-5" /> },
        { id: 2, title: 'Request Type', subtitle: 'Choose feature category', icon: <Wrench className="w-5 h-5" /> },
        { id: 3, title: 'Requirements & File', subtitle: 'Describe request details', icon: <FileText className="w-5 h-5" /> },
    ];

    return (
        <>
            <Head title="Create Service Request | StudioSync" />
            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4 sm:p-6 lg:p-8 bg-background text-foreground">

                <div className="w-full mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                            Create Service Request
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Request email setup, custom domains, booking systems, or custom backend features step-by-step.
                        </p>
                    </div>

                    {/* Step-by-Step Wizard Card */}
                    <div className="overflow-hidden border border-border bg-card rounded-xl shadow-xs">
                        
                        {/* Step Progress Navigation Bar */}
                        <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/30 overflow-x-auto">
                            <nav aria-label="Progress">
                                <ol role="list" className="flex items-center justify-between">
                                    {wizardSteps.map((step, stepIdx) => (
                                        <li
                                            key={step.title}
                                            className={`relative flex items-center ${stepIdx !== wizardSteps.length - 1 ? 'flex-1' : ''}`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (step.id < currentStep) setCurrentStep(step.id);
                                                    if (step.id === 2 && isStep1Valid) setCurrentStep(2);
                                                    if (step.id === 3 && isStep1Valid && isStep2Valid) setCurrentStep(3);
                                                }}
                                                className="flex items-center text-left focus:outline-none"
                                            >
                                                <span
                                                    className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 shadow-xs ${
                                                        currentStep > step.id
                                                            ? 'bg-primary border-primary text-primary-foreground'
                                                            : currentStep === step.id
                                                            ? 'border-primary text-primary bg-background ring-2 ring-primary/20'
                                                            : 'border-muted-foreground/30 text-muted-foreground bg-background'
                                                    }`}
                                                >
                                                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.icon}
                                                </span>
                                                <div className="ml-3 hidden sm:block">
                                                    <span
                                                        className={`text-sm font-semibold block whitespace-nowrap ${
                                                            currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {step.title}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground block">
                                                        {step.subtitle}
                                                    </span>
                                                </div>
                                            </button>
                                            {stepIdx !== wizardSteps.length - 1 && (
                                                <div
                                                    className={`hidden sm:block flex-1 h-[2px] mx-4 md:mx-6 rounded-full transition-colors duration-300 ${
                                                        currentStep > step.id ? 'bg-primary' : 'bg-border/60'
                                                    }`}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </div>

                        {/* Step Form Body */}
                        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">

                            {/* STEP 1: SELECT PROJECT */}
                            {currentStep === 1 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                                    1
                                                </span>
                                                <h2 className="text-xl font-bold text-foreground">Select Project</h2>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Select which website project this service request belongs to:
                                            </p>
                                        </div>

                                        {/* Search Filter for Projects */}
                                        {projects.length > 3 && (
                                            <div className="relative max-w-xs w-full">
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={projectSearch}
                                                    onChange={(e) => setProjectSearch(e.target.value)}
                                                    placeholder="Search projects by name..."
                                                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {errors.project_id && (
                                        <p className="text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                                            {errors.project_id}
                                        </p>
                                    )}

                                    {filteredProjects.length > 0 ? (
                                        <div className="max-h-[380px] sm:max-h-[430px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-border">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-0.5">
                                                {filteredProjects.map((project) => {
                                                    const isSelected = data.project_id === String(project.id);
                                                    const isDeployed = project.deployment_status === 'deployed' || project.status === 'deployed';

                                                    return (
                                                        <div
                                                            key={project.id}
                                                            onClick={() => setData('project_id', String(project.id))}
                                                            className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                                                                isSelected
                                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-sm'
                                                                    : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30 shadow-xs'
                                                            }`}
                                                        >
                                                            <div>
                                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm ${
                                                                            isSelected
                                                                                ? 'bg-primary text-primary-foreground border-primary'
                                                                                : 'bg-muted/80 text-foreground border-border'
                                                                        }`}>
                                                                            {project.project_name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div className="overflow-hidden">
                                                                            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                                                {project.project_name}
                                                                            </h3>
                                                                            {project.created_at && (
                                                                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                                    <Calendar className="w-3 h-3 opacity-70" />
                                                                                    {new Date(project.created_at).toLocaleDateString()}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                                                        isSelected
                                                                            ? 'bg-primary border-primary text-primary-foreground'
                                                                            : 'border-border bg-background'
                                                                    }`}>
                                                                        {isSelected && <Check className="w-3 h-3" />}
                                                                    </div>
                                                                </div>

                                                                <div className="mb-3">
                                                                    {isDeployed ? (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                            Live Production
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                                            {project.status === 'completed' ? 'Draft Ready' : 'Development'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setViewingProjectModal(project);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    View Details
                                                                </button>

                                                                <span className={`font-semibold ${
                                                                    isSelected ? 'text-primary' : 'text-muted-foreground'
                                                                }`}>
                                                                    {isSelected ? 'Selected ✓' : 'Select'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-muted/30 border border-dashed border-border rounded-xl">
                                            <p className="text-base font-semibold text-foreground">
                                                {projectSearch ? 'No Matching Projects' : 'No Projects Found'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                                                {projectSearch
                                                    ? `No projects matched "${projectSearch}". Try clearing the search.`
                                                    : 'You need an existing project before submitting a service request.'}
                                            </p>
                                            {projectSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => setProjectSearch('')}
                                                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                                                >
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: CHOOSE REQUEST TYPE */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                                    2
                                                </span>
                                                <h2 className="text-xl font-bold text-foreground">Choose Request Type</h2>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                What service or feature would you like added to <strong className="text-foreground">{selectedProject?.project_name ?? 'your project'}</strong>?
                                            </p>
                                        </div>

                                        {projects.length > 1 && selectedProject && (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(1)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-auto shrink-0 shadow-xs"
                                                title="Change selected project"
                                            >
                                                <Briefcase className="w-3.5 h-3.5 text-primary" />
                                                <span>Change Project ({selectedProject.project_name})</span>
                                            </button>
                                        )}
                                    </div>

                                    {errors.category && (
                                        <p className="text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                                            {errors.category}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {categories.map((cat) => {
                                            const isCatSelected = data.category === cat.value;

                                            return (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    id={`category-${cat.value}`}
                                                    onClick={() => {
                                                        setData('category', cat.value);
                                                        if (cat.value !== 'other') setData('title', cat.label);
                                                    }}
                                                    className={`flex flex-col items-center text-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                                                        isCatSelected
                                                            ? 'border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/30'
                                                            : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40'
                                                    }`}
                                                >
                                                    <DynamicIcon
                                                        name={cat.icon}
                                                        className={`w-6 h-6 ${isCatSelected ? 'text-primary' : ''}`}
                                                    />
                                                    <span className={`text-xs font-medium leading-snug ${isCatSelected ? 'text-primary font-bold' : ''}`}>
                                                        {cat.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {selectedCategory && (
                                        <div className="text-xs text-muted-foreground bg-muted/40 border border-border/60 rounded-xl p-4 space-y-1">
                                            <div className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                {selectedCategory.label}
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed">{selectedCategory.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: REQUIREMENTS & ATTACHMENT */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                                3
                                            </span>
                                            <h2 className="text-xl font-bold text-foreground">Describe Requirements & Attach File</h2>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Provide all details for your <strong>{selectedCategory?.label ?? 'service'}</strong> request for project <strong>{selectedProject?.project_name}</strong>.
                                        </p>
                                    </div>

                                    {/* Title input if category is 'other' */}
                                    {data.category === 'other' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                                Request Title
                                            </label>
                                            <input
                                                id="title-input"
                                                type="text"
                                                maxLength={100}
                                                placeholder="e.g. Add dark mode toggle to header"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                                                    errors.title ? 'border-red-500' : 'border-border'
                                                }`}
                                            />
                                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                            Detailed Instructions & Context
                                        </label>
                                        <textarea
                                            id="description-input"
                                            rows={5}
                                            placeholder="Describe what you need in detail. E.g. 'When visitors click Contact Us, route messages directly to info@mybusiness.com. Also include custom auto-reply...'"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground ${
                                                errors.description ? 'border-red-500' : 'border-border'
                                            }`}
                                        />
                                        <div className="flex justify-between items-center text-xs">
                                            {errors.description ? (
                                                <p className="text-red-500">{errors.description}</p>
                                            ) : (
                                                <p className="text-muted-foreground">Minimum 20 characters required.</p>
                                            )}
                                            <span className={data.description.length < 20 ? 'text-muted-foreground' : 'text-emerald-500 font-medium'}>
                                                {data.description.length} / 5000
                                            </span>
                                        </div>
                                    </div>

                                    {/* Project-Assets Style Multi-File Attachment */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <span>Request Assets & Documents</span>
                                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                                                        {uploadedAssets.length} {uploadedAssets.length === 1 ? 'file' : 'files'}
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Upload logos, specification PDFs, credentials, or graphic assets for this request.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dropzone */}
                                        <label
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setDragOver(false);
                                                handleFilesSelected(e.dataTransfer.files);
                                            }}
                                            className={`cursor-pointer border-2 border-dashed transition-all rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 block ${
                                                dragOver
                                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                    : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5'
                                            }`}
                                        >
                                            <input
                                                type="file"
                                                multiple
                                                accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.zip,.doc,.docx,.txt"
                                                className="hidden"
                                                onChange={(e) => {
                                                    handleFilesSelected(e.target.files);
                                                    e.target.value = '';
                                                }}
                                            />
                                            <div className="p-3 bg-primary/10 text-primary rounded-full">
                                                <UploadCloud className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    Click to select files or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PNG, JPG, WEBP, SVG, PDF, ZIP, DOC • <strong className="text-foreground">Max 10MB per file</strong>
                                                </p>
                                            </div>
                                        </label>

                                        {/* Uploaded Assets List */}
                                        {uploadedAssets.length > 0 && (
                                            <div className="space-y-3 pt-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Attached Request Files ({uploadedAssets.length})
                                                </h4>

                                                <div className="grid grid-cols-1 gap-3">
                                                    {uploadedAssets.map((asset) => (
                                                        <div
                                                            key={asset.id}
                                                            className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-card border border-border items-start sm:items-center shadow-xs"
                                                        >
                                                            {/* File Preview Thumbnail / Icon */}
                                                            <div className="relative shrink-0 flex items-center justify-center">
                                                                {asset.previewUrl ? (
                                                                    <img
                                                                        src={asset.previewUrl}
                                                                        alt={asset.file.name}
                                                                        className="w-16 h-16 object-cover rounded-lg border border-border bg-background"
                                                                    />
                                                                ) : (
                                                                    <div className="w-16 h-16 rounded-lg border border-border bg-muted/40 flex flex-col items-center justify-center text-muted-foreground">
                                                                        <File className="w-6 h-6 text-primary mb-0.5" />
                                                                        <span className="text-[10px] font-mono font-bold uppercase truncate max-w-[50px]">
                                                                            {asset.file.name.split('.').pop()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* File Details & Metadata Controls */}
                                                            <div className="flex-1 w-full space-y-2.5">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="min-w-0">
                                                                        <span className="text-sm font-semibold text-foreground truncate block max-w-xs sm:max-w-md" title={asset.file.name}>
                                                                            {asset.file.name}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground font-mono">
                                                                            {formatFileSize(asset.file.size)}
                                                                        </span>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeUploadedAsset(asset.id)}
                                                                        className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                                                                        title="Remove file"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                                                            What is this file for?
                                                                        </label>
                                                                        <select
                                                                            value={asset.purpose}
                                                                            onChange={(e) => updateAssetField(asset.id, 'purpose', e.target.value)}
                                                                            className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                                        >
                                                                            {FILE_PURPOSE_OPTIONS.map((opt) => (
                                                                                <option key={opt.value} value={opt.value}>
                                                                                    {opt.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>

                                                                    {asset.purpose === 'Other' ? (
                                                                        <div>
                                                                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                                                                Specify Purpose
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={asset.customPurpose}
                                                                                onChange={(e) => updateAssetField(asset.id, 'customPurpose', e.target.value)}
                                                                                placeholder="e.g. Domain Certificate, API Key JSON"
                                                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                                                                Instructions / Description
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={asset.description}
                                                                                onChange={(e) => updateAssetField(asset.id, 'description', e.target.value)}
                                                                                placeholder="Notes for admin (e.g. Use for header logo)"
                                                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* WIZARD NAVIGATION FOOTER BUTTONS */}
                            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="inline-flex items-center justify-center rounded-lg text-xs font-semibold h-10 px-4 py-2 border border-border bg-background text-foreground hover:bg-muted transition-colors"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                        Back
                                    </button>
                                ) : <div />}

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
                                        className="inline-flex items-center justify-center rounded-lg text-xs font-semibold transition-all bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-6 py-2 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        Next Step
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                ) : (
                                    <button
                                        id="submit-request-btn"
                                        type="submit"
                                        disabled={processing || isSubmitting || !isStep3Valid}
                                        className="inline-flex items-center justify-center rounded-lg text-xs font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-6 py-2 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {(processing || isSubmitting) ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting Request...</>
                                        ) : (
                                            <><Check className="w-4 h-4 mr-1.5" />Submit Service Request</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* PROJECT DETAILS MODAL */}
            {viewingProjectModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-base">
                                    {viewingProjectModal.project_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">
                                        {viewingProjectModal.project_name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Project Details Summary</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingProjectModal(null)}
                                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 pt-2 text-sm">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
                                <span className="text-muted-foreground">Deployment Status:</span>
                                {viewingProjectModal.deployment_status === 'deployed' || viewingProjectModal.status === 'deployed' ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        <Rocket className="w-3.5 h-3.5" />
                                        Live Production
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                        Draft / Development
                                    </span>
                                )}
                            </div>

                            {viewingProjectModal.project_url && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
                                    <span className="text-muted-foreground">Live URL:</span>
                                    <a
                                        href={viewingProjectModal.project_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono text-primary hover:underline flex items-center gap-1 truncate max-w-[220px]"
                                    >
                                        <Globe className="w-3.5 h-3.5 shrink-0" />
                                        {viewingProjectModal.project_url}
                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                </div>
                            )}

                            {viewingProjectModal.created_at && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
                                    <span className="text-muted-foreground">Created Date:</span>
                                    <span className="text-xs font-medium text-foreground">
                                        {new Date(viewingProjectModal.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setViewingProjectModal(null)}
                                className="px-4 py-2 text-xs font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setData('project_id', String(viewingProjectModal.id));
                                    setViewingProjectModal(null);
                                }}
                                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Select This Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

RequestsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Requests', href: '/requests' },
        { title: 'New Request', href: '/requests/create' },
    ],
};
