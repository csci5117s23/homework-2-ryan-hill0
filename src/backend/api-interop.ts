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

export async function getTodos(apiToken: string, isDone: boolean): Promise<Todo[]> {
    const result = await fetch(`${backendBaseUrl}/todos?isDone=${isDone}`, {
        'method': 'GET',
        'headers': {'Authorization': `Bearer ${apiToken}`}
    });

    return await result.json();
}

export async function setTodoCompleteness(apiToken: string, todo: Todo, isDone: boolean): Promise<any> {
    todo.isDone = isDone;

    return updateTodo(apiToken, todo);
}

export async function getTodo(apiToken: string, id: string): Promise<Todo> {
    const result = await fetch(`${backendBaseUrl}/todos/${id}`, {
        'method': 'GET',
        'headers': {'Authorization': `Bearer ${apiToken}`}
    });

    return await result.json();
}

export async function updateTodo(apiToken: string, todo: Todo): Promise<Todo> {
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