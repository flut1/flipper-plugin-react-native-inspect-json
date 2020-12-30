import { createContext } from 'react';

export type TreeContextValue = {
    subscribe(path: string): void;
    unsubscribe(path: string): void;
}

const TreeContext = createContext<TreeContextValue>({
    subscribe: () => {},
    unsubscribe: () => {},
})

export default TreeContext;
