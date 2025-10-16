import React from "react";
import { Container } from "../../ui/container/container";
import { theme } from '../../ui/theme';
import { SaveItemContent, type SaveItemContentProps } from './save-item-content';

export type SaveItemProps = SaveItemContentProps & {
  width?: number | string;
  onClick?: () => void;
};

export const SaveItem: React.FC<SaveItemProps> = ({
  width = 350,
  onClick,
  ...saveItemContentProps
}) => {
  return (
    <Container
      as={onClick ? "button" : "div"}
      padding="big"
      style={{
        backgroundColor: onClick
          ? theme.bg.light
          : theme.bg.panel,
        borderColor: onClick
          ? theme.text.default
          : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width
      }}
      onClick={onClick}
    >
      <SaveItemContent {...saveItemContentProps} />
    </Container>
  );
};
