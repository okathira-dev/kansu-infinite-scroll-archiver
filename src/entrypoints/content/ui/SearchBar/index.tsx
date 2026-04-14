import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  keyword: string;
  targetFieldNames: string[];
  pageSize: number;
  availableFieldNames: string[];
  onKeywordChange: (keyword: string) => void;
  onToggleTargetField: (fieldName: string) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function SearchBar({
  keyword,
  targetFieldNames,
  pageSize,
  availableFieldNames,
  onKeywordChange,
  onToggleTargetField,
  onPageSizeChange,
}: SearchBarProps) {
  return (
    <section className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="kansu-search-input">キーワード検索</Label>
        <Input
          id="kansu-search-input"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="キーワードを入力"
          autoFocus
        />
      </div>

      <div className="grid gap-2">
        <Label>検索対象フィールド</Label>
        <div className="flex flex-wrap gap-2">
          {availableFieldNames.map((fieldName) => {
            const selected = targetFieldNames.includes(fieldName);
            return (
              <Button
                key={fieldName}
                type="button"
                size="sm"
                variant={selected ? "default" : "outline"}
                onClick={() => onToggleTargetField(fieldName)}
                aria-pressed={selected}
              >
                {fieldName}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid w-36 gap-2">
        <Label htmlFor="kansu-page-size">表示件数</Label>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            onPageSizeChange(Number(value));
          }}
        >
          <SelectTrigger id="kansu-page-size" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
