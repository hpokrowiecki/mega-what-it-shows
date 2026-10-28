<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import filed from '#lib/data/tickets-4471.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, mergedInto } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  type Filed = { number: number; url: string; outcome: string; why: string } | null;

  const rows = reports as Report[];
  const merged = $derived(mergedInto(rows, ticket));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  // The export comes in overlapping pages: rows beyond one per id.
  const repeated = $derived(rows.filter((r) => r.mergedInto === ticket).length - merged.length);
  const ticketFor = (problem: string): Filed => (filed.tickets as Record<string, Filed>)[problem] ?? null;
  const tags = (g: { taggedAs: Record<string, number> }) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'} ·
  {repeated} repeated export rows counted once
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const t = ticketFor(g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td class="tags">{tags(g)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if t}<a href={t.url}>{filed.repo}#{t.number}</a>{:else}<span class="none">no ticket yet</span>{/if}
        </td>
        <td>
          {#if t}<b class:none={t.outcome === 'open'}>{t.outcome}</b><br /><span class="tags">{t.why}</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">State from the {filed.update}.</p>

{#each groups.filter((g) => g.filedUnder.length) as g (g.problem)}
  <p class="note">
    The {g.reports.length} <code>{g.problem}</code> reports are filed under
    <code>{g.filedUnder.join(', ')}</code> and counted there too, as the desk counts.
  </p>
{/each}

<style>
  .note { color: var(--muted); font-size: 0.85em; }
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
