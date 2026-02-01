import React from 'react';
import { QueryError, type ErrorType } from './mutator/custom-instance';

type BackendError = Pick<ErrorType<never>, 'status' | 'message' | 'stack'>;

type BackendErrorsContext = {
    errors: BackendError[];
    addError: (error: Partial<BackendError | Error>) => void;
    removeIndex: (index: number) => void;
}

const context = React.createContext<BackendErrorsContext>({ errors: [], addError: () => void 0, removeIndex: () => void 0 });

export const BackendErrorsContext = {
    Provider: ({ children }: React.PropsWithChildren) => {
        const [ backendErrors, setBackendErrors ] = React.useState<(BackendError)[]>([]);

        return <context.Provider value={{
            errors: backendErrors,
            addError: error => setBackendErrors(errors => {
                const alreadyExists = errors.some(err => err.stack === error.stack);
                if (alreadyExists) {
                    return errors;
                }

                return [ ...errors, {
                    status: 'status' in error ? error.status ?? 0 : 0,
                    message: error.message ?? '',
                    stack: error.stack ?? '',
                } satisfies BackendError ];
            }),
            removeIndex: index => setBackendErrors(
                backendErrors.filter((_, i) => i !== index)
            )
        }}>
            {children}
        </context.Provider>;
    },
    useValue: () => React.useContext(context),
    useOnMutationResponse: () => {
        const context = BackendErrorsContext.useValue();

        return (data: unknown, error: Error | null) => {
            if (error instanceof QueryError) {
                context.addError({
                    message: error.errorMessage ?? undefined,
                    stack: error.errorStack ?? undefined,
                    status: error.status,
                });
            }
        };
    },
};
