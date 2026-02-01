import type React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BackendErrorsContext } from '../data/backend-errors-context';
import { Fallback, type FallbackExtraProps } from './fallback';

/**
 * Catch component render errors with smooth display.
 */
export const ErrorCatcher: React.FC<FallbackExtraProps & {
    fallback?: typeof Fallback.default;
    children: React.ReactNode;
}> = ({ fallback: FallbackComp = Fallback.default, children, ...fallbackExtraProps }) => {
    const { addError } = BackendErrorsContext.useValue();

    return <ErrorBoundary
        FallbackComponent={props => <FallbackComp {...props} {...fallbackExtraProps} />}
        onError={(error) => error instanceof Error ? addError(error) : undefined}
    >
        {children}
    </ErrorBoundary>;
};
