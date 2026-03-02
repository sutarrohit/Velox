import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <div className='relative w-full max-w-md'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-4 w-4 text-text-muted' />
            </div>
            <input
                type='text'
                className='block w-full pl-9 pr-3 py-1.5 border border-border-subtle rounded bg-bg-panel text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue sm:text-xs font-mono transition-colors'
                placeholder='SEARCH HEADLINES...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}
