import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, Shield } from "lucide-react";

export function PublicProgramFooter() {
  return (
    <footer className="border-t border-border/80 bg-background/85 dark:bg-background/90 backdrop-blur-xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
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
              <p className="text-lg font-bold tracking-tight text-foreground">
                DevSolve
              </p>
              <p className="text-sm text-muted-foreground">
                Bug bounty marketplace
              </p>
            </div>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
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
          <h3 className="text-base font-semibold text-foreground">
            Organized & Sponsored
          </h3>
          <div className="space-y-3 rounded-[24px] border border-border bg-muted/40 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Organized by
              </p>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-2xs">
                <Image
                  src="/devsolve.png"
                  alt="DevSolve Organizer"
                  width={40}
                  height={40}
                  className="size-10 object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    DevSolve
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Research operations team
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sponsored by
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-2xs">
                  iSTAD
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-2xs">
                  Security Lab
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
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
      className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground shadow-2xs"
    >
      {children}
    </Link>
  );
}
