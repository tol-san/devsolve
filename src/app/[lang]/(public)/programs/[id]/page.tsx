import type { Metadata } from 'next'
import ProgramDetailPage from '@/components/programs/details/ProgramDynamicDetailPage'
import React from 'react'
import { getProgram } from '@/lib/seo/content'
import { JsonLd, breadcrumbSchema, programSchema } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'
import { SITE_NAME } from '@/lib/seo/site'
import { describe, humanizeEnum } from '@/lib/seo/text'

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const path = `/programs/${id}`;
  const program = await getProgram(id);

  // Private and unpublished programs are refused upstream, and stay unindexed.
  if (!program?.name) {
    return pageMetadata({
      title: 'Bug bounty program',
      description: `This program is not available on ${SITE_NAME}.`,
      path,
      locale: lang,
      noIndex: true,
    });
  }

  const organization = program.organization?.name ?? program.organizationName;
  const bounty =
    program.offersBounties && program.maximumBounty
      ? ` Rewards up to $${program.maximumBounty.toLocaleString('en-US')}.`
      : '';

  return pageMetadata({
    title: organization ? `${program.name} — ${organization}` : program.name,
    description: describe(
      program.description,
      `${humanizeEnum(program.engagementType) || 'Bug bounty'} program on ${SITE_NAME}.${bounty}`,
    ),
    path,
    locale: lang,
  });
}

export default async function page({ params }: PageProps) {
  const { id } = await params;
  const program = await getProgram(id);

  return (
    <div className='min-h-screen max-w-[1280px] px-7  mx-auto '>
      {program?.name ? (
        <JsonLd
          data={[
            programSchema(program, `/programs/${id}`),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Programs', path: '/programs' },
              { name: program.name, path: `/programs/${id}` },
            ]),
          ]}
        />
      ) : null}

      <ProgramDetailPage params={params}/>
    </div>
  )
}
