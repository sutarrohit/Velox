import { NewsCategory } from "@/types/index.js";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
    activeCategory: NewsCategory;
    onSelectCategory: (category: NewsCategory) => void;
}

const CATEGORIES = [
    { id: "general", label: "All" },
    { id: "crypto", label: "Crypto" },
    { id: "forex", label: "Forex" },
    { id: "merger", label: "Mergers & Acquisitions" }
];

export function CategoryFilter({ activeCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className='flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar space-x-2'>
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id as NewsCategory)}
                    className={cn(
                        "cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border rounded-sm",
                        activeCategory === cat.id ? "bg-primary/40 text-chart-1" : "bg-muted sidebar-ring"
                    )}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
}
