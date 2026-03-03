export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className='flex min-h-screen items-center justify-center'>
            <main className='flex flex-col min-h-screen w-full'>
              


            </main>
        </div>
    );
}
