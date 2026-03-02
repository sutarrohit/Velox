"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { NewsCard } from "@/components/NewsCard";
import { NewsCategory } from "@/types";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { getNewsOptions } from "@/lib/apis/news/news-queries";

const NewsFeed = () => {
    const [category, setCategory] = useState<NewsCategory>("general");
    const [searchQuery, setSearchQuery] = useState("");

    const { ref, inView } = useInView();

    const { data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
        getNewsOptions({ category })
    );

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const filteredArticles = data?.pages.filter((data) =>
        data?.data[0]?.headline.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mt-10 border'>
            {error && (
                <div className='bg-bg-panel border border-accent-red rounded p-4 flex items-center text-accent-red mb-6 font-mono text-sm'>
                    <AlertCircle className='h-4 w-4 mr-3' />
                    <p>ERR_FETCH_FAILED: Unable to load news stream.</p>
                </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {filteredArticles?.map((page) =>
                    page.data.map((article) => <NewsCard key={article.id} article={article} category={category} />)
                )}
            </div>

            <div ref={ref} className='flex justify-center py-8'>
                {isFetchingNextPage && (
                    <div className='flex items-center text-gray-400'>
                        <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                        <span className='font-mono text-sm'>Loading more...</span>
                    </div>
                )}
                {!hasNextPage && !isFetchingNextPage && data?.pages[0]?.data?.length > 0 && (
                    <span className='font-mono text-sm text-gray-500'>You've reached the end</span>
                )}
            </div>

            {isFetching && !isFetchingNextPage && (
                <div className='text-center py-2'>
                    <span className='font-mono text-sm text-gray-500'>Background updating...</span>
                </div>
            )}
        </div>
    );
};

export default NewsFeed;
