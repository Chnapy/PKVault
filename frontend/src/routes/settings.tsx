import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { withErrorCatcher } from '../error/with-error-catcher';
import { Backup } from '../settings/backup/backup';
import { Settings } from '../settings/settings';
import { css } from '@emotion/css';

const SettingsPage: React.FC = withErrorCatcher('default', () => {

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: 'column',
        alignItems: "stretch",
        gap: 16,
        width: '100%',
        maxWidth: 914,
        marginLeft: 'auto',
        marginRight: 'auto',
      })}
    >
      <Settings />

      <Backup />
    </div>
  );
});

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
