import ArticleDetail from "@/components/Article/ArticleDetail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getQueryClient } from "@/lib/getQueryClient";
import { getNewsOptions } from "@/lib/apis/news/news-queries";
import type { NewsArticle } from "@/types";

async function getArticleData(id: string): Promise<NewsArticle | null> {
    const queryClient = getQueryClient();

    const categories = ["general", "forex", "crypto", "merger"] as const;

    for (const category of categories) {
        await queryClient.prefetchInfiniteQuery(getNewsOptions({ category, limit: 100 }));
    }

    for (const category of categories) {
        const data = queryClient.getQueryData<{ pages: { data: NewsArticle[] }[] }>(
            getNewsOptions({ category }).queryKey
        );

        if (data?.pages) {
            for (const page of data.pages) {
                const article = page.data.find((a: NewsArticle) => a.id === id);
                if (article) {
                    return article;
                }
            }
        }
    }

    return null;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const article = await getArticleData(id);

    return (
        <div className='flex min-h-screen items-center justify-center'>
            <main className='flex flex-col  min-h-screen w-full border border-pink-400'>
                <div className='h-fit w-full'>
                    <header className=' border-b border-strong sticky top-0 z-30'>
                        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center'>
                            <Link
                                href='/'
                                className='inline-flex items-center text-sm font-mono hover:text-primary font-bold transition-colors group uppercase tracking-wider'
                            >
                                <ArrowLeft className='w-4 h-4 mr-2 text-text-muted group-hover:text-text-primary transition-colors' />
                                Back to Feed
                            </Link>
                        </div>
                    </header>
                </div>

                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 size-full items-center border grid grid-cols-2 flex-1 gap-4 py-8'>
                    <ArticleDetail article={article} />
                    <ArticleDetail article={article} />
                    {/* <ArticleDetail article={article} /> */}
                </div>
            </main>
        </div>
    );
}
