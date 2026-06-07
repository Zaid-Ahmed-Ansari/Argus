"use client";

import { Skeleton } from "boneyard-js/react";

type NamedSkeletonProps = {
  name: string;
  loading: boolean;
  fixture?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function NamedSkeleton({
  name,
  loading,
  fixture,
  children,
  className,
}: NamedSkeletonProps) {
  return (
    <Skeleton
      name={name}
      loading={loading}
      fixture={fixture}
      className={className}
      boneClass="rounded-md"
    >
      {children}
    </Skeleton>
  );
}
