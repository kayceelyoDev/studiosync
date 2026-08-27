import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Button } from '@/components/ui/button';
import { Sparkles, Code, Layout, Globe, MonitorSmartphone, Zap, Star, Monitor, Moon, Sun, Wand2, Paintbrush, FileJson, Layers, ArrowRight } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export default function Welcome() {
    const { auth } = usePage().props;
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        if (appearance === 'dark') {
            updateAppearance('light');
        } else {
            updateAppearance('dark');
        }
    };

    return (
        <>
            <Head title="StudioSync - AI-powered website generation" />
            <div className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden relative selection:bg-primary/20">
                
                {/* Header */}
                <header className="absolute inset-x-0 top-0 z-50">
                    <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
                        <div className="flex lg:flex-1">
                            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
                                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-xl tracking-tight">StudioSync</span>
                            </a>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex flex-1 justify-center gap-8">
                            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                        </div>

                        <div className="flex flex-1 justify-end items-center gap-4">
                            <button 
                                onClick={toggleTheme}
                                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {appearance === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block"
                                >
                                    Dashboard &rarr;
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block"
                                    >
                                        Log in
                                    </Link>
                                    <Link href={register()}>
                                        <Button className="rounded-full px-6 shadow-sm">
                                            Sign up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="flex-grow flex items-center justify-center relative isolate px-6 pt-32 pb-16 lg:px-8 min-h-screen">
                    
                    {/* Concentric Rings Background */}
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center -z-10 pointer-events-none mt-20">
                        {/* Inner Ring */}
                        <div className="absolute w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] border border-border/60 rounded-full animate-[spin_60s_linear_infinite]">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 p-2 bg-background border border-border rounded-full shadow-sm text-blue-500"><Code className="w-5 h-5" /></div>
                            <div className="absolute top-1/2 -left-3 -translate-y-1/2 p-2 bg-background border border-border rounded-full shadow-sm text-green-500"><Layout className="w-5 h-5" /></div>
                            <div className="absolute bottom-12 right-12 p-2 bg-background border border-border rounded-full shadow-sm text-purple-500"><Sparkles className="w-5 h-5" /></div>
                        </div>

                        {/* Outer Ring */}
                        <div className="absolute w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] border border-border/40 rounded-full animate-[spin_90s_linear_infinite_reverse]">
                            <div className="absolute top-24 left-24 p-2.5 bg-background border border-border rounded-full shadow-sm text-amber-500"><Globe className="w-5 h-5" /></div>
                            <div className="absolute bottom-32 left-16 p-2.5 bg-background border border-border rounded-full shadow-sm text-rose-500"><Zap className="w-5 h-5" /></div>
                            <div className="absolute top-1/2 -right-3 -translate-y-1/2 p-2.5 bg-background border border-border rounded-full shadow-sm text-indigo-500"><MonitorSmartphone className="w-5 h-5" /></div>
                        </div>
                        
                        {/* Largest Ring */}
                        <div className="hidden sm:block absolute w-[1200px] h-[1200px] border border-border/20 rounded-full animate-[spin_120s_linear_infinite]">
                            <div className="absolute top-1/3 -right-4 p-3 bg-background border border-border rounded-full shadow-sm text-cyan-500"><Wand2 className="w-6 h-6" /></div>
                            <div className="absolute bottom-1/4 -left-4 p-3 bg-background border border-border rounded-full shadow-sm text-pink-500"><Paintbrush className="w-6 h-6" /></div>
                        </div>
                    </div>

                    {/* Gradient Overlay for bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent -z-10"></div>

                    {/* Hero Content */}
                    <div className="mx-auto max-w-3xl text-center z-10 pt-10 sm:pt-0">
                        


                        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl mb-6 leading-[1.1]">
                            AI-powered websites <br className="hidden sm:block"/> built in seconds.
                        </h1>
                        
                        <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
                            Describe your vision and watch our AI instantly generate complete, responsive, and beautiful websites. From simple landing pages to complex web apps, bring your ideas to life instantly.
                        </p>
                        
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href={register()} className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                    Start generating free
                                </Button>
                            </Link>
                            <a href="#how-it-works" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold bg-background/50 backdrop-blur-sm border-border hover:bg-accent transition-all">
                                    See how it works
                                </Button>
                            </a>
                        </div>
                        
                        {/* Floating UI Mockups Preview */}
                        <div className="mt-16 sm:mt-24 relative max-w-4xl mx-auto">
                            <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent blur-2xl opacity-50 rounded-[3rem]"></div>
                            
                            {/* Main mock card */}
                            <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-4 sm:p-6 text-left mx-4 sm:mx-0 ring-1 ring-white/10 overflow-hidden transform hover:-translate-y-1 transition-transform duration-500">
                                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-accent/50 border border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">Prompt: "Build a modern SaaS landing page..."</div>
                                                <div className="text-sm text-muted-foreground">AI analyzing requirements &middot; Just now</div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded-full animate-pulse">Analyzing</div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-accent/50 border border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                                <Code className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">Generating HTML & Tailwind CSS</div>
                                                <div className="text-sm text-muted-foreground">Writing components and layout structure</div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full">Complete</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
                
                {/* How it works Section */}
                <section id="how-it-works" className="relative z-10 py-24 sm:py-32 bg-background">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">From idea to live site in 3 steps</h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                No coding required. Just describe what you want, and our AI handles the rest.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">1. Describe your idea</h3>
                                <p className="text-muted-foreground">Type a simple prompt describing the website or web app you want to build. Be as specific or vague as you like.</p>
                            </div>
                            
                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow relative">
                                <div className="hidden md:block absolute top-12 -left-8 text-muted-foreground/30">
                                    <ArrowRight className="w-8 h-8" />
                                </div>
                                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <Layers className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">2. AI Generates Code</h3>
                                <p className="text-muted-foreground">Our AI instantly writes the HTML, CSS, and interactive components using modern frameworks like Tailwind.</p>
                            </div>
                            
                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow relative">
                                <div className="hidden md:block absolute top-12 -left-8 text-muted-foreground/30">
                                    <ArrowRight className="w-8 h-8" />
                                </div>
                                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <Globe className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">3. Preview & Deploy</h3>
                                <p className="text-muted-foreground">Preview your fully functional website in real-time. Export the code or deploy it directly to the web.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features / Showcase Preview Section */}
                <section id="features" className="relative z-10 py-24 sm:py-32 border-t border-border bg-accent/20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 border border-primary/20 mb-6">
                                    <FileJson className="w-4 h-4" />
                                    Clean, exportable code
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                                    Built for developers and designers alike.
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    StudioSync doesn't just create images of websites—it generates production-ready code. You get clean, semantic HTML and standard Tailwind CSS classes that you can easily copy, paste, and modify in your own projects.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-foreground">
                                        <div className="p-1 rounded-full bg-green-500/10 text-green-500"><CheckIcon /></div>
                                        Responsive design by default
                                    </li>
                                    <li className="flex items-center gap-3 text-foreground">
                                        <div className="p-1 rounded-full bg-green-500/10 text-green-500"><CheckIcon /></div>
                                        Dark mode support built-in
                                    </li>
                                    <li className="flex items-center gap-3 text-foreground">
                                        <div className="p-1 rounded-full bg-green-500/10 text-green-500"><CheckIcon /></div>
                                        Modern Tailwind CSS utilities
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Code snippet mockup */}
                            <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-950 border-b border-zinc-800">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div className="ml-4 text-xs font-mono text-zinc-500">generated-component.html</div>
                                </div>
                                <div className="p-6 overflow-x-auto text-sm font-mono text-zinc-300">
                                    <pre>
