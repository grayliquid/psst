import Head from "next/head";
import Link from "next/link";
import { Page } from "../components/page";
import { PageTitle } from "../components/page-title";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Ahhhhhhh</title>
      </Head>

      <Page>
        <PageTitle>psst.lol</PageTitle>
        <p className="text-center text-lg text-gray-400">
          404, not found.{" "}
          <Link className="underline" href="/">
            Go back to /
          </Link>
        </p>
      </Page>
    </>
  );
}
