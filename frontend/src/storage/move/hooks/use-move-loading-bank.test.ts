import { describe, expect, test } from 'vitest';
import { renderHookWithWrapper } from '../__tests__/render-hook-with-wrapper';
import { useMoveLoadingBank } from './use-move-loading-bank';

describe('use-move-loading-bank', () => {

    test('should not be loading if move submitting not with current bank', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveLoadingBank('1'),
            {
                status: 'loading',
                source: {
                    ids: [ 'canMove' ],
                },
                target: {
                    type: 'bank',
                    bankId: '2',
                },
            }
        );

        await waitForQueries();

        expect(result.current).toBeFalsy();
    });

    test('should be loading if move submitting with current bank', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveLoadingBank('1'),
            {
                status: 'loading',
                source: {
                    ids: [ 'canMove' ],
                },
                target: {
                    type: 'bank',
                    bankId: '1',
                },
            }
        );

        await waitForQueries();

        expect(result.current).toBeTruthy();
    });
});
