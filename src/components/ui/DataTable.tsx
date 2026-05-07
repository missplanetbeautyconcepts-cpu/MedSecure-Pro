import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: number | string }>({ 
  data, 
  columns, 
  onRowClick, 
  isLoading 
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="w-full h-12 bg-slate-50 border-b border-slate-100" />
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              {[...Array(columns.length)].map((_, j) => (
                <div key={j} className="h-4 bg-slate-100 rounded animate-pulse grow" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center h-64 border border-slate-100 rounded-lg bg-slate-50/50">
        <p className="text-sm font-medium text-slate-500">No records found</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={cn(
                  "px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr 
              key={item.id} 
              onClick={() => onRowClick?.(item)}
              className={cn(
                "transition-all duration-200",
                onRowClick ? "cursor-pointer hover:bg-slate-50/80" : "cursor-default"
              )}
            >
              {columns.map((col, idx) => (
                <td key={idx} className={cn("px-6 py-4 text-slate-600 font-medium", col.className)}>
                  {typeof col.accessor === "function" 
                    ? col.accessor(item) 
                    : (item[col.accessor] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
