import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import * as backend from "@/backend/api-interop";
import {useAuth} from "@clerk/nextjs";
import {Todo} from "@/backend/api-interop";
import TodosNavigationContainer from "@/components/TodosNavigationContainer";

export default function TodoPage() {
    const router = useRouter();
    const {isLoaded: isAuthenticationLoaded, userId, getToken} = useAuth();

    const {id} = router.query;

    const [todo, setTodo] = useState<Todo | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticationLoaded || !userId) {
                return;
            }

            const token = await getToken({template: "codehooks"});
            if (token === null) {
                return;
            }

            setTodo(await backend.getTodo(token, id as string));
        }
        fetchData().finally();
    }, [getToken, id, isAuthenticationLoaded, userId]);


    async function save(sourceElement: HTMLButtonElement) {
        sourceElement.disabled = true;
        sourceElement.textContent = 'Saving...'

        const token = await getToken({template: "codehooks"});
        if (token === null) {
            sourceElement.textContent = 'Save';
            return;
        }

        setTodo(await backend.updateTodo(token, todo!));

        sourceElement.disabled = false;
        sourceElement.textContent = 'Save';
    }

    return <TodosNavigationContainer containerClassName='p-2'>
        <h1>To-Do Editor</h1>
        <textarea value={todo?.content ?? 'Loading...'}
                  onChange={e => setTodo({...todo, content: e.target.value} as Todo)}
                  className='border-gray-500 focus-visible:border-blue-50 border-2' />
        <label>
            <input type='checkbox' checked={todo?.isDone ?? false}
                   onChange={e => setTodo({...todo, isDone: e.target.checked} as Todo)}/>
            Done
        </label>
        <button onClick={async e => await save(e.target as HTMLButtonElement)}
                className='border-transparent rounded-lg bg-blue-500 px-4 py-2'>Save</button>
    </TodosNavigationContainer>;
}