"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import {
  FaFacebook,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";
import SectionBackdrop, { useInk } from "@/components/landing/SectionBackdrop";
import { SectionHeading } from "@/components/public-about/SectionHeading";
import { CARD } from "@/components/public-about/MemberCard";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const CONTACT_DETAILS = [
  {
    icon: MapPin,
    title: "Address",
    lines: [
      "#40, Street 273, Sangkat Boeung Kak Ti Mouy, Khan Toul Kork, Phnom Penh",
    ],
  },
  {
    icon: Mail,
    title: "Email us",
    lines: ["contact@devsolve.com"],
    href: "mailto:contact@devsolve.com",
  },
  {
    icon: Phone,
    title: "Support HQ",
    lines: ["(+855) 70-654-951", "(+855) 16-234-432"],
  },
] as const;

const SOCIAL_ACCOUNTS = [
  {
    icon: FaFacebook,
    href: "https://www.facebook.com/",
    label: "DevSolve on Facebook",
  },
  {
    icon: FaLinkedin,
    href: "https://www.linkedin.com/",
    label: "DevSolve on LinkedIn",
  },
  { icon: FaXTwitter, href: "https://x.com/", label: "DevSolve on X" },
];

const FIELD =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-blue-400";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

export function AboutContactSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ink = useInk();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSent(false);

    setTimeout(() => {
      setIsSubmitting(false);
      setSent(true);
      setFormData(EMPTY_FORM);
    }, 1000);
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative overflow-hidden py-20 sm:py-24 border-t border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
    >
      <SectionBackdrop seed={6} gridSize={88} />
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <SectionHeading
          kicker="Contact"
          title="Get in touch"
          inView={inView}
        />

        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.55, delay: 0.15, ease: EASE_OUT }}
            className={`p-6 sm:p-8 lg:col-span-7 ${CARD}`}
          >
            <h3
              className="text-xl font-bold tracking-[-0.03em]"
              style={{ color: ink }}
            >
              Send us a message
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-neutral-300"
                  >
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Dim Pathea"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={FIELD}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-neutral-300"
                  >
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="pathea.dim@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={FIELD}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-neutral-300"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className={FIELD}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-neutral-300"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  placeholder="Tell us a bit more…"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={`${FIELD} resize-none`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(37,99,235,0.85)] transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <Send className="size-4" aria-hidden />
                    </>
                  )}
                </button>

                {sent && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    role="status"
                    className="flex items-center gap-2 text-sm font-medium text-[#047857] dark:text-emerald-400"
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    Thanks — we&rsquo;ll reply within one business day.
                  </motion.p>
                )}
              </div>
            </form>
          </motion.div>

          <div className="space-y-5 lg:col-span-5">
            {CONTACT_DETAILS.map((detail, i) => {
              const Icon = detail.icon;

              return (
                <motion.div
                  key={detail.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    duration: 0.5,
                    delay: 0.25 + i * 0.08,
                    ease: EASE_OUT,
                  }}
                  className={`flex items-start gap-4 p-5 ${CARD}`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-neutral-800">
                    <Icon
                      className="size-4.5 text-[#2563EB] dark:text-blue-400"
                      aria-hidden
                    />
                  </span>

                  <div className="min-w-0">
                    <h4
                      className="text-base font-bold tracking-tight"
                      style={{ color: ink }}
                    >
                      {detail.title}
                    </h4>

                    <div className="mt-1 flex flex-col gap-0.5 text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
                      {detail.lines.map((line) => {
                        const href =
                          "href" in detail && detail.href
                            ? detail.href
                            : detail.title === "Support HQ"
                              ? `tel:${line.replace(/[^\d+]/g, "")}`
                              : null;

                        return href ? (
                          <a
                            key={line}
                            href={href}
                            className="transition-colors hover:text-[#2563EB] dark:hover:text-blue-400"
                          >
                            {line}
                          </a>
                        ) : (
                          <span key={line}>{line}</span>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE_OUT }}
              className={`p-5 ${CARD}`}
            >
              <h4
                className="text-base font-bold tracking-tight"
                style={{ color: ink }}
              >
                Connect with us
              </h4>

              <div className="mt-3 flex items-center gap-2.5">
                {SOCIAL_ACCOUNTS.map((account) => {
                  const Icon = account.icon;

                  return (
                    <a
                      key={account.label}
                      href={account.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={account.label}
                      className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-[#2563EB] hover:text-white dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-blue-500 dark:hover:text-white"
                    >
                      <Icon className="size-4" aria-hidden />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
