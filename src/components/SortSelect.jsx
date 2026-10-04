import { ArrowUpDown } from "lucide-react";

export default function SortSelect({ filters }) {
  return (
    <label className="sortsel">
      <ArrowUpDown size={16} aria-hidden="true" />
      <select value={filters.sort} onChange={(e) => filters.setSort(e.target.value)} aria-label="Sort courts">
        <option value="name">A to Z</option>
        <option value="open">Open first</option>
        <option value="near">Nearest to me</option>
      </select>
    </label>
  );
}
