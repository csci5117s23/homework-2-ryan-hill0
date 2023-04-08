import {SignUp} from "@clerk/nextjs";

export default function SignUpPage() {
    return <main className='w-full h-full flex flex-col gap-8 items-center justify-center'>
        <SignUp />
    </main>
}