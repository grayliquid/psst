import Head from "next/head";
import { FormEvent, useState } from "react";
import { Fish } from "@u32e1/fish";
import { Page } from "../components/page";
import { PageTitle } from "../components/page-title";

enum HomeState {
  Idle = "IDLE",
  Submitting = "SUBMITTING",
}

export default function Home() {
  const [state, setState] = useState(HomeState.Idle);

  async function createNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const message =
      form.querySelector<HTMLInputElement>(`[name="message"]`).value;
    const key = form.querySelector<HTMLInputElement>(`[name="key"]`).value;

    setState(HomeState.Submitting);
    const { id: noteId } = (
      await (
        await fetch("/api/notes", {
          method: "post",
          headers: new Headers({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            message: new Fish(key).encrypt(message),
          }),
        })
      ).json()
    ).data.note;

    localStorage.setItem(`notes/${noteId}`, key);
    location.href = `/${noteId}`;
  }

  return (
    <>
      <Head>
        <title>End-to-end encrypted notes sharing: psst.lol</title>

        <meta
          name="description"
          content="Easily share notes in an end-to-end encrypted fashion."
        />
        <meta
          name="keywords"
          content="end-to-end encrypted, encryption, encrypted notes"
        />
      </Head>

      <Page>
        <div>
          <PageTitle>psst.lol</PageTitle>
          <p className="text-center text-lg text-gray-400">
            End-to-end encrypted notes
          </p>

          <form
            onSubmit={createNote}
            style={{
              boxShadow: "0px 50px 70px 30px rgba(101, 96, 106, 0.2)",
            }}
            className="mt-8 text-white p-6 rounded bg-[#0a0a0a] w-full"
          >
            <label className="block">
              <span className="block mb-1">Message</span>
              <textarea
                name="message"
                className="h-48 bg-neutral-800 w-full p-4 rounded focus:outline-none border border-transparent focus:border-cool-red"
                placeholder="My real name isn't actually Tom, it's..."
              ></textarea>
            </label>

            <label className="block mt-3">
              <span className="block mb-1">Encryption key</span>
              <input
                name="key"
                type="password"
                className="bg-neutral-800 w-full p-4 rounded focus:outline-none border border-transparent focus:border-cool-red"
                placeholder="v33ry!S3C_RE##_"
              />
            </label>

            <div className="flex justify-center">
              <hr className="my-4 border-neutral-800 w-24" />
            </div>

            <button
              disabled={state === HomeState.Submitting}
              className={`bg-neutral-700 px-4 py-6 rounded w-full text-center focus:outline-none focus:bg-cool-red duration-100 ${
                state === HomeState.Submitting ? "animate-pulse" : ""
              }`}
            >
              {state === HomeState.Submitting ? "Creating..." : "Create"}
            </button>
          </form>
        </div>
      </Page>
    </>
  );
}
