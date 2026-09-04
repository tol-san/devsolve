"use client";

"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionBackdrop from "@/components/landing/SectionBackdrop";
import { PillarOrbit } from "@/components/landing/PillarOrbit";
import { ScaleFrame } from "@/components/originkit/ui/hero-24/scale-frame";

const REVEAL = "animate-hero-reveal";
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

const Wordmark = ({ className, step }: { className: string; step: number }) => {
  return (
    <div
      style={delay(step)}
      className={`${REVEAL} pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 ${className}`}
    >
      <div
        aria-hidden
        className="absolute -inset-x-[38%] -inset-y-[120%] rounded-[999px] bg-white/80 blur-xl dark:bg-neutral-950/80"
      />
      <Image
        src="/devsolve-logo.png"
        alt="DevSolve"
        fill
        priority
        sizes="240px"
        className="object-contain"
      />
    </div>
  );
};

const Reticle = ({ children }: { children: ReactNode }) => (
  <span className="relative inline-block px-[0.16em] text-[#10B981]">
    {children}
    <span aria-hidden className="pointer-events-none absolute -left-[0.06em] -top-[0.1em] h-[0.26em] w-[0.26em] border-l-[3px] border-t-[3px] border-[#2563EB]" />
    <span aria-hidden className="pointer-events-none absolute -right-[0.06em] -top-[0.1em] h-[0.26em] w-[0.26em] border-r-[3px] border-t-[3px] border-[#2563EB]" />
    <span aria-hidden className="pointer-events-none absolute -bottom-[0.1em] -left-[0.06em] h-[0.26em] w-[0.26em] border-b-[3px] border-l-[3px] border-[#2563EB]" />
    <span aria-hidden className="pointer-events-none absolute -bottom-[0.1em] -right-[0.06em] h-[0.26em] w-[0.26em] border-b-[3px] border-r-[3px] border-[#2563EB]" />
  </span>
);

const GetStartedButton = ({ className }: { className: string }) => (
  <Link
    href="/account-type"
    className={`relative flex shrink-0 cursor-pointer items-center justify-center rounded-[999px] bg-[#2563EB] shadow-[0_18px_40px_-16px_rgba(37,99,235,0.9)] transition-[filter] duration-200 hover:brightness-110 ${className}`}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[999px]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 100%)",
      }}
    />
    <p className="relative shrink-0 whitespace-nowrap text-[16px] font-semibold leading-[1.15] tracking-[-0.32px] text-white">
      Join our world
    </p>
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.35)]" />
  </Link>
);

