import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Layout, Palette, MonitorPlay, Check, Loader2 } from 'lucide-react';

export default function GenerateAiPromptIndex() {
    const user = usePage().props.auth.user;
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        project_name: '',
        // Preferences
        description: '',
        content_strategy: [],
        layout_style: '',
        color_palette: '',
        typography: '',
        extra_details: ''
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const isStepValid = () => {
        if (currentStep === 1) {
            return formData.project_name.trim() !== '' && formData.description.trim() !== '';
        }
        if (currentStep === 2) {
            return formData.content_strategy.length > 0 && formData.layout_style !== '';
        }
        if (currentStep === 3) {
            return formData.color_palette !== '' && formData.typography !== '';
        }
        return true;
    };

    const handleCheckboxToggle = (field, value) => {
        setFormData((prev) => {
            const currentArray = prev[field];
            if (currentArray.includes(value)) {
                return { ...prev, [field]: currentArray.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...currentArray, value] };
            }
        });
    };

    const submitForm = async () => {
        setIsSubmitting(true);
        
        // Compile all preferences into the expected string array
        const compiledPreferences = [
            `Description: ${formData.description}`,
            `Content: ${formData.content_strategy.join(', ')}`,
            `Layout: ${formData.layout_style}`,
            `Color Palette: ${formData.color_palette}`,
            `Typography: ${formData.typography}`,
            `Additional Details: ${formData.extra_details}`
        ].filter(p => p.trim() !== '');

        const payload = {
            user_id: user.id,
            project_name: formData.project_name || 'Untitled Project',
            status: 'pending',
            preferences: compiledPreferences
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
                setIsSuccess(true);
            } else if (!response.ok) {
                if (responseData.errors) {
                    const errorMessages = Object.values(responseData.errors).flat().join('\n');
                    alert(`Validation Error:\n${errorMessages}`);
                } else if (responseData.message) {
                    alert(`Error: ${responseData.message}`);
                } else {
                    alert("An unexpected error occurred.");
                }
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("A network error occurred while submitting your preferences.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // UI Variants
    const steps = [
        { id: 1, title: 'Project Info', icon: <MonitorPlay className="w-5 h-5" /> },
        { id: 2, title: 'Content & Layout', icon: <Layout className="w-5 h-5" /> },
        { id: 3, title: 'Aesthetics', icon: <Palette className="w-5 h-5" /> },
        { id: 4, title: 'Final Review', icon: <Sparkles className="w-5 h-5" /> }
    ];

    const contentOptions = ['Hero Section', 'About Me', 'Portfolio Gallery', 'Services', 'Testimonials', 'Contact Form', 'Blog/News'];
    const layoutOptions = ['Minimalist & Clean', 'Grid/Masonry Focus', 'Split Screen (Text/Image)', 'Full-bleed Cinematic', 'Bento Box UI', 'Cyberpunk/Retro-futuristic'];
    const colorOptions = ['High-End Editorial (Beige & Charcoal)', 'Dark Mode Minimal (Black & White)', 'Vibrant & Playful (Pastels)', 'Neon Cyberpunk (Dark with glowing accents)', 'Earthy & Organic (Greens, Browns, Creams)'];
    const typographyOptions = ['Elegant Serif (Classic, Luxury)', 'Modern Sans-Serif (Clean, Tech)', 'Monospaced (Developer, Retro)', 'Bold & Brutalist (Large, High-impact)'];

    return (
        <div className="flex flex-col flex-1 h-full gap-4 overflow-x-hidden rounded-xl text-foreground">
            <Head title="Projects" />

            <div className="relative z-10 w-full max-w-5xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Design Your Vision
                    </h1>
                    <p className="max-w-2xl mx-auto mt-3 text-base text-muted-foreground">
                        Tell us exactly what you want. Our AI will translate your preferences into a stunning, production-ready portfolio.
                    </p>
                </div>

                {/* Wizard Container */}
                {!isSuccess ? (
                    <div className="overflow-hidden border bg-card text-card-foreground border-border rounded-xl shadow-sm">
                        
                        {/* Step Progress Bar */}
                        <div className="px-6 py-5 border-b border-border bg-muted/30">
                            <nav aria-label="Progress">
                                <ol role="list" className="flex items-center justify-between">
                                    {steps.map((step, stepIdx) => (
                                        <li key={step.title} className={`relative flex items-center ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                                            <div className="flex items-center">
                                                <span className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 shadow-sm ${
                                                    currentStep > step.id ? 'bg-primary border-primary text-primary-foreground' : 
                                                    currentStep === step.id ? 'border-primary text-primary bg-background' : 
                                                    'border-muted-foreground/30 text-muted-foreground bg-background'
                                                }`}>
                                                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.icon}
                                                </span>
                                                <span className={`ml-4 text-sm font-semibold hidden sm:block ${
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
                        <div className="p-6 sm:p-10 min-h-[350px]">
                            
                            {/* STEP 1 */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Project Essentials</h2>
                                        <p className="text-muted-foreground">Give your project a name and describe the core purpose of the website.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground">Project Name</label>
                                            <input 
                                                type="text" 
                                                className="flex w-full px-4 py-3 mt-1 transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                                placeholder="e.g. Elena Rodriguez Portfolio"
                                                value={formData.project_name}
                                                onChange={(e) => handleInputChange('project_name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground">Detailed Description</label>
                                            <textarea 
                                                rows={4}
                                                className="flex w-full px-4 py-3 mt-1 transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                                placeholder="What is this website about? Who is the target audience? e.g. A portfolio for a wedding photographer looking to attract high-end clients."
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {currentStep === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Content & Layout</h2>
                                        <p className="mt-1 text-muted-foreground">Select the sections you need and your preferred layout structure.</p>
                                    </div>

                                    <div>
                                        <label className="block mb-3 text-sm font-medium text-foreground">Required Sections</label>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {contentOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleCheckboxToggle('content_strategy', option)}
                                                    className={`px-5 py-4 text-sm font-medium text-left border-2 rounded-xl transition-all duration-200 flex justify-between items-center cursor-pointer group hover:-translate-y-0.5 hover:shadow-sm ${
                                                        formData.content_strategy.includes(option) 
                                                        ? 'bg-primary/5 border-primary text-foreground shadow-sm ring-1 ring-primary/20' 
                                                        : 'bg-background border-input/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                                    }`}
                                                >
                                                    {option}
                                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
                                                        formData.content_strategy.includes(option) ? 'bg-primary text-primary-foreground' : 'border border-muted-foreground/30'
                                                    }`}>
                                                        {formData.content_strategy.includes(option) && <Check className="w-3 h-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-3 text-sm font-medium text-foreground">Layout Style</label>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {layoutOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleInputChange('layout_style', option)}
                                                    className={`px-5 py-5 text-sm font-medium text-left border-2 rounded-xl transition-all duration-200 flex justify-between items-center cursor-pointer group hover:-translate-y-0.5 hover:shadow-sm ${
                                                        formData.layout_style === option 
                                                        ? 'bg-primary/5 border-primary text-foreground shadow-sm ring-1 ring-primary/20' 
                                                        : 'bg-background border-input/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                                    }`}
                                                >
                                                    {option}
                                                    {formData.layout_style === option && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {currentStep === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Aesthetics</h2>
                                        <p className="mt-1 text-muted-foreground">Define the visual identity, colors, and typography.</p>
                                    </div>

                                    <div>
                                        <label className="block mb-3 text-sm font-medium text-foreground">Color Palette Vibe</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {colorOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleInputChange('color_palette', option)}
                                                    className={`px-5 py-5 text-sm font-medium text-left border-2 rounded-xl transition-all duration-200 flex justify-between items-center cursor-pointer group hover:-translate-y-0.5 hover:shadow-sm ${
                                                        formData.color_palette === option 
                                                        ? 'bg-primary/5 border-primary text-foreground shadow-sm ring-1 ring-primary/20' 
                                                        : 'bg-background border-input/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                                    }`}
                                                >
                                                    {option}
                                                    {formData.color_palette === option && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-3 text-sm font-medium text-foreground">Typography Preference</label>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {typographyOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleInputChange('typography', option)}
                                                    className={`px-5 py-5 text-sm font-medium text-left border-2 rounded-xl transition-all duration-200 flex justify-between items-center cursor-pointer group hover:-translate-y-0.5 hover:shadow-sm ${
                                                        formData.typography === option 
                                                        ? 'bg-primary/5 border-primary text-foreground shadow-sm ring-1 ring-primary/20' 
                                                        : 'bg-background border-input/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                                    }`}
                                                >
                                                    {option}
                                                    {formData.typography === option && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4 */}
                            {currentStep === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Final Review</h2>
                                        <p className="text-muted-foreground">Review your preferences or add any final specific details before generating.</p>
                                    </div>
                                    
                                    <div className="p-6 border rounded-xl bg-muted/30 border-border">
                                        <dl className="space-y-4 text-sm">
                                            <div className="grid grid-cols-3 gap-4">
                                                <dt className="text-muted-foreground">Project</dt>
                                                <dd className="col-span-2 font-medium text-foreground">{formData.project_name || 'Not provided'}</dd>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <dt className="text-muted-foreground">Layout</dt>
                                                <dd className="col-span-2 font-medium text-foreground">{formData.layout_style || 'Not selected'}</dd>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <dt className="text-muted-foreground">Colors</dt>
                                                <dd className="col-span-2 font-medium text-foreground">{formData.color_palette || 'Not selected'}</dd>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <dt className="text-muted-foreground">Typography</dt>
                                                <dd className="col-span-2 font-medium text-foreground">{formData.typography || 'Not selected'}</dd>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <dt className="text-muted-foreground">Sections</dt>
                                                <dd className="col-span-2 font-medium text-foreground">{formData.content_strategy.join(', ') || 'None selected'}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground">Any specific requests? (Optional)</label>
                                        <textarea 
                                            rows={3}
                                            className="flex w-full px-4 py-3 mt-1 transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                            placeholder="e.g. Make sure the navigation is completely transparent until scroll."
                                            value={formData.extra_details}
                                            onChange={(e) => handleInputChange('extra_details', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between px-6 py-5 border-t bg-muted/20 border-border/50">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1 || isSubmitting}
                                className="flex items-center px-5 py-2.5 text-sm font-medium transition-colors bg-transparent border-none text-muted-foreground hover:text-foreground hover:bg-accent rounded-full cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </button>
                            
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                                    disabled={!isStepValid()}
                                    className="flex items-center px-7 py-2.5 text-sm font-semibold transition-all rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
                                >
                                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={submitForm}
                                    disabled={isSubmitting || !isStepValid()}
                                    className="flex items-center px-7 py-2.5 text-sm font-semibold transition-all rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Vision...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" /> Submit to AI Studio</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    // Success State
                    <div className="max-w-xl p-10 mx-auto text-center border shadow-sm bg-card text-card-foreground border-border rounded-xl animate-in fade-in zoom-in-95 duration-700">
                        <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-primary/20 text-primary">
                            <Check className="w-10 h-10" />
                        </div>
                        <h2 className="mt-8 text-3xl font-bold tracking-tight text-foreground">Vision Submitted!</h2>
                        <p className="mt-4 text-muted-foreground">
                            Your preferences have been seamlessly injected into our AI engine. The prompt has been generated and securely saved to the database.
                        </p>
                        <p className="mt-2 font-medium text-foreground">
                            Our admin team will review it shortly.
                        </p>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setCurrentStep(1);
                                setFormData({
                                    project_name: '', description: '', 
                                    content_strategy: [], layout_style: '', color_palette: '', 
                                    typography: '', extra_details: ''
                                });
                            }}
                            className="px-6 py-3 mt-8 text-sm font-medium transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        >
                            Start Another Project
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

GenerateAiPromptIndex.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: '/generate-prompt',
        },
    ],
};
