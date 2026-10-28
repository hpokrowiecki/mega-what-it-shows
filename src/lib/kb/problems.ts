// Splits a merged ticket into the problems it holds. Pages explain it; this file is what runs.

// causes.ts files a report by its tenant and channel. That cannot see a booking that moved by one
// day: the desk reads those by hand and lists them in desk-notes.json. A one-day move is not a
// flipped month, so it is a problem of its own. The desk counts a report where it is filed, so a
// one-day move stays counted under its cause and is counted again in a row of its own.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day-move';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day-move'];

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  // What intake tagged these reports as: tag → count.
  taggedAs: Record<string, number>;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For the one-day row: the causes its reports are filed (and counted) under.
  filedUnder: string[];
};

// One id, one report, and only the reports merged into this ticket.
export function mergedInto(reports: Report[], ticket: number): Report[] {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket);
}

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const filed = (r: Report): ProblemGroup['problem'] => causeOf(r, tenantOf(r)) ?? 'unplaced';
  const byCause = reports.reduce<Map<ProblemGroup['problem'], Report[]>>(
    (m, r) => new Map(m).set(filed(r), [...(m.get(filed(r)) ?? []), r]),
    new Map(),
  );
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  const rows: [ProblemGroup['problem'], Report[]][] = [
    ...byCause.entries(),
    ...(moved.length ? [['one-day-move', moved] as [ProblemGroup['problem'], Report[]]] : []),
  ];
  return rows
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        taggedAs: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}),
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
        filedUnder: problem === 'one-day-move' ? [...new Set(rs.map(filed))] : [],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
