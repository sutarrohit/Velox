"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    const isNetworkError = error.message.includes("fetch") || error.message.includes("network");

    return (
        <div className='flex min-h-screen items-center justify-center bg-background'>
            <div className='flex flex-col items-center gap-6 p-8 max-w-md w-full mx-4'>
                <div className='rounded-full bg-destructive/10 p-4'>
                    <AlertCircle className='h-10 w-10 text-destructive' />
                </div>

                <div className='text-center space-y-2'>
                    <h2 className='font-mono text-xl font-semibold tracking-tight'>Something went wrong</h2>
                    <p className='font-mono text-sm text-muted-foreground'>
                        {isNetworkError
                            ? "Unable to connect to the server. Please check your internet connection."
                            : "An unexpected error occurred. Please try again."}
                    </p>
                    {process.env.NODE_ENV === "development" && (
                        <p className='font-mono text-xs text-muted-foreground mt-4 p-2 bg-muted rounded border'>
                            {error.message}
                        </p>
                    )}
                </div>

                <div className='flex gap-3 mt-4'>
                    <Button onClick={reset} variant='default' className='cursor-pointer'>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Try again
                    </Button>
                    <Link href='/'>
                        <Button variant='outline' className='cursor-pointer'>
                            <Home className='mr-2 h-4 w-4' />
                            Go home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
