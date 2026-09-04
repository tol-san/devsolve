import type { Metadata } from 'next'
import ProgramDetailPage from '@/components/programs/details/ProgramDynamicDetailPage'
import React from 'react'
import { getProgram } from '@/lib/seo/content'
import { pageMetadata } from '@/lib/seo/metadata'
import { SITE_NAME } from '@/lib/seo/site'
import { describe, humanizeEnum } from '@/lib/seo/text'

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const canonicalPath = `/programs/${id}`;
  const program = await getProgram(id);

  if (!program?.name) {
    return pageMetadata({
      title: 'Bug bounty program',
      description: `This program is not available on ${SITE_NAME}.`,
      path: canonicalPath,
      locale: lang,
      noIndex: true,
    });
  }

  const organization = program.organization?.name ?? program.organizationName;

  return pageMetadata({
    title: organization ? `${program.name} — ${organization}` : program.name,
    description: describe(
      program.description,
      `${humanizeEnum(program.engagementType) || 'Bug bounty'} program on ${SITE_NAME}.`,
    ),
    path: canonicalPath,
    locale: lang,
  });
}

export default function Page({ params }: PageProps) {
  return (
    <div className='min-h-screen max-w-[1280px] px-7 mx-auto'>
      <ProgramDetailPage params={params}/>
    </div>
  )
}
