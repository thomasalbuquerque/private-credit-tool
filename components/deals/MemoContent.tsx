import Badge from '@/components/ui/Badge';
import type { Finding } from '@/types';
import { cn, riskLevelAccent, riskLevelBadgeVariant } from '@/lib/utils';

interface MemoContentProps {
  content: string;
  findings: Finding[];
}

interface Section {
  heading: string | null;
  lines: string[];
}

type Block = { type: 'paragraph'; text: string } | { type: 'list'; items: string[] };

function parseSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let current: Section = { heading: null, lines: [] };

  for (const line of lines) {
    const match = line.match(/^##\s+(.*)$/);
    if (match) {
      sections.push(current);
      current = { heading: match[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  return sections.filter((s) => s.heading !== null || s.lines.some((l) => l.trim() !== ''));
}

function isBulletLine(line: string): boolean {
  return /^[-*]\s+/.test(line.trim());
}

function buildBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ').trim() });
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      flushParagraph();
      flushList();
    } else if (isBulletLine(line)) {
      flushParagraph();
      listItems.push(line.replace(/^[-*]\s+/, ''));
    } else {
      flushList();
      paragraphLines.push(line);
    }
  }
  flushParagraph();
  flushList();

  return blocks;
}

function KeyRisksSection({ lines, findings }: { lines: string[]; findings: Finding[] }) {
  const items = lines.map((l) => l.trim().replace(/^[-*]\s+/, '')).filter(Boolean);

  return (
    <div className='space-y-2'>
      {items.map((text, i) => {
        const finding = findings.find((f) => text.includes(f.title));

        if (finding) {
          return (
            <div
              key={i}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg border border-slate-200 border-l-4 bg-slate-50 px-3 py-2',
                riskLevelAccent(finding.riskLevel)
              )}
            >
              <span className='text-sm leading-relaxed text-slate-700'>{text}</span>
              <Badge variant={riskLevelBadgeVariant(finding.riskLevel)}>{finding.riskLevel} Risk</Badge>
            </div>
          );
        }

        return (
          <p key={i} className='text-sm leading-relaxed text-slate-700'>
            {text}
          </p>
        );
      })}
    </div>
  );
}

export default function MemoContent({ content, findings }: MemoContentProps) {
  const sections = parseSections(content);

  return (
    <div className='mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white px-8 py-10 shadow-sm'>
      <div className='space-y-8'>
        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500'>
                {section.heading}
              </h3>
            )}

            {section.heading === 'Key Risks' ? (
              <KeyRisksSection lines={section.lines} findings={findings} />
            ) : (
              <div className='space-y-3'>
                {buildBlocks(section.lines).map((block, j) =>
                  block.type === 'list' ? (
                    <ul key={j} className='list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700'>
                      {block.items.map((item, k) => (
                        <li key={k}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j} className='text-sm leading-relaxed text-slate-700'>
                      {block.text}
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
