import {PropsWithChildren, useState} from "react";
import Layout from "@/components/Layout";
import {useAuth} from "@clerk/nextjs";
import * as backend from "@/backend/api-interop";
import {Category} from "@/backend/api-interop";
import NavigationButton from "@/components/NavigationButton";

export type TodosNavigationContainerProps = {
    containerClassName?: string;
    categoryNames: string[];
    addCategoryCallback: (newCategory: Category) => void;
    isViewingDoneTodos: boolean;
    category: Category | null;
}

export default function TodosNavigationContainer(props: PropsWithChildren<TodosNavigationContainerProps>) {
    const {getToken} = useAuth();

    const [newCategoryName, setNewCategoryName] = useState('');

    async function addCategory(sourceElement: HTMLButtonElement, categoryName: string) {
        sourceElement.disabled = true;
        sourceElement.textContent = 'Adding...';

        const token = await getToken({template: "codehooks"}).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (token === null) {
            sourceElement.textContent = 'Add';
            return;
        }

        const newCategory: backend.Category | null = await backend.addCategory(token, categoryName).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (newCategory === null) {
            sourceElement.textContent = 'Add';
            return;
        }
        setNewCategoryName("");
        props.addCategoryCallback(newCategory);

        sourceElement.disabled = false;
        sourceElement.textContent = 'Add';
    }

    return <Layout>
        <div className='flex flex-col w-full h-full p-2 col-span-2'>
            <b>Category:</b>
            <NavigationButton enabled={pathname => pathname === '/todos' || pathname === '/done'}
                              pathname={props.isViewingDoneTodos ? '/done' : '/todos'} content='All'/>
            {props.categoryNames.map(categoryName => {
                const path = `/${props.isViewingDoneTodos ? 'done' : 'todos'}/${categoryName}`;
                return <NavigationButton key={categoryName} enabled={() => props.category?.name === categoryName}
                                         pathname={path} content={categoryName}/>;
            })}
            <div className='flex gap-4 p-2'>
                <input placeholder='my-new-category' value={newCategoryName}
                       onChange={e => setNewCategoryName(e.target.value)}
                       onKeyDown={async e => {
                           if (e.key === 'Enter') {
                               await addCategory!(e.target as HTMLButtonElement, newCategoryName);
                           }
                       }}
                       className='border-gray-500 focus-visible:border-blue-50 border-2'/>
                <button className='border-transparent rounded-lg bg-blue-500 px-4 py-2'
                        onClick={async e => {
                            await addCategory(e.target as HTMLButtonElement, newCategoryName);
                        }}
                        disabled={props.categoryNames.includes(newCategoryName)}>
                    Add
                </button>
            </div>
            <b>Completion:</b>
            <NavigationButton enabled={() => !props.isViewingDoneTodos}
                              pathname={`/todos/${props.category?.name ?? ''}`}
                              content='To-Do'/>
            <NavigationButton enabled={() => props.isViewingDoneTodos}
                              pathname={`/done/${props.category?.name ?? ''}`}
                              content='Done'/>
        </div>
        <div className={`flex flex-col col-span-6 bg-white gap-4 ${props.containerClassName}`}>
            {props.children}
        </div>
    </Layout>;
}