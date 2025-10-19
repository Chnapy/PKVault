import type React from 'react';
import { ErrorCatcher } from './error-catcher';
import { Fallback } from './fallback';

export const withErrorCatcher = function <P>(fallbackType: keyof typeof Fallback, Component: React.FC<P>) {

    return (props: P & React.JSX.IntrinsicAttributes) => <ErrorCatcher fallback={Fallback[ fallbackType ]}>
        <Component {...props} />
    </ErrorCatcher>;
};
