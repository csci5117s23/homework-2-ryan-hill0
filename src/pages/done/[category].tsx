import TodosViewer from "@/components/TodosViewer";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {Category} from "@/backend/api-interop";
import * as backend from "@/backend/api-interop";
import {useAuth} from "@clerk/nextjs";
import TodosNavigationContainer from "@/components/TodosNavigationContainer";

export default function DoneCategoryTodos() {
    const router = useRouter();
    const {isLoaded: isAuthenticationLoaded, userId, getToken} = useAuth();

    const [category, setCategory] = useState<Category | null>(null);

    const {category: categoryName} = router.query;

    // Fetch category given using the name provided in the query once this component mounts
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

            const category: Category | null | undefined = await backend.getCategoryByName(token, categoryName as string, abortController.signal);

            setCategory(category ?? null);
        };

        fetchData().then();

        return () => abortController.abort();
    }, [categoryName, getToken, isAuthenticationLoaded, router, userId]);

    return category === null
        // Display an empty navigation container while loading the category
        ? (<TodosNavigationContainer addCategoryCallback={() => null} categoryNames={[]} isViewingDoneTodos={true}
                                     category={null}>
            <span>Loading...</span>
        </TodosNavigationContainer>)
        : <TodosViewer isViewingDoneTodos={true} category={category} todos={null}
                       categories={null}/>;
}