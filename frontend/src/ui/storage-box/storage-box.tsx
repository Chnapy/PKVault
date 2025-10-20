import { css } from '@emotion/css';
import type React from "react";
import { ErrorCatcher } from '../../error/error-catcher';
import { TitledContainer, type TitledContainerProps } from '../container/titled-container';
import { Icon } from '../icon/icon';

export type StorageBoxProps = Pick<TitledContainerProps, 'ref' | 'style'> & {
  header: React.ReactNode;
  loading?: boolean;
};

export const StorageBox: React.FC<React.PropsWithChildren<StorageBoxProps>> = ({
  ref,
  header,
  loading,
  children,
  style,
}) => {
  return (
    <TitledContainer
      ref={ref}
      style={style}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          {header}
        </div>
      }
    >
      <ErrorCatcher>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 4,
          }}
        >
          {children}
        </div>

        {loading && <div
          style={{
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
          }}
        >
          <Icon
            name='spinner-third'
            className={css({
              animation: 'spin 1s linear infinite',

              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)'
                },
                '100%': {
                  transform: 'rotate(360deg)'
                },
              }
            })}
          />
        </div>}
      </ErrorCatcher>
    </TitledContainer>
  );
};
