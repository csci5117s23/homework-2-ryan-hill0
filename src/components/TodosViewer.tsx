import {useAuth} from "@clerk/nextjs";
import {useEffect, useState} from "react";
import * as backend from "@/backend/api-interop";
import {Category, Todo} from "@/backend/api-interop";
import Image from 'next/image';
import checkImage from "@/../public/check.png";
import Link from "next/link";
import TodosNavigationContainer from "@/components/TodosNavigationContainer";
import {useRouter} from "next/router";

export type TodosViewerProps = {
    isViewingDoneTodos: boolean;
    category: Category | null;
    categories: Category[] | null;
    todos: Todo[] | null;
};

export default function TodosViewer(props: TodosViewerProps) {
    const {push} = useRouter();
    const {isLoaded: isAuthenticationLoaded, userId, getToken} = useAuth();

    const [isLoading, setLoading] = useState(true);
    const [todos, setTodos] = useState<backend.Todo[]>([]);
    const [newTodoContent, setNewTodoContent] = useState('');
    const [categories, setCategories] = useState<backend.Category[]>([]);

    async function addTodo(sourceElement: HTMLButtonElement, content: string, categoryId: string | null): Promise<void> {
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

        const newTodo = await backend.addTodo(token, content, categoryId).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (newTodo === null) {
            sourceElement.textContent = 'Add';
            return;
        }
        setNewTodoContent("");
        setTodos([newTodo, ...todos]);

        sourceElement.disabled = false;
        sourceElement.textContent = 'Add';
    }

    async function setTodoCompleteness(sourceElement: HTMLButtonElement, todo: backend.Todo): Promise<void> {
        sourceElement.disabled = true;
        sourceElement.textContent = props.isViewingDoneTodos ? 'Un-completing...' : 'Completing...';

        const token = await getToken({template: "codehooks"}).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (token === null) {
            sourceElement.textContent = props.isViewingDoneTodos ? 'Un-Complete' : 'Complete';
            return;
        }

        await backend.setTodoCompleteness(token, todo, !todo.isDone).finally(() => {
            sourceElement.disabled = false;
        });

        setTodos(todos.filter(ith_todo => ith_todo !== todo));

        sourceElement.textContent = props.isViewingDoneTodos ? 'Un-Complete' : 'Complete';
    }

    async function deleteCategory(sourceElement: HTMLButtonElement, category: Category) {
        sourceElement.disabled = true;
        sourceElement.textContent = 'Deleting...';

        const token = await getToken({template: "codehooks"}).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (token === null) {
            sourceElement.textContent = 'Delete';
            return;
        }

        const newCategory: backend.Category | null = await backend.deleteCategory(token, category).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (newCategory === null) {
            sourceElement.textContent = 'Delete';
            return;
        }
        setCategories(categories.filter(ith_category => ith_category._id !== category._id))

        sourceElement.disabled = false;
        sourceElement.textContent = 'Delete';

        await push(props.isViewingDoneTodos ? '/done' : '/todos');
    }

    useEffect(() => {
        const fetchData = async () => {
            if (isLoading && props.todos && props.categories) {
                // Don't fetch anything if it already has been fetched
                setTodos(props.todos);
                setCategories(props.categories);
                setLoading(false);
                return;
            }

            if (!isAuthenticationLoaded || !userId) {
                return;
            }

            const token = await getToken({template: "codehooks"});
            if (token === null) {
                return;
            }

            setTodos((await backend.getTodos(token, props.isViewingDoneTodos, props.category?._id ?? null))
                .sort((lhs: Todo, rhs: Todo) => {
                    const lhsDate = Date.parse(lhs.createdAt).valueOf();
                    const rhsDate = Date.parse(rhs.createdAt).valueOf();
                    return rhsDate - lhsDate;
                }));
            setCategories(await backend.getCategories(token));
            setLoading(false);
        }
        fetchData().finally();
    }, [getToken, isAuthenticationLoaded, isLoading, props.categories, props.category?._id, props.isViewingDoneTodos, props.todos, userId]);

    return <TodosNavigationContainer containerClassName='justify-between'
                                     categoryNames={categories.map(category => category.name)}
                                     addCategoryCallback={newCategory => setCategories([...categories, newCategory])}
                                     isViewingDoneTodos={props.isViewingDoneTodos}
                                     category={categories.find(category => category._id === props.category?._id) ?? null}>
        {isLoading ? (
            <span className='text-center p-2'>Loading...</span>
        ) : (todos.length > 0
                ? (
                    <ul className='p-2 overflow-y-scroll'>
                        {todos.map(todo => {
                            const todoCategory = categories.find(category => category._id === todo.categoryID);
                            return (
                                <li key={todo.createdAt} className='flex w-full justify-between gap-2 p-2'>
                                    <Link className='flex gap-2 items-center overflow-x-hidden'
                                          href={`/todos/${todo._id}/`}>
                                        {todo.isDone &&
                                            <Image src={checkImage} alt='Completed' height={32} width={32}/>}
                                        <span
                                            className='overflow-x-hidden text-ellipsis whitespace-nowrap'>{todo.content}</span>
                                    </Link>
                                    <div className='flex flex-nowrap gap-1 overflow-x-hidden flex-shrink-0'>
                                        {todoCategory !== undefined &&
                                            <span
                                                className='overflow-x-hidden text-ellipsis whitespace-nowrap flex-shrink-0 bg-gray-200 rounded-lg p-1'>
                                            {todoCategory!.name}
                                        </span>}
                                        <button
                                            onClick={async e => {
                                                await setTodoCompleteness(e.target as HTMLButtonElement, todo);
                                            }}
                                            className='flex-shrink-0'>
                                            {todo.isDone ? "Un-Complete" : "Complete"}
                                        </button>
                                    </div>
                                </li>
                            )
                        })
                        }
                    </ul>)
                : (
                    <span className='text-center p-2'>No To-Do&apos;s to Display</span>
                )
        )}
        {!props.isViewingDoneTodos &&
            <div className='flex gap-4 p-2 relative'>
                <input placeholder='I need to...' value={newTodoContent}
                       onChange={e => setNewTodoContent(e.target.value)}
                       onKeyDown={async e => {
                           if (e.key === 'Enter') {
                               await addTodo(e.target as HTMLButtonElement, newTodoContent, props.category?._id ?? null);
                           }
                       }}
                       className='border-gray-500 focus-visible:border-blue-50 border-2'/>
                <button className='border-transparent rounded-lg bg-blue-500 px-4 py-2'
                        onClick={async e => {
                            await addTodo(e.target as HTMLButtonElement, newTodoContent, props.category?._id ?? null);
                        }}>
                    Add
                </button>
                {props.category !== null &&
                    <button className='border-transparent rounded-lg bg-red-500 px-4 py-2 absolute right-2'
                            onClick={e => deleteCategory(e.target as HTMLButtonElement, props.category!)}>Delete {props.category!.name}</button>}
            </div>
        }
    </TodosNavigationContainer>;
}