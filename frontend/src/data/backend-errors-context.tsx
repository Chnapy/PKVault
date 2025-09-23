import React from 'react';

type BackendError = {
    status: number;
    message: string;
    stack: string;
};

type BackendErrorsContext = {
    errors: BackendError[];
    addError: (error: BackendError) => void;
    removeIndex: (index: number) => void;
}

const context = React.createContext<BackendErrorsContext>({ errors: [], addError: () => void 0, removeIndex: () => void 0 });

export const BackendErrorsContext = {
    Provider: ({ children }: React.PropsWithChildren) => {
        const [ backendErrors, setBackendErrors ] = React.useState<BackendError[]>([]);

        return <context.Provider value={{
            errors: backendErrors,
            addError: error => setBackendErrors(errors => [ ...errors, error ]),
            removeIndex: index => setBackendErrors(
                backendErrors.filter((_, i) => i !== index)
            )
        }}>
            {children}
        </context.Provider>;
    },
    useValue: () => React.useContext(context),
};
