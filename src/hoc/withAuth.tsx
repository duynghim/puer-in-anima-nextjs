"use client";

import type { ComponentType } from "react";
import { useAuth } from "@/hooks";

export const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  role?: string
) => {
  const WithAuthComponent = (props: P) => {
    const { user, loading } = useAuth(role);

    if (loading) {
      return (
        <div
          className="flex min-h-[60vh] w-full items-center justify-center"
          aria-label="Loading"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sage-100 border-t-sage-500 shadow-sm" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuthComponent;
};

const getDisplayName = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
};
