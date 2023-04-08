import Head from 'next/head'

export default function Home() {
    return (
        <>
            <Head>
                <title>Homework 2 To-Do List</title>
                <meta name="description" content="A simple to-do list application"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
            </Head>
            <main className='w-full h-full flex items-center justify-center'>
                Hello world!
            </main>
        </>
    )
}
