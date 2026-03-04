import { Activity } from "lucide-react";

export default function Header() {
    return (
        <div className='h-fit w-full'>
            <header className='bg-bg-panel border-b border-border-strong sticky top-0 z-30'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                        <Activity className='w-5 h-5 text-primary' />
                        <span className='text-[18px] font-mono font-bold tracking-widest uppercase text-text-primary'>
                            FinanceHub
                        </span>
                    </div>
                    <nav className='hidden sm:flex space-x-6 text-sm font-bold'>
                        <a
                            href='#'
                            className='text-xs font-mono text-primary border-b-2 border-primary px-1 py-4 uppercase tracking-wider'
                        >
                            News Feed
                        </a>
                        <a
                            href='#'
                            className='text-xs font-mono text-text-secondary hover:text-text-primary px-1 py-4 transition-colors uppercase tracking-wider'
                        >
                            Markets
                        </a>
                        <a
                            href='#'
                            className='text-xs font-mono text-text-secondary hover:text-text-primary px-1 py-4 transition-colors uppercase tracking-wider'
                        >
                            Portfolio
                        </a>
                    </nav>
                </div>
            </header>
        </div>
    );
}
