import {app, Datastore} from 'codehooks-js'
import {crudlify} from 'codehooks-crudlify'
import {bool, date, object, string} from 'yup';
import jwtDecode from 'jwt-decode';

const todoSchema = object({
    creatorID: string().required(),
    content: string().required(),
    isDone: bool().required(),
    createdAt: date().default(() => new Date()),
    categoryID: string(),
});

const categorySchema = object({
    creatorID: string().required(),
    name: string().required(),
    createdAt: date().default(() => new Date()),
});

// Authentication middleware adapted from example tech stack: https://github.com/csci5117s23/Tech-Stack-2-Kluver-Demo/blob/main/backend/index.js
// Step 1: Save the given authentication token for future middleware functions
async function insertUserTokenIntoRequest(request, _response, next) {
    try {
        const {authorization} = request.headers;
        if (authorization) {
            const token = authorization.replace('Bearer ', '');
            // Note: jwtDecode does not validate the token, codehooks does
            request.userToken = jwtDecode(token);
        }
        next();
    } catch (error) {
        next(error);
    }
}

app.use(insertUserTokenIntoRequest);

// Step 2: Only allow the user to make requests for their data
function insertCreatorIDIntoRequest(request, response, next) {
    const userId = request.userToken?.sub;
    if (userId === null) {
        // Authentication is required
        response.status(401).end();
        return;
    }

    // Modify either the request body or the query by inserting the authenticated user's ID.
    if (request.method === "POST") {
        request.body.creatorID = userId;
    } else if (request.method === "GET") {
        request.query.creatorID = userId;
    }
    next();
}

app.use('/todos', insertCreatorIDIntoRequest);
app.use('/categories', insertCreatorIDIntoRequest);

// Step 3: Ensure the authenticated user is accessing its own data
function createValidateQueryFunction(collectionName) {
    return async (request, response, next) => {
        const id = request.params.ID;
        const userId = request.userToken?.sub;
        if (userId === null) {
            // Authentication is required
            response.status(401).end();
            return;
        }

        // Ensure the user requesting the object to be read/updated/replaced/deleted is the creator
        const connection = await Datastore.open();
        try {
            const object = await connection.getOne(collectionName, id);
            if (object.creatorID !== userId) {
                // The authenticated user doesn't own this to-do
                response.status(403).end();
                return;
            }
        } catch (e) {
            console.log(e);
            // The object doesn't exist.
            response.status(404).end(e);
            return;
        }

        // Call crudlify implementation
        next();
    };
}

app.use('/todos/:id', createValidateQueryFunction('todos'));
app.use('/categories/:id', createValidateQueryFunction('categories'));

crudlify(app, {todos: todoSchema, categories: categorySchema})

// Bind to serverless runtime
export default app.init();
