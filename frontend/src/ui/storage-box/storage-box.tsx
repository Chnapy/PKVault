import { css } from '@emotion/css';
import type React from 'react';
import { ErrorCatcher } from '../../error/error-catcher';
import { TitledContainer, type TitledContainerProps } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { SizingUtil } from '../util/sizing-util';

export type StorageBoxProps = Pick<TitledContainerProps, 'ref' | 'className'> & {
  header: React.ReactNode;
  loading?: boolean;
  slotCount?: number;
  lineSlotCount?: number;
};

export const StorageBox: React.FC<React.PropsWithChildren<StorageBoxProps>> = ({
  ref,
  className,
  header,
  loading,
  slotCount = 30,
  lineSlotCount = 6,
  children,
}) => {
  return (
    <TitledContainer
      ref={ref}
      className={className}
      title={
        <div
          className={css({
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          })}
        >
          {header}
        </div>
      }
    >
      {(children || loading) && (
        <ErrorCatcher>
          <div
            className={css({
              display: 'flex',
              justifyContent: 'center',
            })}
          >
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: `repeat(${lineSlotCount}, 1fr)`,
                gap: SizingUtil.itemsGap,
                maxHeight: SizingUtil.getMaxHeight(),
                overflowY: 'visible',
                margin: slotCount > 30 ? '0 -5px' : undefined,
              })}
            >
              {children}
            </div>
            {loading && (
              <div
                className={css({
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0, 0, 0, .1)',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                })}
              >
                <Icon
                  name='spinner-third'
                  className={css({
                    animation: 'spin 1s linear infinite',

                    '@keyframes spin': {
                      '0%': {
                        transform: 'rotate(0deg)',
                      },
                      '100%': {
                        transform: 'rotate(360deg)',
                      },
                    },
                  })}
                />
              </div>
            )}
          </div>
        </ErrorCatcher>
      )}
    </TitledContainer>
  );
};
