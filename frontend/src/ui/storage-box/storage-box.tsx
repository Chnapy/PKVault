import type React from "react";
import { TitledContainer } from '../container/titled-container';

export type StorageBoxProps = {
  header: React.ReactNode;
};

export const StorageBox: React.FC<React.PropsWithChildren<StorageBoxProps>> = ({
  header,
  children,
  ...rest
}) => {
  return (
    <TitledContainer
      {...rest}
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
