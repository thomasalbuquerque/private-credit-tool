'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, Circle, Clock, FileX, Plus } from 'lucide-react';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import { getDueDiligenceByDealId, addFinding } from '@/services/dueDiligenceService';
import type { DueDiligence, Finding, FindingStatus, RiskLevel, Workstream } from '@/types';
import {
  cn,
  findingStatusBadgeVariant,
  getInitials,
  riskLevelAccent,
  riskLevelBadgeVariant,
  workstreamStatusBadgeVariant,
} from '@/lib/utils';

interface DueDiligenceTabProps {
  dealId: string;
}

interface FindingFormState {
  title: string;
  description: string;
  riskLevel: RiskLevel;
  mitigation: string;
  owner: string;
  status: FindingStatus;
}

const RISK_LEVEL_OPTIONS: RiskLevel[] = ['High', 'Medium', 'Low'];
const FINDING_STATUS_OPTIONS: FindingStatus[] = ['Open', 'Mitigated', 'Monitoring'];

const EMPTY_FORM: FindingFormState = {
  title: '',
  description: '',
  riskLevel: 'Medium',
  mitigation: '',
  owner: '',
  status: 'Open',
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

function WorkstreamIcon({ status }: { status: Workstream['status'] }) {
  if (status === 'Complete') return <CheckCircle2 className='h-4 w-4 text-emerald-500' />;
  if (status === 'In Progress') return <Clock className='h-4 w-4 text-blue-500' />;
  return <Circle className='h-4 w-4 text-slate-300' />;
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className={cn('rounded-lg border border-slate-200 border-l-4 bg-white p-4', riskLevelAccent(finding.riskLevel))}>
      <p className='font-semibold text-slate-900'>{finding.title}</p>
      <p className='mt-1 line-clamp-2 text-sm text-slate-500'>{finding.description}</p>

      <div className='mt-3 flex flex-wrap items-center gap-2'>
        <Badge variant={riskLevelBadgeVariant(finding.riskLevel)}>{finding.riskLevel} Risk</Badge>
        <Badge variant={findingStatusBadgeVariant(finding.status)}>{finding.status}</Badge>
      </div>

      <div className='mt-3 rounded-lg bg-slate-50 px-3 py-2'>
        <p className='text-xs leading-relaxed text-slate-600'>
          <span className='font-medium text-slate-700'>Mitigation: </span>
          {finding.mitigation}
        </p>
      </div>

      <div className='mt-3 flex items-center gap-2'>
        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-600'>
          {getInitials(finding.owner)}
        </span>
        <span className='text-xs font-medium text-slate-600'>{finding.owner}</span>
      </div>
    </div>
  );
}

export default function DueDiligenceTab({ dealId }: DueDiligenceTabProps) {
  const [diligence, setDiligence] = useState<DueDiligence | undefined>(undefined);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FindingFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    getDueDiligenceByDealId(dealId).then((data) => {
      setDiligence(data);
      setFindings(data?.findings ?? []);
      setIsLoading(false);
    });
  }, [dealId]);

  const completeCount = useMemo(
    () => (diligence ? diligence.workstreams.filter((w) => w.status === 'Complete').length : 0),
    [diligence]
  );

  const canSubmit = form.title.trim() !== '';

  async function handleAddFinding(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    // POST /api/due-diligence/findings — currently mocked, persists to in-memory array
    const created = await addFinding({
      dealId,
      title: form.title,
      description: form.description,
      riskLevel: form.riskLevel,
      mitigation: form.mitigation,
      owner: form.owner,
      status: form.status,
    });

    setFindings((prev) => [created, ...prev]);

    setIsSubmitting(false);
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setToastOpen(true);
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-56' />
        <Skeleton className='h-96' />
      </div>
    );
  }

  if (!diligence) {
    return (
      <Card className='flex flex-col items-center gap-2 py-16 text-center'>
        <FileX className='h-8 w-8 text-slate-300' />
        <p className='text-sm font-medium text-slate-500'>No due diligence data recorded for this deal</p>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* ── Workstream Status ── */}
      <Card title='Diligence Workstreams'>
        <div className='-mx-5 -mt-5 overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-100 bg-slate-50/50'>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>
                  Workstream
                </th>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>
                  Status
                </th>
                <th className='px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500'>
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {diligence.workstreams.map((workstream, i) => (
                <tr
                  key={workstream.name}
                  className={cn(i < diligence.workstreams.length - 1 && 'border-b border-slate-100')}
                >
                  <td className='px-5 py-3.5 font-medium text-slate-900'>{workstream.name}</td>
                  <td className='px-5 py-3.5'>
                    <Badge variant={workstreamStatusBadgeVariant(workstream.status)}>{workstream.status}</Badge>
                  </td>
                  <td className='px-5 py-3.5 text-right'>
                    <WorkstreamIcon status={workstream.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mt-4 flex items-center gap-3'>
          <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100'>
            <div
              className='h-full rounded-full bg-indigo-500'
              style={{ width: `${(completeCount / diligence.workstreams.length) * 100}%` }}
            />
          </div>
          <span className='shrink-0 text-xs font-medium text-slate-500'>
            {completeCount} of {diligence.workstreams.length} workstreams complete
          </span>
        </div>
      </Card>

      {/* ── Key Findings ── */}
      <Card>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-500'>Key Findings</h3>
          <Button size='sm' onClick={() => setIsModalOpen(true)}>
            <Plus className='h-3.5 w-3.5' />
            Add Finding
          </Button>
        </div>

        {findings.length === 0 ? (
          <p className='text-sm text-slate-400'>No findings recorded yet.</p>
        ) : (
          <div className='space-y-3'>
            {findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        )}
      </Card>

      {/* ── Add Finding Modal ── */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Add Finding'
        footer={
          <>
            <Button variant='secondary' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFinding} loading={isSubmitting} disabled={!canSubmit}>
              Add Finding
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddFinding} className='space-y-4'>
          <div>
            <label className='mb-1 block text-xs font-medium text-slate-600'>Title</label>
            <input
              type='text'
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-slate-600'>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-slate-600'>Risk Level</label>
            <select
              value={form.riskLevel}
              onChange={(e) => setForm((f) => ({ ...f, riskLevel: e.target.value as RiskLevel }))}
              className={cn(inputClass, 'bg-white')}
            >
              {RISK_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-slate-600'>Mitigation</label>
            <textarea
              rows={3}
              value={form.mitigation}
              onChange={(e) => setForm((f) => ({ ...f, mitigation: e.target.value }))}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-slate-600'>Owner</label>
            <input
              type='text'
              value={form.owner}
              onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-slate-600'>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FindingStatus }))}
              className={cn(inputClass, 'bg-white')}
            >
              {FINDING_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Toast open={toastOpen} message='Finding added successfully.' onClose={() => setToastOpen(false)} />
    </div>
  );
}
