const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

/**
 * A Typescript class mirroring the Yup schema for a To-Do item defined in the Codehooks backend.
 */
export type Todo = {
    /**
     * The internal ID assigned to this To-Do item by Codehooks
     */
    _id: string;
    /**
     * The Clerk ID of the user that created this To-Do item
     */
    creatorID: string,
    /**
     * The text content of this To-Do item
     */
    content: string,
    /**
     * {@code true} if this To-Do item is complete, {@code false} otherwise
     */
    isDone: boolean,
    /**
     * The datetime when this To-Do item was created
     */
    createdAt: string
};

export async function addTodo(apiToken: string, newTodoContent: string): Promise<Todo> {
    const result = await fetch(`${backendBaseUrl}/todos`, {
        'method': 'POST',
        'headers': {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify({content: newTodoContent, isDone: false})
    });

    return await result.json();
}

async function getTodos(apiToken: string, isDone: boolean): Promise<Todo[]> {
    const result = await fetch(`${backendBaseUrl}/todos?isDone=${isDone}`, {
        'method': 'GET',
        'headers': {'Authorization': `Bearer ${apiToken}`}
    });

    return await result.json();
}

export async function getIncompleteTodos(apiToken: string): Promise<Todo[]> {
    return getTodos(apiToken, false);
}

export async function getCompleteTodos(apiToken: string): Promise<Todo[]> {
    return getTodos(apiToken, true);
}

async function setTodoCompleteness(apiToken: string, todo: Todo, isDone: boolean): Promise<any> {
    todo.isDone = isDone;

    const result = await fetch(`${backendBaseUrl}/todos/${todo._id}`, {
        'method': 'PUT',
        'headers': {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(todo)
    });

    return await result.json();
}

export async function completeTodo(apiToken: string, todo: Todo): Promise<any> {
   return await setTodoCompleteness(apiToken, todo, true);
}

export async function unCompleteTodo(apiToken: string, todo: Todo): Promise<any> {
    return await setTodoCompleteness(apiToken, todo, false);
}