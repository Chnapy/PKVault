import { css } from '@emotion/css';
import type React from "react";
import { ErrorCatcher } from '../../error/error-catcher';
import { TitledContainer, type TitledContainerProps } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { SizingUtil } from '../util/sizing-util';

export type StorageBoxProps = Pick<TitledContainerProps, 'ref' | 'style'> & {
  header: React.ReactNode;
  loading?: boolean;
  slotCount?: number;
  lineSlotCount?: number;
};

export const StorageBox: React.FC<React.PropsWithChildren<StorageBoxProps>> = ({
  ref,
  header,
  loading,
  slotCount = 30,
  lineSlotCount = 6,
  children,
  style,
}) => {
  return (
    <TitledContainer
      ref={ref}
      style={style}
      title={
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {header}
        </div>
      }
    >
      {(children || loading) && <ErrorCatcher>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${lineSlotCount}, 1fr)`,
            gap: SizingUtil.itemsGap,
            maxHeight: SizingUtil.getMaxHeight(),
            overflowY: 'visible',
            margin: slotCount > 30 ? '0 -5px' : undefined,
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
      </ErrorCatcher>}
    </TitledContainer>
  );
};
