import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import {ClerkProvider, RedirectToSignIn, SignedIn, SignedOut} from "@clerk/nextjs";
import {useRouter} from "next/router";

export default function App({Component, pageProps}: AppProps) {
    const {pathname} = useRouter();

    return <ClerkProvider {...pageProps} signInUrl='/'>
        {pathname === '/' || pathname === '/sign-up' ? (
            <Component {...pageProps} />
        ) : (
            <>
                <SignedIn>
                    <Component {...pageProps} />
                </SignedIn>
                <SignedOut>
                    <RedirectToSignIn redirectUrl='/todos' />
                </SignedOut>
            </>
        )}
    </ClerkProvider>
}