<code><span className="text-pink-400">&lt;div</span> <span className="text-green-300">className</span>=<span className="text-amber-300">"flex flex-col gap-4 p-6 bg-card rounded-xl shadow-sm border border-border"</span><span className="text-pink-400">&gt;</span>{'\n'}
  <span className="text-pink-400">&lt;h2</span> <span className="text-green-300">className</span>=<span className="text-amber-300">"text-2xl font-bold text-foreground"</span><span className="text-pink-400">&gt;</span>{'\n'}
    AI Generated Component{'\n'}
  <span className="text-pink-400">&lt;/h2&gt;</span>{'\n'}
  <span className="text-pink-400">&lt;p</span> <span className="text-green-300">className</span>=<span className="text-amber-300">"text-muted-foreground"</span><span className="text-pink-400">&gt;</span>{'\n'}
    This is perfectly structured code.{'\n'}
  <span className="text-pink-400">&lt;/p&gt;</span>{'\n'}
<span className="text-pink-400">&lt;/div&gt;</span></code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative z-10 py-24 sm:py-32">
                    <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">Ready to build your next project?</h2>
                        <p className="text-xl text-muted-foreground mb-10">Join thousands of creators building websites 10x faster with StudioSync.</p>
                        <Link href={register()}>
                            <Button size="lg" className="h-14 px-10 rounded-full text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                Get Started for Free
                            </Button>
                        </Link>
                    </div>
                </section>
                
                {/* Footer Section */}
                <footer className="relative z-10 py-12 border-t border-border bg-card/50 backdrop-blur-lg text-center">
                    <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-50 grayscale mb-8">
                        <div className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2"><Layout className="w-5 h-5"/> TailwindCSS</div>
                        <div className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2"><Code className="w-5 h-5"/> Laravel</div>
                        <div className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2"><Zap className="w-5 h-5"/> React</div>
                        <div className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2"><Sparkles className="w-5 h-5"/> OpenAI</div>
                    </div>
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} StudioSync. All rights reserved.</p>
                </footer>

            </div>
        </>
    );
}

function CheckIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}
