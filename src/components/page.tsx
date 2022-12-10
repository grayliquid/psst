import Head from "next/head";
import Link from "next/link";
import { PropsWithChildren } from "react";

export function Page({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <Head>
        <link rel="icon" href="/psst.png" />
      </Head>

      <div className="flex justify-center pt-8 lg:py-20 h-screen lg:items-center px-4">
        <div className="w-full lg:w-1/2">{children}</div>
      </div>

      <div className="fixed bottom-0 left-0 mx-4 mb-4 space-x-4 text-gray-400">
        <Link className="text-cool-red" href="/">
          psst.lol
        </Link>
        <Link href="https://github.com/grayliquid/psst" target="_blank">
          github
        </Link>
      </div>
    </>
  );
}
