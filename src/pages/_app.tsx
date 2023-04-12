import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import {ClerkProvider, RedirectToSignIn, SignedIn, SignedOut} from "@clerk/nextjs";
import {useRouter} from "next/router";
import Head from "next/head";

export default function App({Component, pageProps}: AppProps) {
    const {pathname} = useRouter();

    return <>
        <Head>
            <title>Homework 2 To-Do List</title>
            <meta name="description" content="A simple to-do list application"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
        </Head>
        <ClerkProvider {...pageProps} signInUrl='/'>
            {pathname === '/' || pathname === '/sign-up' ? (
                <Component {...pageProps} />
            ) : (
                <>
                    <SignedIn>
                        <Component {...pageProps} />
                    </SignedIn>
                    <SignedOut>
                        <RedirectToSignIn redirectUrl='/todos'/>
                    </SignedOut>
                </>
            )}
        </ClerkProvider>
    </>
}
