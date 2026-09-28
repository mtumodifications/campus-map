import { Link } from "react-router";
import type { ReactNode } from "react";

type InfoProps = {
    colour: string;
    title: string;
    text: string;
};

type StepProps = {
    number: string;
    children: ReactNode;
};

export default function Home() {
    return (
        <div className="min-h-screen bg-[#111] text-[#f5f5f5]">
            {/* Header */}
            <header className="border-b border-white/10 bg-[#181818]">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-tight">
                            MTUMods
                        </span>

                        <span className="hidden text-white/30 sm:inline">
                            /
                        </span>

                        <span className="hidden text-sm text-white/55 sm:inline">
                            Campus Map
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* GitHub */}
                        <a
                            href="https://github.com/mtumodifications/campus-map"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub repository"
                            title="GitHub"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-btn bg-transparent text-white transition-colors hover:bg-white/10"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.88-1.54-3.88-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.22 0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                            </svg>
                        </a>

                        <Link
                            to="/cork"
                            className="btn btn-sm border-none bg-[#d41429] text-white hover:bg-[#b81023]"
                        >
                            Cork Campus
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="mx-auto max-w-6xl px-5 py-24 md:py-32">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
                            Where's my class?
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                            Find classrooms, labs and other rooms around MTU
                            without having to figure out the campus yourself.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                to="/cork"
                                className="btn btn-lg border-none bg-[#d41429] px-7 text-white hover:bg-[#b81023]"
                            >
                                Open campus map
                            </Link>

                            <a
                                href="https://github.com/mtumodifications/campus-map"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-lg border border-white/10 bg-[#181818] px-7 text-white hover:bg-white/10"
                            >
                                View source
                            </a>
                        </div>
                    </div>
                </section>

                {/* Small info strip */}
                <section className="border-y border-white/10 bg-[#181818]">
                    <div className="mx-auto grid max-w-6xl md:grid-cols-3">
                        <Info
                            colour="#d41429"
                            title="Find a room"
                            text="Search for a room and see where it is on campus."
                        />

                        <Info
                            colour="#05a0dd"
                            title="Student built"
                            text="Made by students to solve a problem students actually have."
                        />

                        <Info
                            colour="#ecac06"
                            title="Open source"
                            text="The code is available on GitHub and contributions are welcome."
                        />
                    </div>
                </section>

                {/* MTUMods */}
                <section className="mx-auto max-w-6xl px-5 py-24">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Built for MTU students.
                        </h2>

                        <p className="mt-4 leading-7 text-white/60">
                            The Campus Map is part of MTUMods, a student-run
                            project building useful tools and resources for
                            students at Munster Technological University.
                        </p>

                        <a
                            href="https://mtumods.com"
                            target="_blank"
                            rel="noreferrer"
                            className="btn mt-6 border-none bg-[#05a0dd] text-white hover:bg-[#048bbf]"
                        >
                            Visit MTUMods
                        </a>
                    </div>
                </section>

                {/* Contributing */}
                <section className="border-t border-white/10 bg-[#181818]">
                    <div className="mx-auto max-w-6xl px-5 py-24">
                        <div className="grid gap-12 md:grid-cols-[1fr_0.8fr] md:items-start">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                    Want to help?
                                </h2>

                                <p className="mt-4 max-w-xl leading-7 text-white/60">
                                    The Campus Map is open source. If something
                                    is wrong, a room is missing, or you have an
                                    idea for improving the map, feel free to
                                    contribute.
                                </p>

                                <a
                                    href="https://github.com/mtumodifications/campus-map"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn mt-6 border-none bg-[#d41429] text-white hover:bg-[#b81023]"
                                >
                                    Contribute on GitHub
                                </a>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-[#202020] p-6">
                                <p className="font-semibold">
                                    Getting started
                                </p>

                                <div className="mt-5 space-y-5">
                                    <Step number="1">
                                        Fork the repository on GitHub.
                                    </Step>

                                    <Step number="2">
                                        Clone your fork and install the
                                        dependencies.
                                    </Step>

                                    <Step number="3">
                                        Make your changes and test them locally.
                                    </Step>

                                    <Step number="4">
                                        Open a pull request describing your
                                        changes.
                                    </Step>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#111]">
                <div className="mx-auto max-w-6xl px-5 py-8">
                    <div className="flex flex-col gap-4 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
                        <p>
                            MTUMods Campus Map is a part of MTUModifications.
                        </p>

                        <div className="flex gap-5">
                            <Link
                                to="/cork"
                                className="transition-colors hover:text-white"
                            >
                                Cork Map
                            </Link>

                            <a
                                href="https://mtumods.com"
                                target="_blank"
                                rel="noreferrer"
                                className="transition-colors hover:text-white"
                            >
                                MTUMods
                            </a>

                            <a
                                href="https://github.com/mtumodifications/campus-map"
                                target="_blank"
                                rel="noreferrer"
                                className="transition-colors hover:text-white"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-xs leading-5 text-white/35">
                            © {new Date().getFullYear()} MTUModifications. All
                            rights reserved.
                        </p>

                        <p className="mt-2 max-w-3xl text-xs leading-5 text-white/30">
                            MTUModifications is an independent, student-run
                            project and is not affiliated with, endorsed by,
                            or officially connected to Munster Technological
                            University.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function Info({ colour, title, text }: InfoProps) {
    return (
        <div className="border-b border-white/10 p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
            <div
                className="mb-5 h-1 w-8 rounded-full"
                style={{ backgroundColor: colour }}
            />

            <h2 className="font-semibold text-white">
                {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/50">
                {text}
            </p>
        </div>
    );
}

function Step({ number, children }: StepProps) {
    return (
        <div className="flex gap-4">
            <span className="font-mono text-s font-bold text-[#d41429]">
                {number}
            </span>

            <p className="text-sm leading-6 text-white/60">
                {children}
            </p>
        </div>
    );
}
