import type React from "react";
import { Container } from "../container/container";

export type StorageBoxProps = {
  header: React.ReactNode;
};

export const StorageBox: React.FC<React.PropsWithChildren<StorageBoxProps>> = ({
  header,
  children,
}) => {
  return (
    <Container
      padding="big"
      style={{
        padding: 8,
      }}
    >
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

      <hr />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 8,
        }}
      >
        {children}
      </div>
    </Container>
  );
};
