import {PropsWithChildren} from "react";
import Layout from "@/components/Layout";
import {useRouter} from "next/router";

export type TodosNavigationContainerProps = {
    containerClassName?: string;
}

export default function TodosNavigationContainer(props: PropsWithChildren<TodosNavigationContainerProps>) {
    const {pathname, push} = useRouter();

    return <Layout>
        <div className='flex flex-col w-full h-full p-2'>
            <button
                className={`${pathname === '/todos' ? 'bg-blue-500' : 'hover:bg-blue-300 transition-colors'} border-transparent rounded-lg px-8 py-4`}
                onClick={() => push('/todos')} disabled={pathname === '/todos'}>
                To-Do
            </button>
            <button
                className={`${pathname === '/done' ? 'bg-blue-500' : 'hover:bg-blue-300 transition-colors'} border-transparent rounded-lg px-8 py-4`}
                onClick={() => push('/done')} disabled={pathname === '/done'}>
                Done
            </button>
        </div>
        <div className={`flex flex-col col-span-7 bg-white gap-4 ${props.containerClassName}`}>
            {props.children}
        </div>
    </Layout>;
}