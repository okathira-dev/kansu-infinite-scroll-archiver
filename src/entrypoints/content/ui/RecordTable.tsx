import { ArrowDownAZIcon, ArrowUpAZIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExtractedRecord, SortOrder } from "@/lib/types";

interface RecordTableProps {
  records: ExtractedRecord[];
  fieldNames: string[];
  sortBy: string;
  sortOrder: SortOrder;
  onSortBy: (fieldName: string) => void;
}

export function RecordTable({
  records,
  fieldNames,
  sortBy,
  sortOrder,
  onSortBy,
}: RecordTableProps) {
  if (fieldNames.length === 0) {
    return <p className="text-sm text-muted-foreground">表示対象フィールドがありません。</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {fieldNames.map((fieldName) => (
              <TableHead key={fieldName}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => onSortBy(fieldName)}
                >
                  {fieldName}
                  {sortBy === fieldName &&
                    (sortOrder === "asc" ? (
                      <ArrowUpAZIcon className="ml-1 size-4" />
                    ) : (
                      <ArrowDownAZIcon className="ml-1 size-4" />
                    ))}
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={fieldNames.length} className="text-center text-muted-foreground">
                検索結果がありません
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={`${record.serviceId}:${record.uniqueKey}`}>
                {fieldNames.map((fieldName) => (
                  <TableCell key={fieldName}>{record.fieldValues[fieldName]?.raw ?? ""}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
