import Head from 'next/head'
import {SignIn, useAuth} from "@clerk/nextjs";
import {useRouter} from "next/router";

export default function Home() {
    const {isSignedIn} = useAuth();
    const {push} = useRouter();

    if (isSignedIn) {
        push('/todos').finally();
    }

    return <main className='w-full h-full flex flex-col gap-8 items-center justify-center'>
        <h1>Ryan&apos;s To-Do List App</h1>
        <SignIn/>
    </main>;
}
