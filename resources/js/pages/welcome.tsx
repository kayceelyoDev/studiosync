import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col bg-white text-zinc-900">
                <header className="absolute inset-x-0 top-0 z-50">
                    <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                        <div className="flex lg:flex-1">
                            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
                                <span className="font-semibold text-lg tracking-tight">Studio<span className="text-green-600">Sync</span></span>
                            </a>
                        </div>
                        <div className="flex flex-1 justify-end items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="text-sm font-medium text-zinc-900 hover:text-green-600 transition-colors"
                                >
                                    Dashboard &rarr;
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                    >
                                        <Button className="bg-black text-white hover:bg-zinc-800 rounded-md">
                                            Sign up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="flex-grow flex items-center justify-center relative isolate px-6 pt-14 lg:px-8">
                    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-zinc-500 ring-1 ring-zinc-200 hover:ring-zinc-300">
                                Announcing our next-gen asset manager.{' '}
                                <a href="#" className="font-semibold text-green-600">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Read more <span aria-hidden="true">&rarr;</span>
                                </a>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
                            The ultimate toolkit for visual creators.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-zinc-500">
                            Streamline your photography and videography workflows. From seamless client galleries to advanced contract management, StudioSync gives you everything you need to run your creative business.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link href={register()}>
                                <Button size="lg" className="bg-black text-white hover:bg-zinc-800 h-12 px-8">
                                    Get started
                                </Button>
                            </Link>
                            <a href="#" className="text-sm font-semibold leading-6 text-zinc-900 hover:text-green-600 transition-colors">
                                View demo <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
