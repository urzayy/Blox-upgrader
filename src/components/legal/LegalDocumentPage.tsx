import { navigateApp } from '../../lib/appRoute';

export interface LegalSubsection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
}

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
  subsections?: LegalSubsection[];
}

interface Props {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalDocumentPage({ title, lastUpdated, sections }: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-12 sm:px-6 lg:py-10">
      <button
        type="button"
        onClick={() => navigateApp('main')}
        className="mb-6 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.12em] text-white/40 transition hover:text-white/70"
      >
        ← Back
      </button>

      <header className="mb-8 border-b border-white/10 pb-6">
        <h1 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-white/45">
          Last updated: {lastUpdated}
        </p>
      </header>

      <article className="space-y-8">
        {sections.map(section => (
          <section key={section.title}>
            <h2 className="font-display text-base font-bold text-gold sm:text-lg">
              {section.title}
            </h2>

            {section.paragraphs?.map(paragraph => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-white/70">
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/70">
                {section.bullets.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {section.subsections?.map(subsection => (
              <div key={subsection.title} className="mt-5 border-l border-white/10 pl-4">
                <h3 className="font-display text-sm font-bold text-white/85 sm:text-base">
                  {subsection.title}
                </h3>

                {subsection.paragraphs?.map(paragraph => (
                  <p key={paragraph} className="mt-3 text-sm leading-relaxed text-white/70">
                    {paragraph}
                  </p>
                ))}

                {subsection.bullets && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/70">
                    {subsection.bullets.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}

                {subsection.closingParagraphs?.map(paragraph => (
                  <p key={paragraph} className="mt-3 text-sm leading-relaxed text-white/70">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}

            {section.closingParagraphs?.map(paragraph => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-white/70">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
