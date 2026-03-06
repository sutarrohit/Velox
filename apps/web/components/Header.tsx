import { Activity } from "lucide-react";

export default function Header() {
    return (
        <div className='h-fit w-full sticky'>
            <header className='bg-bg-panel border-b border-border-strong sticky top-0 z-30'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                        <Activity className='w-5 h-5 text-chart-1' />
                        <span className='text-[18px] font-mono font-bold tracking-widest uppercase text-text-chart-1'>
                            VELOX
                        </span>
                    </div>

                    <nav className='hidden sm:flex space-x-6 text-sm font-bold group'>
                        <a
                            href='#'
                            className='text-xs font-mono text-chart-1 border-b-2 border-chart-1 px-1 py-4 uppercase tracking-wider'
                        >
                            News Feed
                        </a>
                        <a
                            href='#'
                            className='cursor-not-allowed text-xs font-mono text-text-secondary hover:text-text-chart-1 px-1 py-4 transition-colors uppercase tracking-wider'
                        >
                            Markets
                        </a>
                        <a
                            href='#'
                            className='cursor-not-allowed text-xs font-mono text-text-secondary hover:text-text-chart-1 px-1 py-4 transition-colors uppercase tracking-wider'
                        >
                            Portfolio
                        </a>
                    </nav>
                </div>
            </header>
        </div>
    );
}
