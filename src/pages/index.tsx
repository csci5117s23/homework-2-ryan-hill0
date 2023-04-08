import Head from 'next/head'
import {SignIn} from "@clerk/nextjs";

export default function Home() {
    return (
        <>
            <Head>
                <title>Homework 2 To-Do List</title>
                <meta name="description" content="A simple to-do list application"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
            </Head>
            <main className='w-full h-full flex flex-col gap-8 items-center justify-center'>
                <h1>Ryan&lsquo;s To-Do List App</h1>
                <SignIn />
            </main>
        </>
    )
}
