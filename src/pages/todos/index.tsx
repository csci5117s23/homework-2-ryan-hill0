import {useRouter} from "next/router";
import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import {useAuth} from "@clerk/nextjs";
import * as backend from "@/backend/api-interop";

export default function Todos() {
    const {push} = useRouter();
    const {isLoaded: isAuthenticationLoaded, userId, getToken} = useAuth();

    const [isLoading, setLoading] = useState(true);
    const [todos, setTodos] = useState<backend.Todo[]>([]);
    const [newTodoContent, setNewTodoContent] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticationLoaded || !userId) {
                return;
            }

            const token = await getToken({template: "codehooks"});
            if (token === null) {
                return;
            }

            setTodos(await backend.getIncompleteTodos(token));
            setLoading(false);
        }
        fetchData().finally();
    }, [getToken, isAuthenticationLoaded, userId]);

    async function addTodo(sourceElement: HTMLButtonElement, content: string): Promise<void> {
        sourceElement.disabled = true;

        const token = await getToken({template: "codehooks"}).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (token === null) {
            return;
        }

        const newTodo = await backend.addTodo(token, content).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (newTodo === null) {
            return;
        }
        setNewTodoContent("");
        setTodos(todos.concat(newTodo));

        sourceElement.disabled = false;
    }

    async function completeTodo(sourceElement: HTMLButtonElement, todo: backend.Todo): Promise<void> {
        sourceElement.disabled = true;

        const token = await getToken({template: "codehooks"}).catch(() => {
            sourceElement.disabled = false;
            return null;
        });
        if (token === null) {
            return;
        }

        await backend.completeTodo(token, todo).finally(() => {
            sourceElement.disabled = false;
        });
        setTodos(todos.filter(ith_todo => ith_todo !== todo));
    }

    return <Layout>
        <div className='flex flex-col w-full h-full p-2'>
            <div className='bg-blue-500 border-transparent rounded-lg px-8 py-4 text-center'>To-Do</div>
            <button className='hover:bg-blue-300 transition-colors border-transparent rounded-lg px-8 py-4'
                    onClick={() => push('/done')}>Done
            </button>
        </div>
        <div className='flex flex-col col-span-7 bg-white justify-between gap-4'>
            {isLoading ? (
                <span className='text-center p-2'>Loading...</span>
            ) : (todos.length > 0
                    ? (
                        <ul className='p-2 overflow-y-scroll'>
                            {todos.map(todo => (
                                <li key={todo.createdAt} className='flex justify-between'>
                                    <span className='text-ellipsis'>{todo.content}</span>
                                    <button
                                        onClick={async e => await completeTodo(e.target as HTMLButtonElement, todo)}>Complete
                                    </button>
                                </li>
                            ))
                            }
                        </ul>)
                    : (
                        <span className='text-center p-2'>No To-Do&apos;s to Display</span>
                    )
            )}
            <div className='flex gap-4 p-2'>
                <input placeholder='...' value={newTodoContent}
                       onChange={e => setNewTodoContent(e.target.value)}
                       onKeyDown={async e => {
                           if (e.key === 'Enter') {
                               await addTodo(e.target as HTMLButtonElement, newTodoContent);
                           }
                       }}/>
                <button className='border-transparent rounded-lg bg-blue-500 px-4 py-2'
                        onClick={async e => await addTodo(e.target as HTMLButtonElement, newTodoContent)}>
                    Add
                </button>
            </div>
        </div>
    </Layout>;
}