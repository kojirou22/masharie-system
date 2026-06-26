import { Suspense } from 'react';
import { AutoFilterForm } from '@/components/auto-filter-form';
import Link from 'next/link';
import {
  RegistryHeader,
  RegistryPageShell,
  RegistryStatBadge,
  registryFilterGridClass,
  registryInputClass,
  registryLabelClass,
  registrySelectClass,
} from '@/components/registry';
import { ProjectsTable } from '@/components/projects/projects-table';
import { getAdminUser } from '@/lib/auth/admin';
import { getProjects, type ProjectSortColumn, type SortDirection } from '@/lib/supabase/queries/projects';
import type { ProjectStatus, ProjectType } from '@/lib/types/database';

export const revalidate = 3600;

const STATUS_OPTIONS: ProjectStatus[] = [
  'Pending',
  'On Going',
  'On Hold',
  'Completed',
  'Cancelled',
];
const TYPE_OPTIONS: ProjectType[] = [
  'Mosque',
  'House',
  'Store',
  'School Room',
  'Tank',
  'Well',
  'School',
  'Food Aid',
  'Markaz',
];

const SORT_COLUMNS = [
  'batch_number',
  'project_number',
  'supervisor',
  'address',
  'type',
  'budget',
  'updated_at',
] as const satisfies readonly ProjectSortColumn[];

function isProjectSortColumn(value: string): value is ProjectSortColumn {
  return SORT_COLUMNS.includes(value as ProjectSortColumn);
}

function isSortDirection(value: string): value is SortDirection {
  return value === 'asc' || value === 'desc';
}

function getCurrentYear() {
  return String(new Date().getFullYear());
}

function FilterBar({
  currentSearch,
  currentStatus,
  currentType,
  currentBatchNumber,
  currentBatchYear,
  currentSort,
  currentDir,
}: {
  currentSearch: string;
  currentStatus: string;
  currentType: string;
  currentBatchNumber: string;
  currentBatchYear: string;
  currentSort: string;
  currentDir: string;
}) {
  return (
    <AutoFilterForm
      action="/projects"
      className={registryFilterGridClass}
    >
      {currentSort && currentDir && (
        <>
          <input type="hidden" name="sort" value={currentSort} />
          <input type="hidden" name="dir" value={currentDir} />
        </>
      )}
      <div className="sm:col-span-2 lg:col-span-1">
        <label
          htmlFor="search"
          className={registryLabelClass}
        >
          Search
        </label>
        <input
          id="search"
          name="search"
          type="text"
          defaultValue={currentSearch}
          placeholder="Project #, name, donor, supervisor, address..."
          className={registryInputClass}
        />
      </div>
      <div>
        <label
          htmlFor="status"
          className={registryLabelClass}
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className={`${registrySelectClass} lg:w-28`}
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="type"
          className={registryLabelClass}
        >
          Type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={currentType}
          className={`${registrySelectClass} lg:w-28`}
        >
          <option value="">All</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="batch_number"
          className={registryLabelClass}
        >
          Batch #
        </label>
        <input
          id="batch_number"
          name="batch_number"
          type="text"
          defaultValue={currentBatchNumber}
          placeholder="1"
          className={`${registryInputClass} lg:w-24`}
        />
      </div>
      <div>
        <label
          htmlFor="batch_year"
          className={registryLabelClass}
        >
          Year
        </label>
        <input
          id="batch_year"
          name="batch_year"
          type="number"
          defaultValue={currentBatchYear}
          placeholder="2026"
          className={`${registryInputClass} lg:w-28`}
        />
      </div>
    </AutoFilterForm>
  );
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const status = typeof params.status === 'string' ? params.status : '';
  const type = typeof params.type === 'string' ? params.type : '';
  const batch_number =
    typeof params.batch_number === 'string' ? params.batch_number : '';
  const rawBatchYear = typeof params.batch_year === 'string' ? params.batch_year : undefined;
  const batch_year = rawBatchYear ?? getCurrentYear();
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;
  const rawSort = typeof params.sort === 'string' ? params.sort : '';
  const rawDir = typeof params.dir === 'string' ? params.dir : '';
  const sort = isProjectSortColumn(rawSort) ? rawSort : 'updated_at';
  const dir = isSortDirection(rawDir) ? rawDir : 'desc';
  const hasExplicitSort = Boolean(
    rawSort && rawDir && isProjectSortColumn(rawSort) && isSortDirection(rawDir)
  );

  const [{ data: projects, count: total }, { isAdmin }] = await Promise.all([
    getProjects({
      search,
      status: status as ProjectStatus | undefined,
      type: type as ProjectType | undefined,
      batch_number,
      batch_year: batch_year ? parseInt(batch_year) || undefined : undefined,
      page,
      sort,
      dir,
    }),
    getAdminUser(),
  ]);

  return (
    <RegistryPageShell>
      <RegistryHeader
        title="Projects"
        stats={<RegistryStatBadge>{total} total projects</RegistryStatBadge>}
        actions={
          isAdmin && (
            <Link
              href="/projects/new"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
            >
              New Project
            </Link>
          )
        }
      >
        <FilterBar
          currentSearch={search}
          currentStatus={status}
          currentType={type}
          currentBatchNumber={batch_number}
          currentBatchYear={batch_year}
          currentSort={hasExplicitSort ? sort : ''}
          currentDir={hasExplicitSort ? dir : ''}
        />
      </RegistryHeader>

      <Suspense
        fallback={
          <div className="animate-pulse py-16 text-center text-blue-400">
            Loading projects...
          </div>
        }
      >
        <ProjectsTable
          projects={projects}
          total={total}
          page={page}
          currentSearch={search}
          currentStatus={status}
          currentType={type}
          currentBatchNumber={batch_number}
          currentBatchYear={batch_year}
          currentSort={hasExplicitSort ? sort : ''}
          currentDir={hasExplicitSort ? dir : ''}
        />
      </Suspense>
    </RegistryPageShell>
  );
}
