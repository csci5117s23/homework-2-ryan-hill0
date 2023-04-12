import Head from 'next/head'
import {SignIn, useAuth} from "@clerk/nextjs";
import {useRouter} from "next/router";

export default function Home() {
    const {isSignedIn} = useAuth();
    const {push} = useRouter();

    if (isSignedIn) {
        push('/todos').finally();
    }

    return (
        <>
            <Head>
                <title>Homework 2 To-Do List</title>
                <meta name="description" content="A simple to-do list application"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
            </Head>
            <main className='w-full h-full flex flex-col gap-8 items-center justify-center'>
                <h1>Ryan&apos;s To-Do List App</h1>
                <SignIn />
            </main>
        </>
    )
}
