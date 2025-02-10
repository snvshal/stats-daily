import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6">
        <SDIconWithTitle />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            prefetch={false}
          >
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative h-[calc(100vh-3.5rem)] w-full py-12 md:py-24 lg:py-32">
          <div className="container relative z-10 px-4 sm:px-8 md:px-16">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-bold tracking-tighter text-foreground/90 sm:text-5xl xl:text-6xl/none">
                  Welcome to StatsDaily:
                  <br />
                  Your Task Tracking Companion
                </p>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Experience the power of data-driven task management.
                  StatsDaily helps you stay organized, track your daily
                  progress, and accomplish your goals with ease.
                </p>
              </div>
              <SignUpButton />
            </div>
          </div>
          <div className="animate-gradient-xy absolute inset-0 z-0 bg-gradient-to-r from-[#000000] to-[#000000] opacity-20" />
          <div className="animate-gradient-xy absolute inset-0 z-0 bg-[url('/stats.webp')] bg-cover bg-center opacity-10" />
        </section>
        <section className="relative flex w-full flex-col gap-8 py-12 md:py-24">
          <div className="space-y-4 px-4 sm:px-8 md:px-16">
            <div className="space-y-2">
              <p className="text-3xl font-bold tracking-tighter text-foreground/90 sm:text-5xl xl:text-6xl/none">
                Intuitive Streamlined and
                <br />
                User-Focused Design
              </p>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Effortlessly manage your tasks with our intuitive interface,
                designed to keep you organized, monitor your progress, and help
                you achieve your goals efficiently.
              </p>
            </div>
            <div className="flex-center size-full">
              <div className="div-bg-image bg-[url('/layout.png')]" />
            </div>
          </div>
        </section>
        <section className="w-full bg-background py-12 md:py-24 lg:py-32">
          <div className="container px-4 sm:px-8 md:px-16">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-foreground/90">
                  Get Started with StatsDaily
                </div>
                <p className="text-3xl font-bold tracking-tighter text-foreground/90 sm:text-5xl">
                  Boost Your Daily Productivity
                </p>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Sign up today to take control of your tasks and manage your
                  time effectively.
                </p>
              </div>
              <SignUpButton />
            </div>
          </div>
        </section>
      </main>
      <PageFooter />
    </div>
  );
}

export function SDIcon() {
  return (
    <code className="bbn flex-center h-10 w-10 rounded-lg text-2xl font-bold text-foreground/90">
      SD
    </code>
  );
}

export function SDIconWithTitle() {
  return (
    <Link href="/" className="flex-center gap-2.5" prefetch={false}>
      <SDIcon />
      <span className="text-2xl font-bold text-foreground/90">StatsDaily</span>
      <span className="sr-only">
        StatsDaily - Daily Tasks Completion Tracker
      </span>
    </Link>
  );
}

export function SignUpButton() {
  return (
    <div className="flex flex-col gap-2 min-[400px]:flex-row">
      <Link
        href="/sign-in"
        className="inline-flex h-10 items-center justify-center rounded-md border border-muted bg-foreground/80 px-8 text-sm font-medium text-background shadow-sm transition-colors hover:bg-background hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        prefetch={false}
      >
        Sign Up
      </Link>
    </div>
  );
}

export function PageFooter() {
  return (
    <footer className="flex-between h-16 w-full shrink-0 border-t border-muted px-4 sm:flex-row md:px-6">
      <p className="text-xs text-muted-foreground">
        Copyright &copy; 2025 StatsDaily
        <span className="max-sm:hidden"> — Daily Tasks Completion Tracker</span>
      </p>
      <Link href="https://github.com/snvshal/stats-daily" target="_blank">
        <Image
          className="h-6 w-6"
          src="/github.svg"
          alt="github-logo"
          width={24}
          height={24}
        />
      </Link>
    </footer>
  );
}
