"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Cpu, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  CARD_CLASS,
  CONTROL_CLASS,
  MAX_TECHNOLOGIES,
  SUGGESTED_TECHNOLOGIES,
  type ProblemFormInput,
} from "./types-and-constants";

interface ProblemTechnologiesSectionProps {
  technologyFields: { id: string }[];
  register: UseFormRegister<ProblemFormInput>;
  errors: FieldErrors<ProblemFormInput>;
  submitting: boolean;
  onAppendTechnology: (item: { name: string; version: string }) => void;
  onRemoveTechnology: (index: number) => void;
}

export function ProblemTechnologiesSection({
  technologyFields,
  register,
  errors,
  submitting,
  onAppendTechnology,
  onRemoveTechnology,
}: ProblemTechnologiesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
    >
      <Card
        id="section-technologies"
        className={CARD_CLASS}
        aria-labelledby="problem-environment-heading"
      >
        <CardHeader className="p-5 sm:p-6 pb-4 sm:pb-4 border-b border-border/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Cpu className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground font-bold">02.</span>
                  <h2
                    id="problem-environment-heading"
                    className="text-lg font-bold tracking-tight text-foreground"
                  >
                    Technologies & Stack
                  </h2>
                </div>
                
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {technologyFields.length > 0 ? (
                <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                  {technologyFields.length}/{MAX_TECHNOLOGIES}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Up to {MAX_TECHNOLOGIES} items
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-5 space-y-5">
          {/* Quick-add chips */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/50 bg-muted/20 p-3">
            <span className="text-xs font-semibold text-muted-foreground mr-1">
              Quick add:
            </span>
            {SUGGESTED_TECHNOLOGIES.map((tech) => (
              <button
                key={tech}
                type="button"
                disabled={
                  submitting || technologyFields.length >= MAX_TECHNOLOGIES
                }
                onClick={() => onAppendTechnology({ name: tech, version: "" })}
                className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 px-2 py-1 text-xs font-medium text-foreground transition-all cursor-pointer disabled:opacity-40"
              >
                <Plus className="size-2.5 text-muted-foreground" />
                {tech}
              </button>
            ))}

            <button
              type="button"
              disabled={
                submitting || technologyFields.length >= MAX_TECHNOLOGIES
              }
              onClick={() => onAppendTechnology({ name: "", version: "" })}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/15 hover:border-primary px-2 py-1 text-xs font-medium text-primary transition-all cursor-pointer disabled:opacity-40"
            >
              <Plus className="size-2.5 text-primary" />
              Add custom technology
            </button>
          </div>

          <FieldSet>
            <FieldLegend className="sr-only">Technologies</FieldLegend>

            {technologyFields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-6 text-center">
                <Cpu className="mx-auto size-7 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  No technologies specified yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Click any quick-add chip above or add custom runtimes, frameworks, or database versions to help others reproduce the issue.
                </p>
              </div>
            ) : (
              <FieldGroup className="gap-3">
                <AnimatePresence initial={false}>
                  {technologyFields.map((technology, index) => (
                    <motion.div
                      key={technology.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_auto] rounded-xl border border-border/60 bg-card/60 p-3"
                    >
                      <Field
                        data-invalid={Boolean(
                          errors.technologies?.[index]?.name,
                        )}
                        data-disabled={submitting || undefined}
                      >
                        <FieldLabel htmlFor={`problem-technology-${index}`} className="text-xs font-semibold text-foreground">
                          Technology Name
                          <span
                            aria-hidden="true"
                            className="text-destructive font-bold ml-0.5"
                          >
                            *
                          </span>
                        </FieldLabel>
                        <Input
                          id={`problem-technology-${index}`}
                          maxLength={100}
                          placeholder="e.g. Next.js, PostgreSQL"
                          aria-invalid={Boolean(
                            errors.technologies?.[index]?.name,
                          )}
                          aria-describedby={
                            errors.technologies?.[index]?.name
                              ? `problem-technology-${index}-error`
                              : undefined
                          }
                          required
                          disabled={submitting}
                          className={CONTROL_CLASS}
                          {...register(`technologies.${index}.name`)}
                        />
                        {errors.technologies?.[index]?.name?.message && (
                          <FieldError
                            id={`problem-technology-${index}-error`}
                          >
                            {errors.technologies[index]?.name?.message}
                          </FieldError>
                        )}
                      </Field>

                      <Field
                        data-invalid={Boolean(
                          errors.technologies?.[index]?.version,
                        )}
                        data-disabled={submitting || undefined}
                      >
                        <FieldLabel
                          htmlFor={`problem-technology-version-${index}`}
                          className="text-xs font-semibold text-foreground"
                        >
                          Version (optional)
                        </FieldLabel>
                        <Input
                          id={`problem-technology-version-${index}`}
                          maxLength={50}
                          placeholder="e.g. 15.1.0"
                          aria-invalid={Boolean(
                            errors.technologies?.[index]?.version,
                          )}
                          aria-describedby={
                            errors.technologies?.[index]?.version
                              ? `problem-technology-version-${index}-error`
                              : undefined
                          }
                          disabled={submitting}
                          className={CONTROL_CLASS}
                          {...register(`technologies.${index}.version`)}
                        />
                        {errors.technologies?.[index]?.version?.message && (
                          <FieldError
                            id={`problem-technology-version-${index}-error`}
                          >
                            {errors.technologies[index]?.version?.message}
                          </FieldError>
                        )}
                      </Field>

                      <div className="pt-5 sm:pt-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove technology ${index + 1}`}
                          disabled={submitting}
                          onClick={() => onRemoveTechnology(index)}
                          className="size-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </FieldGroup>
            )}

            {errors.technologies?.root?.message && (
              <FieldError>{errors.technologies.root.message}</FieldError>
            )}
          </FieldSet>
        </CardContent>
      </Card>
    </motion.div>
  );
}