const GlassCard = ({
  className,
  plate,
  step,
  children,
}: {
  className: string;
  plate: string;
  step: number;
  children: ReactNode;
}) => (
  <div
    style={delay(step)}
    className={`${REVEAL} absolute flex flex-col items-start overflow-clip border-solid border-slate-200 dark:border-[rgba(255,255,255,0.1)] backdrop-blur-sm ${className}`}
  >
    <div
      className={`absolute h-[166px] w-[301px] -translate-x-1/2 -translate-y-1/2 blur-[20px] ${plate}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white/70 backdrop-blur-[2px] dark:bg-[rgba(255,255,255,0.1)]"
      />
    </div>
    {children}
  </div>
);

const PhoneFrame = () => (
  <div className="relative h-[880px] w-[402px] overflow-clip">

    <div className="absolute left-1/2 top-[84px] flex w-[366px] -translate-x-1/2 flex-col items-center gap-[24px]">
      <div className="relative flex w-full shrink-0 flex-col items-center gap-[8px] text-center text-[#1E293B] dark:text-white">
        <h1
          style={delay(80)}
          className={`${REVEAL} relative w-[340px] shrink-0 leading-[1.08] tracking-[-0.035em]`}
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
            Bug bounty · Problems · Solutions · Showcases
          </span>
          <span className="mt-[0.4em] block text-[31px] font-bold">
            Four disciplines. <Reticle>One platform.</Reticle>
          </span>
        </h1>
        <p
          style={delay(160)}
          className={`${REVEAL} relative w-full shrink-0 text-[14px] leading-[1.5] text-slate-600 dark:text-[rgba(255,255,255,0.7)]`}
        >
          Bounty programs with public scope, tiers and payouts, triaged in the open.
          Problems answered by people who have shipped it — and every accepted report or
          solution becomes proof of work on your profile.
        </p>
      </div>
      <div
        style={delay(240)}
        className={`${REVEAL} relative flex w-full shrink-0 flex-col items-start justify-center gap-[8px]`}
      >
        <GetStartedButton className="w-full px-[24px] py-[14px]" />
        <Link
          href="/programs"
          className="relative flex w-full shrink-0 cursor-pointer items-center justify-center rounded-[999px] border border-solid border-slate-200 dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#252525] px-[24px] py-[14px] transition-opacity duration-200 hover:opacity-80"
        >
          <p className="relative shrink-0 whitespace-nowrap text-[16px] leading-[1.15] tracking-[-0.32px] text-[#1E293B] dark:text-white">
            Browse programs
          </p>
        </Link>
      </div>
    </div>

    <div style={delay(320)} className={`${REVEAL} absolute left-[calc(50%+0.5px)] top-[436px] h-[356px] w-[356px] -translate-x-1/2`}>
      <PillarOrbit className="h-full w-full" />
      <Wordmark className="h-[48px] w-[178px]" step={420} />
    </div>

    <GlassCard
      className="left-[12px] top-[398px] w-[136px] gap-[4px] rounded-[6px] border p-[12px]"
      plate="left-[calc(50%-0.5px)] top-[calc(50%+0.5px)]"
      step={400}
    >
      <p className="relative w-full shrink-0 text-[16px] font-bold italic leading-[1.4] text-[#1E293B] dark:text-white">
        2,412
      </p>
      <p className="relative w-full shrink-0 text-[12px] leading-[1.4] text-[#1E293B] dark:text-white opacity-70">
        Verified researchers
      </p>
    </GlassCard>

    <GlassCard
      className="left-[calc(50%+4px)] top-[812px] w-[212px] -translate-x-1/2 gap-[12px] rounded-[4.729px] border-[0.788px] p-[12px]"
      plate="left-[calc(50%+25.5px)] top-[calc(50%+4.21px)]"
      step={480}
    >
      <p className="relative w-full shrink-0 text-[12px] leading-[1.4] text-[#1E293B] dark:text-white">
        Every finding is timestamped on arrival, triaged in the open, and paid at the published tier.
      </p>
      <div className="relative flex w-full shrink-0 items-center gap-[8px] text-[12px] leading-[1.3] text-[#1E293B] dark:text-white">
          <span aria-hidden className="size-[7px] shrink-0 rounded-full bg-[#10B981]" />
          <span className="opacity-70">Coordinated disclosure by default</span>
        </div>
    </GlassCard>
  </div>
);

const TabletFrame = () => (
  <div className="relative h-[994px] w-[744px] overflow-clip">

    <div className="absolute left-[132px] top-[116px] flex w-[480px] flex-col items-center gap-[28px]">
      <div className="relative flex w-full shrink-0 flex-col items-center gap-[16px] text-center text-[#1E293B] dark:text-white">
        <h1
          style={delay(80)}
          className={`${REVEAL} relative w-full shrink-0 leading-[1.08] tracking-[-0.035em]`}
        >
          <span className="block text-[13px] font-semibold uppercase tracking-[0.22em] text-[#2563EB]">
            Bug bounty · Problems · Solutions · Showcases
          </span>
          <span className="mt-[0.34em] block text-[44px] font-bold">
            Four disciplines. <Reticle>One platform.</Reticle>
          </span>
        </h1>
        <p
          style={delay(160)}
          className={`${REVEAL} relative w-full shrink-0 text-[16px] leading-[1.5] text-slate-600 dark:text-[rgba(255,255,255,0.7)]`}
        >
          Bounty programs with public scope, tiers and payouts, triaged in the open.
          Problems answered by people who have shipped it — and every accepted report or
          solution becomes proof of work on your profile.
        </p>
      </div>
      <div
        style={delay(240)}
        className={`${REVEAL} relative flex shrink-0 items-center gap-[12px]`}
      >
        <GetStartedButton className="px-[24px] py-[16px]" />
        <Link
          href="/programs"
          className="relative flex shrink-0 cursor-pointer items-center justify-center rounded-[999px] border border-solid border-slate-200 dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#252525] px-[24px] py-[16px] transition-opacity duration-200 hover:opacity-80"
        >
          <p className="relative shrink-0 whitespace-nowrap text-[16px] leading-[1.15] tracking-[-0.32px] text-[#1E293B] dark:text-white">
            Browse programs
          </p>
        </Link>
      </div>
    </div>

    <div style={delay(320)} className={`${REVEAL} absolute left-[162px] top-[408px] h-[420px] w-[420px]`}>
      <PillarOrbit className="h-full w-full" />
      <Wordmark className="h-[62px] w-[230px]" step={420} />
    </div>

    <GlassCard
      className="left-[24px] top-[520px] w-[169px] gap-[4px] rounded-[6px] border p-[16px]"
      plate="left-1/2 top-1/2"
      step={400}
    >
      <p className="relative w-full shrink-0 text-[20px] font-bold italic leading-[1.4] text-[#1E293B] dark:text-white">
        2,412
      </p>
      <p className="relative w-full shrink-0 text-[14px] leading-[1.4] text-[#1E293B] dark:text-white opacity-70">
        Verified researchers
      </p>
    </GlassCard>

    <GlassCard
      className="left-[498px] top-[640px] w-[224px] gap-[16px] rounded-[6px] border p-[14px]"
      plate="left-[calc(50%-0.5px)] top-1/2"
      step={480}
    >
      <p className="relative w-full shrink-0 text-[14px] leading-[1.4] text-[#1E293B] dark:text-white">
        Every finding is timestamped on arrival, triaged in the open, and paid at the published tier.
      </p>
      <div className="relative flex w-full shrink-0 items-center gap-[8px] text-[12px] leading-[1.3] text-[#1E293B] dark:text-white">
          <span aria-hidden className="size-[7px] shrink-0 rounded-full bg-[#10B981]" />
          <span className="opacity-70">Coordinated disclosure by default</span>
        </div>
    </GlassCard>
  </div>
);

const DesktopFrame = () => (
  <div className="relative h-[913px] w-[1280px] overflow-clip">

    <div className="absolute left-[380px] top-[134px] flex w-[520px] flex-col items-center gap-[28px]">
      <div className="relative flex w-full shrink-0 flex-col items-center gap-[16px] text-center text-[#1E293B] dark:text-white">
        <h1
          style={delay(80)}
          className={`${REVEAL} relative w-full shrink-0 leading-[1.08] tracking-[-0.035em]`}
        >
          <span className="block text-[13px] font-semibold uppercase tracking-[0.22em] text-[#2563EB]">
            Bug bounty · Problems · Solutions · Showcases
          </span>
          <span className="mt-[0.34em] block text-[44px] font-bold">
            Four disciplines. <Reticle>One platform.</Reticle>
          </span>
        </h1>
        <p
          style={delay(160)}
          className={`${REVEAL} relative w-full shrink-0 text-[16px] leading-[1.5] text-slate-600 dark:text-[rgba(255,255,255,0.7)]`}
        >
          Bounty programs with public scope, tiers and payouts, triaged in the open.
          Problems answered by people who have shipped it — and every accepted report or
          solution becomes proof of work on your profile.
        </p>
      </div>
      <div
        style={delay(240)}
        className={`${REVEAL} relative flex shrink-0 items-center gap-[12px]`}
      >
        <GetStartedButton className="px-[24px] py-[16px]" />
        <Link
          href="/programs"
          className="relative flex shrink-0 cursor-pointer items-center justify-center rounded-[999px] border border-solid border-slate-200 dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#252525] px-[24px] py-[16px] transition-opacity duration-200 hover:opacity-80"
        >
          <p className="relative shrink-0 whitespace-nowrap text-[16px] leading-[1.15] tracking-[-0.32px] text-[#1E293B] dark:text-white">
            Browse programs
          </p>
        </Link>
      </div>
    </div>

    <div style={delay(320)} className={`${REVEAL} absolute left-[400px] top-[404px] h-[480px] w-[480px]`}>
      <PillarOrbit className="h-full w-full" />
      <Wordmark className="h-[62px] w-[230px]" step={420} />
    </div>

    <GlassCard
      className="left-[128px] top-[520px] w-[169px] gap-[4px] rounded-[6px] border p-[16px]"
      plate="left-1/2 top-1/2"
      step={400}
    >
      <p className="relative w-full shrink-0 text-[20px] font-bold italic leading-[1.4] text-[#1E293B] dark:text-white">
        2,412
      </p>
      <p className="relative w-full shrink-0 text-[14px] leading-[1.4] text-[#1E293B] dark:text-white opacity-70">
        Verified researchers
      </p>
    </GlassCard>

    <GlassCard
      className="left-[912px] top-[606px] w-[246px] gap-[16px] rounded-[6px] border p-[14px]"
      plate="left-[calc(50%-0.5px)] top-1/2"
      step={480}
    >
      <p className="relative w-full shrink-0 text-[14px] leading-[1.4] text-[#1E293B] dark:text-white">
        Every finding is timestamped on arrival, triaged in the open, and paid at the published tier.
      </p>
      <div className="relative flex w-full shrink-0 items-center gap-[8px] text-[12px] leading-[1.3] text-[#1E293B] dark:text-white">
          <span aria-hidden className="size-[7px] shrink-0 rounded-full bg-[#10B981]" />
          <span className="opacity-70">Coordinated disclosure by default</span>
        </div>
    </GlassCard>
  </div>
);

export const Sec2Hero = () => (
  <section className="relative -mt-(--navbar-height) w-full overflow-hidden bg-white dark:bg-neutral-950">
    <SectionBackdrop seed={0} gridSize={88} />

    <ScaleFrame frameWidth={402} className="relative w-full overflow-hidden min-[640px]:hidden">
      <PhoneFrame />
    </ScaleFrame>
    <ScaleFrame
      frameWidth={744}
      className="relative hidden w-full overflow-hidden min-[640px]:block desktop-sm:hidden"
    >
      <TabletFrame />
    </ScaleFrame>
    <ScaleFrame
      frameWidth={1280}
      className="relative hidden w-full overflow-hidden desktop-sm:block"
    >
      <DesktopFrame />
    </ScaleFrame>
  </section>
);
