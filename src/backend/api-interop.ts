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
    createdAt: string,
    /**
     * The Codehooks ID of the category this To-Do item is a part of
     */
    categoryID: string | null,
};

export type Category = {
    /**
     * The internal ID assigned to this category by Codehooks
     */
    _id: string,
    /**
     * The Clerk ID of the user that created this category
     */
    creatorID: string,
    /**
     * The name of this category
     */
    name: string,
    /**
     * The datetime when this category was created
     */
    createdAt: string,
}

export async function addTodo(apiToken: string, newTodoContent: string, categoryId: string | null): Promise<Todo> {
    const result = await fetch(`${backendBaseUrl}/todos`, {
        'method': 'POST',
        'headers': {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(categoryId ? {
            content: newTodoContent,
            isDone: false,
            categoryID: categoryId
        } : {content: newTodoContent, isDone: false})
    });

    return await result.json();
}

export async function getTodos(apiToken: string, isDone: boolean, categoryId: string | null): Promise<Todo[]> {
    const result = await fetch(`${backendBaseUrl}/todos?isDone=${isDone}${categoryId !== null ? `&categoryID=${categoryId}` : ''}`, {
        'method': 'GET',
        'headers': {'Authorization': `Bearer ${apiToken}`}
    });

    return await result.json();
}

export async function setTodoCompleteness(apiToken: string, todo: Todo, isDone: boolean): Promise<any> {
    todo.isDone = isDone;

    return updateTodo(apiToken, todo);
}

export async function getTodoById(apiToken: string, id: string, abortSignal: AbortSignal | null): Promise<Todo | null | undefined> {
    return await fetch(`${backendBaseUrl}/todos/${id}`, {
        'method': 'GET',
        'headers': {'Authorization': `Bearer ${apiToken}`},
        signal: abortSignal
    }).catch((error) => {
        if (error?.name === "AbortError") {
            return undefined;
        }

        throw error;
    }).then(async response => {
        if (!response || !response.ok) {
            return null;
        }

        return await response.json();
    });
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

export async function getCategories(apiToken: string): Promise<Category[]> {
    const result = await fetch(`${backendBaseUrl}/categories`, {
        'method': 'GET',
        'headers': {'Authorization': `Bearer ${apiToken}`}
    });

    return await result.json();
}

export async function getCategoryByName(apiToken: string, categoryName: string, abortSignal: AbortSignal | null): Promise<Category | null | undefined> {
    let result: Response;
    try {
        result = await fetch(`${backendBaseUrl}/categories?name=${categoryName}`, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${apiToken}`},
            signal: abortSignal
        });
    } catch (error: any) {
        if (error?.name === "AbortError") {
            return undefined;
        }

        throw error;
    }

    if (result.status === 404) {
        return null;
    }
    const json = await result.json();
    if (Array.isArray(json)) {
        return json[0] ?? null;
    }

    return null;
}

export async function addCategory(apiToken: string, categoryName: string): Promise<Category> {
    const result = await fetch(`${backendBaseUrl}/categories`, {
        'method': 'POST',
        'headers': {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify({name: categoryName})
    });

    return await result.json();
}

export async function deleteCategory(apiToken: string, category: Category): Promise<any> {
    const result = await fetch(`${backendBaseUrl}/categories/${category._id}`, {
        'method': 'DELETE',
        'headers': {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
    });

    return await result.json();
}