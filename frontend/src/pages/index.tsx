import { Navigate } from "@tanstack/react-router";
import type React from 'react';

export const IndexPage: React.FC = () => {
  return <Navigate to="/storage" />;
};
