import React from "react";
import type { NewsArticle } from "@/types";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ExternalLink, Globe } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface ArticleDetailProps {
    article: NewsArticle | null;
}

const ArticleDetail = ({ article }: ArticleDetailProps) => {
    if (!article) {
        return <div className='flex flex-1 w-full h-full border '>Article not found</div>;
    }

    return (
        <Card className='relative mx-auto w-full pt-0 h-full border'>
            <div className='w-full relative'>
                <div className='border-b'>
                    <Image
                        src={article.image ? article.image : "https://avatar.vercel.sh/shadcn1"}
                        alt='Event cover'
                        className='relative z-20 aspect-video w-full object-cover mask-b-from-7'
                        width={400}
                        height={400}
                    />
                </div>

                <div className='absolute bottom-0 z-20 flex flex-col gap-3 p-4'>
                    <Badge className='text-sm font-bold uppercase px-2 py-2 text-chart-1 bg-chart-5/50 border border-primary/50'>
                        {article.category}
                    </Badge>
                    <h1 className='text-4xl line-clamp-3 tracking-tight font-bold'>{article.headline}</h1>
                </div>
            </div>

            <CardHeader className='font-mono'>
                <CardTitle className='flex gap-5 flex-wrap items-center text-muted-foreground text-sm pt-2 pb-5 border-b'>
                    <div className='flex items-center uppercase tracking-wider'>
                        <Globe className='w-4 h-4 mr-2' />
                        {article.source}
                    </div>
                    <div className='flex items-center uppercase tracking-wider'>
                        <Clock className='w-4 h-4 mr-2' />
                        {timeAgo(article.datetime)}
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <p className='text-text-primary leading-relaxed whitespace-pre-line text-lg '>{article.summary}</p>
            </CardContent>

            <CardFooter className='h-full flex flex-col justify-end items-start w-full border-none'>
                <a
                    href={article.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border text-sm bg-black hover:bg-gray-900 transition-all focus:outline-none border-gray-600 uppercase tracking-wider group'
                >
                    Read Full Article on {article.source}
                    <ExternalLink className='max-w-4 h-4 ml-2  group-hover:text-primary transition-colors' />
                </a>
            </CardFooter>
        </Card>
    );
};

export default ArticleDetail;
