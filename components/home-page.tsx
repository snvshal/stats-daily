import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col justify-center">
      <header className="border-b">
        <div className="flex-between mx-auto h-14 w-full max-w-7xl shrink-0 border-x px-4 sm:flex-row md:px-6">
          <SDIconWithTitle />
          <nav>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 border-x">
        {/* Hero Section */}
        <section className="relative h-[calc(100vh-3.5rem)] w-full px-4 py-12 sm:px-8 md:px-16 md:py-24 lg:py-32">
          <div className="relative z-10">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-bold tracking-tight text-foreground/90 sm:text-5xl xl:text-6xl/none">
                  Welcome to StatsDaily
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

        <SectionComponent
          title="Intuitive, Streamlined, and User-Focused Design"
          description="Effortlessly manage your tasks with our intuitive interface,
                designed to keep you organized, monitor your progress, and help
                you achieve your goals efficiently."
          image="/layout.png"
        />

        <SectionComponent
          title="Daily Note Writing Capture Your Thoughts & Progress"
          description=" Write daily notes, reflect on your progress, and track key
                insights in an organized, distraction-free editor."
          image="/editor.png"
        />
        <SectionComponent
          title="Task Completion Insights Visualize Your Progress"
          description="Gain deep insights into your productivity with our task
                completion radar chart. Understand strengths, identify gaps, and
                optimize your workflow."
          image="/stats.png"
        />

        <SectionComponent
          title="Your Daily Achievements Tracked & Organized"
          description="Log your daily wins, track your progress,
                and stay motivated. A simple yet powerful way to visualize your productivity."
          image="/achievements.png"
        />

        {/* Call to Action */}
        <section className="w-full bg-background px-4 py-12 sm:px-8 md:px-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-foreground/90">
                Get Started with StatsDaily
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground/90 sm:text-5xl">
                Boost Your Daily Productivity
              </p>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up today to take control of your tasks and manage your time
                effectively.
              </p>
            </div>
            <SignUpButton />
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
    <footer className="border-t">
      <div className="flex-between mx-auto h-16 w-full max-w-7xl shrink-0 border-x px-4 sm:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">
          Copyright &copy; 2025 StatsDaily
          <span className="max-sm:hidden">
            {" "}
            — Daily Tasks Completion Tracker
          </span>
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
      </div>
    </footer>
  );
}

function SectionComponent({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className="w-full bg-background px-4 py-12 sm:px-8 md:px-16 md:py-20">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-balance text-3xl font-bold tracking-tight text-foreground/90 sm:text-5xl xl:text-6xl/none">
            {title}
          </p>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            {description}
          </p>
        </div>
        <div className="flex-center size-full">
          <div
            style={{ backgroundImage: `url(${image})` }}
            className="div-bg-image"
          />
        </div>
      </div>
    </section>
  );
}
