import { createContext, useContext}  from 'react';
import CoreService from './CoreService';

const CoreServiceContext = createContext<CoreService|null>(null);

export const useCoreService = (): CoreService => {
    const context = useContext(CoreServiceContext);
    if (!context) {
        throw new Error('useCoreService must be used within a CoreServiceProvider');
    }
    return context;
}

export default CoreServiceContext;