import { motion } from 'motion/react';
import { DataTable } from '@/components/ui/data-table';

const sampleColumns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status', variant: 'badge' as const },
  { key: 'role', label: 'Role' },
];
const sampleData = [
  { name: 'Alice', status: 'Active', role: 'Admin' },
  { name: 'Bob', status: 'Pending', role: 'User' },
  { name: 'Carol', status: 'Inactive', role: 'Editor' },
];

/* ── Theme variants ──────────────────────────────────────────────────────── */

/** Dark themed data table — sortable with striped rows. */
export function DataTableDarkStriped() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#1f2937]/30',
    'rounded-sm',
    'text-sm',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[38px]',
    'px-[14px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <DataTable
      columns={sampleColumns}
      data={sampleData}
      sortable={true}
      striped={true}
      size="md"
      headerBg="#2a2a2e"
      rowBg="#3a3a3f"
      stripedBg="#2a2a2e"
      textColor="#e2e8f0"
      headerTextColor="#ffffff"
      borderColor="#5a5a64"
      badgeColors={{
        Active: { bg: '#65a30d20', text: '#65a30d' },
        Pending: { bg: '#ea580c20', text: '#ea580c' },
        Inactive: { bg: '#ef444420', text: '#ef4444' },
      }}
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Amber-accented data table — compact size with amber header. */
export function DataTableAmberCompact() {
  const rootClassName = [
    'bg-[var(--j6-neutral-0-light)]',
    'border-solid',
    'border',
    'border-[var(--j6-amber-600-light)]/20',
    'rounded-sm',
    'text-xs',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <DataTable
      columns={sampleColumns}
      data={sampleData}
      sortable={true}
      striped={false}
      size="sm"
      headerBg="var(--j6-amber-400-light)"
      headerTextColor="var(--j6-neutral-600-dark)"
      textColor="var(--j6-neutral-400-light)"
      borderColor="rgba(196, 128, 10, 0.2)"
      badgeColors={{
        Active: { bg: '#059669/20', text: '#059669' },
        Pending: { bg: '#ca8a04/20', text: '#ca8a04' },
        Inactive: { bg: '#ef4444/20', text: '#ef4444' },
      }}
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/* ── Motion variants ─────────────────────────────────────────────────────── */

/** Data table with blur-fade entry animation. */
export function DataTableEntryBlurFade() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#5a5a64]',
    'rounded-sm',
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { filter: 'blur(4px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.65, ease: 'easeInOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        sortable={true}
        striped={true}
        size="md"
        headerBg="#1a1a1d"
        rowBg="#2a2a2e"
        stripedBg="#1a1a1d"
        textColor="#e2e8f0"
        headerTextColor="#fafaf9"
        borderColor="#3a3a3f"
        badgeColors={{
          Active: { bg: '#34d39920', text: '#34d399' },
          Pending: { bg: '#facc1520', text: '#facc15' },
          Inactive: { bg: '#fb718520', text: '#fb7185' },
        }}
        className={rootClassName}
        style={rootStyle}
      />
    </motion.div>
  );
}
