import type React from "react";
import { TitledContainer, type TitledContainerProps } from '../container/titled-container';

export type StorageBoxProps = Pick<TitledContainerProps, 'ref' | 'style'> & {
  header: React.ReactNode;
};

export const StorageBox: React.FC<React.PropsWithChildren<StorageBoxProps>> = ({
  ref,
  header,
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 4,
        }}
      >
        {children}
      </div>
    </TitledContainer>
  );
};
