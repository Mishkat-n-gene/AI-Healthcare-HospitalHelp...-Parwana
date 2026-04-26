'use client'

import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

export type Column<T> = {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  sortValue?: (row: T) => string | number
}

export function DataTable<T>({
  columns,
  data,
  sortable,
  paginated,
  pageSize = 10,
  className
}: {
  columns: Column<T>[]
  data: T[]
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
  className?: string
}) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sortable || !sort) return data
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return data
    const copy = [...data]
    copy.sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      if (va < vb) return sort.dir === 'asc' ? -1 : 1
      if (va > vb) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [columns, data, sort, sortable])

  const totalPages = paginated ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1
  const pageData = paginated ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted

  return (
    <div className={cn('rounded-2xl border bg-[color:var(--color-bg-card)]/60', className)}>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-[color:var(--color-bg-card)]/80 backdrop-blur">
            <tr className="border-b">
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-3 text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  <button
                    type="button"
                    className={cn('focus-ring inline-flex items-center gap-2 rounded-md', sortable && c.sortValue ? 'hover:text-[color:var(--color-text)]' : 'cursor-default')}
                    onClick={() => {
                      if (!sortable || !c.sortValue) return
                      setSort((prev) => {
                        if (!prev || prev.key !== c.key) return { key: c.key, dir: 'desc' }
                        return { key: c.key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
                      })
                    }}
                    aria-label={sortable ? `Sort by ${c.header}` : c.header}
                  >
                    {c.header}
                    {sortable && sort?.key === c.key ? <span className="text-[10px]">{sort.dir === 'asc' ? '↑' : '↓'}</span> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr key={idx} className="border-b last:border-b-0 hover:bg-white/5">
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {!pageData.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[color:var(--color-text-muted)]" colSpan={columns.length}>
                  No rows.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {paginated ? (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-xs text-[color:var(--color-text-muted)]">
            Page <span className="font-mono">{page}</span> of <span className="font-mono">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="focus-ring rounded-lg border px-3 py-1.5 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="focus-ring rounded-lg border px-3 py-1.5 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

