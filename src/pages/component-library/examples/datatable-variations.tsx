import { motion } from 'motion/react';
import { DataTable } from '@/components/ui/data-table';

const interFont = "'Inter', system-ui, sans-serif";

const sampleColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', variant: 'badge' as const, sortable: true },
  { key: 'role', label: 'Role', sortable: true },
];

const sampleData = [
  { name: 'Alice Chen', status: 'Active', role: 'Admin' },
  { name: 'Bob Martinez', status: 'Pending', role: 'Developer' },
  { name: 'Carol Johnson', status: 'Inactive', role: 'Designer' },
  { name: 'David Park', status: 'Active', role: 'Engineer' },
];

/* ── Theme variants ──────────────────────────────────────────────────────── */

/** Dark themed data table — sortable with striped rows. */
export function DataTableDarkStriped() {
  return (
    <DataTable
      columns={sampleColumns}
      data={sampleData}
      sortable={true}
      striped={true}
      size="md"
      headerBg="#1a1a1d"
      rowBg="#111113"
      stripedBg="#141416"
      textColor="#e2e8f0"
      headerTextColor="#f0ede8"
      borderColor="#2a2a2e"
      badgeColors={{
        Active: { bg: '#10b98120', text: '#34d399' },
        Pending: { bg: '#f59e0b20', text: '#fbbf24' },
        Inactive: { bg: '#ef444420', text: '#f87171' },
      }}
      className="rounded-xl border border-[#2a2a2e] overflow-hidden"
      style={{ fontFamily: interFont }}
    />
  );
}

/** Amber-accented data table — compact size with amber header. */
export function DataTableAmberCompact() {
  return (
    <DataTable
      columns={sampleColumns}
      data={sampleData}
      sortable={true}
      striped={false}
      size="sm"
      headerBg="#f5a623"
      headerTextColor="#0a0a0b"
      rowBg="#111113"
      textColor="#e2e8f0"
      borderColor="#2a2a2e"
      badgeColors={{
        Active: { bg: '#10b98120', text: '#34d399' },
        Pending: { bg: '#f59e0b20', text: '#fbbf24' },
        Inactive: { bg: '#ef444420', text: '#f87171' },
      }}
      className="rounded-lg border border-[#2a2a2e] overflow-hidden"
      style={{ fontFamily: interFont }}
    />
  );
}

/* ── Motion variants ─────────────────────────────────────────────────────── */

/** Data table with blur-fade entry animation. */
export function DataTableEntryBlurFade() {
  const motionProps = {
    initial: { filter: 'blur(6px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.65, ease: 'easeOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        sortable={true}
        striped={true}
        size="md"
        headerBg="#141416"
        rowBg="#0f0f11"
        stripedBg="#131315"
        textColor="#e2e8f0"
        headerTextColor="#f0ede8"
        borderColor="#1e1e22"
        badgeColors={{
          Active: { bg: '#10b98120', text: '#34d399' },
          Pending: { bg: '#f59e0b20', text: '#fbbf24' },
          Inactive: { bg: '#ef444420', text: '#f87171' },
        }}
        className="rounded-xl border border-[#1e1e22] overflow-hidden"
        style={{ fontFamily: interFont }}
      />
    </motion.div>
  );
}
