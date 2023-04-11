import {PropsWithChildren} from "react";
import {UserButton} from "@clerk/nextjs";

export default function Layout(props: PropsWithChildren) {
    return <main className='w-full h-full flex flex-col gap-2 p-2 bg-gray-200'>
        <header className='flex justify-between'>
            <h1>Ryan&apos;s To-Do List App</h1>
            <UserButton afterSignOutUrl='/' signInUrl='/' showName={true}/>
        </header>
        <div className='flex-grow grid grid-cols-8'>
            {props.children}
        </div>
    </main>;
}