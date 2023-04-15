import {useRouter} from "next/router";

type NavigationButtonProps = {
    enabled: (pathname: string) => boolean;
    pathname: string;
    content: string;
};

export default function NavigationButton({enabled, pathname, content}: NavigationButtonProps) {
    const {pathname: currentPathname, push} = useRouter();

    return <button
        className={`${enabled(currentPathname) ? 'bg-blue-500' : 'hover:bg-blue-300 transition-colors'} border-transparent rounded-lg px-8 py-4`}
        onClick={() => push(pathname)} disabled={enabled(currentPathname)}>
        {content}
    </button>;
}