import {useRouter} from "next/router";
import {useAuth} from "@clerk/nextjs";
import {useEffect, useState} from "react";
import * as backend from "@/backend/api-interop";
import {Todo} from "@/backend/api-interop";
import Image from 'next/image';
import checkImage from "@/../public/check.png";
import Link from "next/link";
import TodosNavigationContainer from "@/components/TodosNavigationContainer";

export type TodosViewerProps = {
    isViewingDoneTodos: boolean;
};

export default function TodosViewer(props: TodosViewerProps) {
    const {push} = useRouter();
    const {isLoaded: isAuthenticationLoaded, userId, getToken} = useAuth();

    const [isLoading, setLoading] = useState(true);
    const [todos, setTodos] = useState<backend.Todo[]>([]);
    const [newTodoContent, setNewTodoContent] = useState('');

    const addTodo = !props.isViewingDoneTodos
        ? async (sourceElement: HTMLButtonElement, content: string): Promise<void> => {
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

            const newTodo = await backend.addTodo(token, content).catch(() => {
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
        : null;

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

        await backend.setTodoCompleteness(token, todo, !props.isViewingDoneTodos).finally(() => {
            sourceElement.disabled = false;
        });
        setTodos(todos.filter(ith_todo => ith_todo !== todo));
        sourceElement.textContent = props.isViewingDoneTodos ? 'Un-Complete' : 'Complete';
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticationLoaded || !userId) {
                return;
            }

            const token = await getToken({template: "codehooks"});
            if (token === null) {
                return;
            }

            setTodos((await backend.getTodos(token, props.isViewingDoneTodos))
                .sort((lhs: Todo, rhs: Todo) => {
                    const lhsDate = Date.parse(lhs.createdAt).valueOf();
                    const rhsDate = Date.parse(rhs.createdAt).valueOf();
                    return rhsDate - lhsDate;
                }));
            setLoading(false);
        }
        fetchData().finally();
    }, [getToken, isAuthenticationLoaded, props.isViewingDoneTodos, userId]);

    return <TodosNavigationContainer containerClassName='justify-between'>
        {isLoading ? (
            <span className='text-center p-2'>Loading...</span>
        ) : (todos.length > 0
                ? (
                    <ul className='p-2 overflow-y-scroll'>
                        {todos.map(todo => (
                            <li key={todo.createdAt} className='flex w-full justify-between gap-2 p-2'>
                                <Link className='flex gap-2 items-center overflow-x-hidden'
                                      href={`/todos/${todo._id}`}>
                                    {props.isViewingDoneTodos &&
                                        <Image src={checkImage} alt='Completed' height={32} width={32}/>}
                                    <span className='overflow-x-hidden text-ellipsis whitespace-nowrap'>{todo.content}</span>
                                </Link>
                                <button
                                    onClick={async e => {
                                        await setTodoCompleteness(e.target as HTMLButtonElement, todo);
                                    }}
                                    className='flex-shrink-0'>
                                    {props.isViewingDoneTodos ? "Un-Complete" : "Complete"}
                                </button>
                            </li>
                        ))
                        }
                    </ul>)
                : (
                    <span className='text-center p-2'>No To-Do&apos;s to Display</span>
                )
        )}
        {!props.isViewingDoneTodos &&
            <div className='flex gap-4 p-2'>
                <input placeholder='I need to...' value={newTodoContent}
                       onChange={e => setNewTodoContent(e.target.value)}
                       onKeyDown={async e => {
                           if (e.key === 'Enter') {
                               await addTodo!(e.target as HTMLButtonElement, newTodoContent);
                           }
                       }}
                       className='border-gray-500 focus-visible:border-blue-50 border-2'/>
                <button className='border-transparent rounded-lg bg-blue-500 px-4 py-2'
                        onClick={async e => {
                            await addTodo!(e.target as HTMLButtonElement, newTodoContent);
                        }}>
                    Add
                </button>
            </div>
        }
    </TodosNavigationContainer>;
}