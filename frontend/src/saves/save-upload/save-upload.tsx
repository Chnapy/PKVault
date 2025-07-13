import { css } from "@emotion/css";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { getDexGetAllQueryKey } from "../../data/sdk/dex/dex.gen";
import {
  getSaveInfosGetAllQueryKey,
  useSaveInfosUpload,
} from "../../data/sdk/save-infos/save-infos.gen";
import { Container } from "../../ui/container/container";

export const SaveUpload: React.FC = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useSaveInfosUpload({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getSaveInfosGetAllQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getDexGetAllQueryKey(),
        });
      },
    },
  });

  return (
    <Container
      className={css({
        position: "relative",
        height: 100,
        width: "100%",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <div>{isPending ? "Uploading..." : "Upload save here"}</div>
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
              saveFile: files[0],
            },
          });
        }}
      />
    </Container>
  );
};
