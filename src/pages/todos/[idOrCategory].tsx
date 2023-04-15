import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import * as backend from "@/backend/api-interop";
import {useAuth} from "@clerk/nextjs";
import {Category, Todo} from "@/backend/api-interop";
import TodosNavigationContainer from "@/components/TodosNavigationContainer";
import TodosViewer from "@/components/TodosViewer";

export default function TodoOrCategoryPage() {
    const {query, push} = useRouter();
    const {isLoaded: isAuthenticationLoaded, userId, getToken} = useAuth();

    const {idOrCategory} = query;

    const [isLoading, setLoading] = useState(true);
    // State for when a To-Do id is given
    const [todo, setTodo] = useState<Todo | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    // State for when a category name is given
    const [category, setCategory] = useState<Category | null>(null);
    const [todos, setTodos] = useState<Todo[] | null>(null);

    // Once this component mounts, attempt to fetch the category with the given name
    // If that fails, attempt to fetch the To-Do item with the given id
    // If that fails, redirect to the 404 page
    useEffect(() => {
        const abortController = new AbortController();

        const fetchData = async () => {
            if (!isAuthenticationLoaded || !userId) {
                return;
            }

            const token = await getToken({template: "codehooks"});
            if (token === null) {
                return;
            }

            const category: Category | null | undefined = await backend.getCategoryByName(token, idOrCategory as string, abortController.signal);

            if (category === null) {
                const todo = await backend.getTodoById(token, idOrCategory as string, abortController.signal);
                if (todo === undefined) {
                    return;
                }

                if (todo === null) {
                    await push('/404');
                    return;
                }

                return {
                    todo: todo,
                    categories: await backend.getCategories(token)
                };
            } else if (category !== undefined) {
                return {
                    todos: await backend.getTodos(token, false, category._id),
                    category: category
                }
            }
        }
        fetchData().then(result => {
            if (!result) {
                return;
            }

            // Set the retrieved state and unset any previous state
            if (result.todo && result.categories) {
                setTodo(result.todo);
                setCategories(result.categories);
                setTodos(null);
                setCategory(null);
            }
            if (result.todos && result.category) {
                setTodos(result.todos);
                setCategory(result.category);
                setTodo(null);
                setCategories([]);
            }

            setLoading(false);
        });

        return () => abortController.abort();
    }, [getToken, idOrCategory, isAuthenticationLoaded, push, query, userId]);

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

    return (category !== null && todos !== null
            ? <TodosViewer isViewingDoneTodos={false} category={category} todos={todos} categories={categories}/>
            : <TodosNavigationContainer containerClassName='p-2'
                                        categoryNames={categories.map(category => category.name)}
                                        addCategoryCallback={newCategory => setCategories([...categories, newCategory])}
                                        isViewingDoneTodos={false}
                                        category={category}>
                {isLoading
                    ? <span>Loading...</span>
                    : (<>
                        <h1>To-Do Editor</h1>
                        <textarea value={todo?.content}
                                  onChange={e => setTodo({...todo, content: e.target.value} as Todo)}
                                  className='border-gray-500 focus-visible:border-blue-50 border-2'/>
                        <label>
                            <input type='checkbox' checked={todo?.isDone ?? false}
                                   onChange={e => setTodo({...todo, isDone: e.target.checked} as Todo)}/>
                            Done
                        </label>
                        <label>
                            Category:
                            <select value={todo?.categoryID ?? undefined} onChange={e => setTodo({
                                ...todo,
                                categoryID: e.target.value === 'None' ? null : e.target.value
                            } as Todo)}>
                                <option value='None'>None</option>
                                {categories.map(category =>
                                    <option key={category._id} value={category._id}>{category.name}</option>)
                                }
                            </select>
                        </label>
                        <button onClick={async e => await save(e.target as HTMLButtonElement)}
                                className='border-transparent rounded-lg bg-blue-500 px-4 py-2'>Save
                        </button>
                    </>)}
            </TodosNavigationContainer>
    );
}