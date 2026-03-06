import Header from "@/components/Header";
import NewsFeed from "@/components/NewsFeed";
import { getNewsOptions } from "@/lib/apis/news/news-queries";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default function Home() {
    const queryClient = getQueryClient();
    void queryClient.prefetchInfiniteQuery(getNewsOptions());

    return (
        <div className='relative flex min-h-screen items-center justify-center'>
            <main className='flex flex-col min-h-screen w-full'>
                <Header />
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <div className='flex flex-start'>
                        <NewsFeed />
                    </div>
                </HydrationBoundary>
            </main>
        </div>
    );
}
