import { css } from "@emotion/css";
import type React from "react";
import { Container } from "../../ui/container/container";

export const SaveUpload: React.FC = () => {
  // const { mutateAsync, isPending } = useSaveInfosUpload();

  return (
    <Container
      className={css({
        position: "relative",
        height: 100,
        width: "100%",
        // marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      {/* <div>{isPending ? "Uploading..." : "Upload save here"}</div>
      <input
        type="file"
        className={css({
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          opacity: 0,
          cursor: "pointer",
        })}
        onChange={(e) => {
          const files = e.target.files;
          if (!files?.length) {
            return;
          }

          mutateAsync({
            data: {
              saveFile: files[ 0 ],
            },
          });
        }}
      /> */}
    </Container>
  );
};
