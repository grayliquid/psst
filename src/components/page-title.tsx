import { PropsWithChildren } from "react";

export function PageTitle({ children }: PropsWithChildren<unknown>) {
  return (
    <h1 className="text-2xl xl:text-4xl font-bold text-center text-cool-red">
      {children}
    </h1>
  );
}
