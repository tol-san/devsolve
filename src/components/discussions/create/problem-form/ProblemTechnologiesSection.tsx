"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
      <Card className={CARD_CLASS} aria-labelledby="problem-environment-heading">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5 font-mono text-xs">
              02
            </Badge>
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle>
                <h2
                  id="problem-environment-heading"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  Technologies
                </h2>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                The stack this problem is about. Optional, and how people filtering by technology will find it.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <FieldSet>
            <FieldLegend className="sr-only">Technologies</FieldLegend>

            {technologyFields.length === 0 ? (
              <FieldDescription>
                No technologies added. Add one when a runtime, framework, database, or version helps reproduce the issue.
              </FieldDescription>
            ) : (
              <FieldGroup className="gap-4">
                <AnimatePresence initial={false}>
                  {technologyFields.map((technology, index) => (
                    <motion.div
                      key={technology.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_auto]"
                    >
                      <Field
                        data-invalid={Boolean(
                          errors.technologies?.[index]?.name,
                        )}
                        data-disabled={submitting || undefined}
                      >
                        <FieldLabel htmlFor={`problem-technology-${index}`}>
                          Technology
                          <span
                            aria-hidden="true"
                            className="text-destructive font-bold ml-0.5"
                          >
                            *
                          </span>
                          <span className="sr-only"> (required)</span>
                        </FieldLabel>
                        <Input
                          id={`problem-technology-${index}`}
                          maxLength={100}
                          placeholder="e.g. Next.js"
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
                        <FieldError id={`problem-technology-${index}-error`}>
                          {errors.technologies?.[index]?.name?.message}
                        </FieldError>
                      </Field>

                      <Field
                        data-invalid={Boolean(
                          errors.technologies?.[index]?.version,
                        )}
                        data-disabled={submitting || undefined}
                      >
                        <FieldLabel htmlFor={`problem-version-${index}`}>
                          Version
                        </FieldLabel>
                        <Input
                          id={`problem-version-${index}`}
                          maxLength={50}
                          placeholder="e.g. 16.2.10"
                          aria-invalid={Boolean(
                            errors.technologies?.[index]?.version,
                          )}
                          aria-describedby={
                            errors.technologies?.[index]?.version
                              ? `problem-version-${index}-error`
                              : undefined
                          }
                          disabled={submitting}
                          className={CONTROL_CLASS}
                          {...register(`technologies.${index}.version`)}
                        />
                        <FieldError id={`problem-version-${index}-error`}>
                          {errors.technologies?.[index]?.version?.message}
                        </FieldError>
                      </Field>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-lg"
                        aria-label={`Remove technology ${index + 1}`}
                        disabled={submitting}
                        onClick={() => onRemoveTechnology(index)}
                        className="justify-self-end rounded-xl sm:mt-7 cursor-pointer"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </FieldGroup>
            )}

            <FieldError>{errors.technologies?.message}</FieldError>
          </FieldSet>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <FieldDescription>
            {technologyFields.length}/{MAX_TECHNOLOGIES} technologies
          </FieldDescription>
          <Button
            type="button"
            variant="outline"
            disabled={
              submitting || technologyFields.length >= MAX_TECHNOLOGIES
            }
            onClick={() => onAppendTechnology({ name: "", version: "" })}
            className="w-full rounded-xl sm:w-auto cursor-pointer"
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add technology
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
