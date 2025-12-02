"use client";

import type { ComponentType } from "react";
import { useAuth } from "@/hooks";
import { Loader } from "@mantine/core";

export const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  role?: string
) => {
  const WithAuthComponent = (props: P) => {
    const { user, loading } = useAuth(role);

    if (loading) {
      return (
        <Loader
          size="lg"
          variant="dots"
        />
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${getDisplayName(
    WrappedComponent
  )})`;

  return WithAuthComponent;
};

const getDisplayName = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
};
