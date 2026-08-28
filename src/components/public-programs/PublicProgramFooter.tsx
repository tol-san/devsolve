import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, Shield } from "lucide-react";

export function PublicProgramFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/devsolve.png"
              alt="DevSolve"
              width={44}
              height={44}
              className="size-11 object-contain"
            />
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                DevSolve
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bug bounty marketplace
              </p>
            </div>
          </div>
          <p className="max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
            DevSolve helps security researchers discover programs, validate impact,
            and report responsibly across modern digital platforms.
          </p>
          <div className="flex items-center gap-2">
            <SocialIcon href="https://github.com" label="GitHub">
              <Globe className="size-4" />
            </SocialIcon>
            <SocialIcon href="mailto:hello@devsolve.io" label="Email">
              <Mail className="size-4" />
            </SocialIcon>
            <SocialIcon href="/program" label="Programs">
              <Shield className="size-4" />
            </SocialIcon>
          </div>
        </div>

        <FooterColumn
          title="Platform"
          links={[
            { label: "Home", href: "/" },
            { label: "Program", href: "/program" },
            { label: "About", href: "/about" },
            { label: "Hacker activity", href: "/#activity" },
            { label: "Leader board", href: "/#leaderboard" },
          ]}
        />

        <FooterColumn
          title="Resources"
          links={[
            { label: "Support Center", href: "/#support" },
            { label: "Documentation", href: "/#docs" },
            { label: "Privacy Policy", href: "/#privacy" },
            { label: "Terms of Service", href: "/#terms" },
          ]}
        />

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Organized & Sponsored
          </h3>
          <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                Organized by
              </p>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950">
                <Image
                  src="/devsolve.png"
                  alt="DevSolve Organizer"
                  width={40}
                  height={40}
                  className="size-10 object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    DevSolve
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Research operations team
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                Sponsored by
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                  iSTAD
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                  Security Lab
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-sm text-slate-500 dark:text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>(c) 2026 DevSolve. All rights reserved.</p>
          <p>Security programs, coordinated disclosure, and reward-driven research.</p>
        </div>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

type SocialIconProps = {
  children: React.ReactNode;
  href: string;
  label: string;
};

function SocialIcon({ children, href, label }: SocialIconProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}
