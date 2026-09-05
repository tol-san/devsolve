"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import {
  FaFacebook,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import SectionBackdrop, { useInk } from "@/components/landing/SectionBackdrop";
import { SectionHeading } from "@/components/public-about/SectionHeading";
import { useT } from "@/lib/i18n/I18nProvider";
import {
  contactMessageSchema,
  type ContactMessageInput,
} from "@/lib/validations/contact";
import { useSendContactMessageMutation } from "@/lib/redux/services/contactApi";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=%2340%2C+Street+273%2C+Sangkat+Boeung+Kak+Ti+Mouy%2C+Khan+Toul+Kork%2C+Phnom+Penh";

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

export function AboutContactSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ink = useInk();
  const t = useT();

  const [sent, setSent] = useState(false);
  const [sendContactMessage, { isLoading: isSubmitting }] =
    useSendContactMessageMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactMessageInput) => {
    try {
      const response = await sendContactMessage(data).unwrap();
      setSent(true);
      reset();
      toast.success(
        t("aboutPage.contact.successTitle") || "Message sent successfully!",
        {
          description:
            response.message ||
            t("aboutPage.contact.successMessage") ||
            "Thanks — we'll reply within one business day.",
        }
      );
    } catch (err: unknown) {
      console.error("Failed to submit contact message:", err);
      const apiError = err as {
        data?: { message?: string; fieldErrors?: Record<string, string[]> };
      };
      toast.error(
        apiError?.data?.message || "Failed to send message",
        {
          description:
            "Please check your information or email us directly at contact@devsolve.com",
        }
      );
    }
  };

  const contactDetails = [
    {
      icon: MapPin,
      title: t("aboutPage.contact.addressTitle") || "Address",
      lines: [
        t("aboutPage.contact.addressValue") ||
          "#40, Street 273, Sangkat Boeung Kak Ti Mouy, Khan Toul Kork, Phnom Penh",
      ],
      href: MAPS_URL,
      external: true,
    },
    {
      icon: Mail,
      title: t("aboutPage.contact.emailTitle") || "Email us",
      lines: ["contact@devsolve.com"],
      href: "mailto:contact@devsolve.com",
    },
    {
      icon: Phone,
      title: t("aboutPage.contact.phoneTitle") || "Support HQ",
      lines: ["(+855) 70-654-951", "(+855) 16-234-432"],
    },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative overflow-hidden py-16 sm:py-24 border-t border-border/80 scroll-mt-20"
    >
      <SectionBackdrop seed={6} gridSize={88} />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <SectionHeading
          kicker={t("aboutPage.contact.kicker") || "Contact"}
          title={t("aboutPage.contact.title") || "Get in touch"}
          inView={inView}
        />

        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.55, delay: 0.15, ease: EASE_OUT }}
            className="p-6 sm:p-8 lg:col-span-7 rounded-2xl bg-card border border-border/80 shadow-xs backdrop-blur-md"
          >
            <h3
              className="text-xl font-bold tracking-tight text-foreground"
              style={{ color: ink }}
            >
              {t("aboutPage.contact.subtitle") || "Send us a message"}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-semibold text-foreground"
                  >
                    {t("aboutPage.contact.nameLabel") || "Full name"}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    disabled={isSubmitting}
                    placeholder={
                      t("aboutPage.contact.namePlaceholder") || "Dim Pathea"
                    }
                    {...register("name")}
                    className={cn(
                      "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60",
                      errors.name &&
                        "border-destructive focus:border-destructive focus:ring-destructive/15"
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-semibold text-foreground"
                  >
                    {t("aboutPage.contact.emailLabel") || "Email address"}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    placeholder={
                      t("aboutPage.contact.emailPlaceholder") ||
                      "pathea.dim@gmail.com"
                    }
                    {...register("email")}
                    className={cn(
                      "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60",
                      errors.email &&
                        "border-destructive focus:border-destructive focus:ring-destructive/15"
                    )}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-1.5 block text-sm font-semibold text-foreground"
                >
                  {t("aboutPage.contact.subjectLabel") || "Subject"}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  disabled={isSubmitting}
                  placeholder={
                    t("aboutPage.contact.subjectPlaceholder") ||
                    "What is this about?"
                  }
                  {...register("subject")}
                  className={cn(
                    "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60",
                    errors.subject &&
                      "border-destructive focus:border-destructive focus:ring-destructive/15"
                  )}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-semibold text-foreground"
                >
                  {t("aboutPage.contact.messageLabel") || "Message"}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  disabled={isSubmitting}
                  placeholder={
                    t("aboutPage.contact.messagePlaceholder") ||
                    "Tell us a bit more…"
                  }
                  {...register("message")}
                  className={cn(
                    "w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60",
                    errors.message &&
                      "border-destructive focus:border-destructive focus:ring-destructive/15"
                  )}
                />
                {errors.message && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(37,99,235,0.7)] transition-all hover:bg-blue-700 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      {t("aboutPage.contact.sendingButton") || "Sending…"}
                    </>
                  ) : (
                    <>
                      {t("aboutPage.contact.sendButton") || "Send message"}
                      <Send className="size-4" aria-hidden />
                    </>
                  )}
                </button>

                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    role="status"
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                    <span>
                      {t("aboutPage.contact.successMessage") ||
                        "Thanks — we'll reply within one business day."}
                    </span>
                  </motion.div>
                )}
              </div>
            </form>
          </motion.div>

          {/* Contact Details & Links */}
          <div className="space-y-5 lg:col-span-5">
            {contactDetails.map((detail, i) => {
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
                  className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs backdrop-blur-md"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon
                      className="size-4.5 text-blue-600 dark:text-blue-400"
                      aria-hidden
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className="text-base font-bold tracking-tight text-foreground"
                        style={{ color: ink }}
                      >
                        {detail.title}
                      </h4>
                      {detail.external && (
                        <a
                          href={detail.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <span>{t("aboutPage.contact.viewOnMaps") || "Maps"}</span>
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                      )}
                    </div>

                    <div className="mt-1 flex flex-col gap-0.5 text-sm leading-relaxed text-muted-foreground">
                      {detail.lines.map((line) => {
                        const href =
                          "href" in detail && detail.href
                            ? detail.href
                            : detail.title.includes("Support") ||
                              detail.title.includes("ជំនួយ")
                              ? `tel:${line.replace(/[^\d+]/g, "")}`
                              : null;

                        return href ? (
                          <a
                            key={line}
                            href={href}
                            target={detail.external ? "_blank" : undefined}
                            rel={detail.external ? "noopener noreferrer" : undefined}
                            className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
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

            {/* Social Accounts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE_OUT }}
              className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs backdrop-blur-md"
            >
              <h4
                className="text-base font-bold tracking-tight text-foreground"
                style={{ color: ink }}
              >
                {t("aboutPage.contact.connectTitle") || "Connect with us"}
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
                      className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white"
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

export default AboutContactSection;
