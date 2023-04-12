import Layout from "@/components/Layout";
import Link from "next/link";

export default function Custom404() {
    return <Layout>
        <div className='flex flex-col items-center col-span-8 gap-2'>
            <h1>404 - Page Not Found</h1>
            <Link href='/todos' className='rounded-lg bg-blue-500 px-4 py-2'>Return to To-Dos</Link>
        </div>
    </Layout>;
}