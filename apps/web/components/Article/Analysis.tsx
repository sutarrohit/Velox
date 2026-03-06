"use client";
import type { NewsArticle } from "@/types";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { summarizeArticleOptions } from "@/lib/apis/chat/chat-queries";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface AnalysisProps {
    article: NewsArticle | null;
}

const Analysis = ({ article }: AnalysisProps) => {
    if (!article) {
        return <div className='flex flex-1 w-full h-full items-center justify-center border  '>Article not found</div>;
    }

    console.log(article);
    const { data, isLoading, isError, error } = useQuery(summarizeArticleOptions(article));

    const sentimentConfig = {
        bullish: {
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            borderColor: "rgb(34 197 94 / 0.2)",
            bgColor: "rgb(34 197 94 / 0.1)",
            label: "Bullish"
        },
        bearish: {
            icon: TrendingDown,
            color: "text-red-400",
            bg: "bg-red-400/10",
            border: "border-red-400/20",
            borderColor: "rgb(248 113 113 / 0.2)",
            bgColor: "rgb(248 113 113 / 0.1)",
            label: "Bearish"
        },
        neutral: {
            icon: Minus,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            borderColor: "rgb(249 115 22 / 0.2)",
            bgColor: "rgb(249 115 22 / 0.1)",
            label: "Neutral"
        }
    };

    const sentiment = sentimentConfig[data?.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
    const SentimentIcon = sentiment.icon;

    return (
        <Card className='relative mx-auto w-full pt-0 h-full border'>
            <CardHeader className='font-mono p-0 '>
                <CardTitle className='flex gap-2 flex-wrap items-center text-primary font-bold text-md border-b p-4'>
                    <div className='size-2 rounded-full bg-primary animate-pulse blur-[0.5px]' />
                    AI ANALYSIS
                </CardTitle>
            </CardHeader>

            {isLoading ? (
                <CardContent className='flex items-center justify-center h-48'>
                    <div className='flex flex-col items-center gap-2'>
                        <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                        <p className='text-muted-foreground text-sm'>Analyzing article...</p>
                    </div>
                </CardContent>
            ) : isError ? (
                <CardContent className='flex items-center justify-center h-48'>
                    <div className='flex flex-col items-center gap-2 text-center'>
                        <p className='text-destructive text-sm font-medium'>Failed to analyze article</p>
                        <p className='text-muted-foreground text-xs'>
                            {(error as Error)?.message || "Something went wrong"}
                        </p>
                    </div>
                </CardContent>
            ) : (
                <CardContent>
                    <div className='flex flex-col gap-5'>
                        <p className='text-[26px] font-bold leading-tight whitespace-pre-line'>{article.summary}</p>

                        {/* sentimentReason */}
                        <div
                            className={cn("flex gap-4 p-4 border")}
                            style={{
                                borderColor: sentiment.borderColor,
                                backgroundColor: sentiment.bgColor
                            }}
                        >
                            <div
                                className='border size-fit p-1'
                                style={{
                                    borderColor: sentiment.borderColor,
                                    backgroundColor: sentiment.bgColor
                                }}
                            >
                                <SentimentIcon className={cn("w-5 h-5 mt-0.5", sentiment.color)} />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <p className={cn("text-sm font-bold uppercase", sentiment.color)}>{data?.sentiment}</p>
                                <p className='text-sm font-bold'>{data?.sentimentReason}</p>
                            </div>
                        </div>

                        <div className='flex flex-col gap-4'>
                            <h5 className='text-sm text-muted-foreground'>KEY TAKEAWAY</h5>
                            <div className='flex flex-col gap-2'>
                                {data?.bullets?.map((bullet: string, index: number) => {
                                    return (
                                        <p key={index} className='flex gap-4 items-center'>
                                            <CheckCircle2 className={cn("w-5 h-5 shrink-0 mt-0.5", sentiment.color)} />
                                            <span className='text-sm'>{bullet}</span>
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
            <CardFooter className='h-full flex flex-col gap-1 justify-end items-start w-full border-none'>
                <p className='uppercase tracking-wider text-gray-500'>Source</p>
                <div>
                    <Badge className='uppercase py-3 px-3 bg-black  text-white border border-gray-600 tracking-wider'>
                        {article.source}
                    </Badge>
                </div>
            </CardFooter>
        </Card>
    );
};

export default Analysis;
