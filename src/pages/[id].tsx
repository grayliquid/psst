import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { Fish } from "@u32e1/fish";
import { ExternalNote } from "./api/notes";
import { GetServerSideProps } from "next";
import { getNote } from "./api/notes/[id]";
import { Page } from "../components/page";
import { PageTitle } from "../components/page-title";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const noteId = context.query.id;

  if (typeof noteId !== "string") {
    return {
      notFound: true,
    };
  }

  const note = await getNote(noteId);

  if (!note) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      note,
    },
  };
};

enum SingleNoteState {
  Idle = "IDLE",
  LoadingKey = "LOADING_KEY",
  GettingDeleted = "GETTING_DELETED",
}

interface SingleNoteProps {
  note: ExternalNote;
}

export default function SingleNote({ note }: SingleNoteProps) {
  const router = useRouter();
  const noteId = router.query.id;
  const [didDecryptMessage, setDidDecryptMessage] = useState(false);
  const [message, setMessage] = useState(note.message);
  const [state, setState] = useState(SingleNoteState.LoadingKey);

  async function decrypt(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const key =
      e.currentTarget.querySelector<HTMLInputElement>(`[name="key"]`).value;

    try {
      setMessage(await new Fish(key).decrypt(message));
    } catch {
      setMessage("[Could not decrypt using this key]");
    }

    setDidDecryptMessage(true);
    localStorage.setItem(`notes/${noteId}`, key);
  }

  function dismissEnteredKey() {
    localStorage.removeItem(`notes/${noteId}`);
    setMessage(note.message);
    setDidDecryptMessage(false);
  }

  async function deleteNote() {
    setState(SingleNoteState.GettingDeleted);
    await fetch(`/api/notes/${note.id}`, {
      method: "DELETE",
    });
    window.location.href = "/";
  }

  useEffect(() => {
    (async () => {
      if (!noteId || didDecryptMessage) {
        setState(SingleNoteState.Idle);
        return;
      }

      const key = localStorage.getItem(`notes/${noteId}`);

      if (!key) {
        setState(SingleNoteState.Idle);
        return;
      }

      try {
        setMessage(await new Fish(key).decrypt(message));
      } catch {
        setMessage("[Could not decrypt using this key]");
      }

      setDidDecryptMessage(true);
      setState(SingleNoteState.Idle);
    })();
  }, [noteId, message, didDecryptMessage]);

  return (
    <>
      <Head>
        <title>{note.id + " | psst.lol"}</title>

        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <Page>
        <div>
          <PageTitle>psst.lol/{noteId || "0000"}</PageTitle>
          <p className="text-center text-lg text-gray-400">
            Created on{" "}
            {note?.createdAt
              ? new Date(note?.createdAt).toLocaleDateString()
              : "..."}
          </p>

          <div
            style={{
              boxShadow: "0px 50px 70px 30px rgba(101, 96, 106, 0.2)",
            }}
            className="mt-8 text-white p-6 rounded bg-[#0a0a0a] w-full relative"
          >
            <div
              style={{
                opacity: state === SingleNoteState.LoadingKey ? 1 : 0,
                zIndex: state === SingleNoteState.LoadingKey ? 1 : -1,
              }}
              className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center duration-1000"
            >
              <p className="text-gray-400 animate-pulse">Loading...</p>
            </div>
            {didDecryptMessage ? (
              <div>
                <label className="block">
                  <span className="block mb-1">Message</span>
                  <textarea
                    name="message"
                    className="h-48 bg-neutral-800 w-full p-4 rounded focus:outline-none border border-transparent"
                    placeholder="My secret is..."
                    value={message}
                  ></textarea>
                </label>

                <div className="flex justify-between">
                  <button
                    onClick={dismissEnteredKey}
                    className="mt-3 bg-neutral-700 p-2 rounded-sm text-sm focus:outline-none focus:bg-cool-red"
                  >
                    ⚙ Change key
                  </button>

                  <button
                    disabled={state === SingleNoteState.GettingDeleted}
                    onClick={deleteNote}
                    className={`mt-3 bg-cool-red p-2 rounded-sm text-sm focus:outline-none focus:bg-red-900 ${
                      state === SingleNoteState.GettingDeleted
                        ? "animate-pulse"
                        : ""
                    }`}
                  >
                    🗑{" "}
                    {state === SingleNoteState.GettingDeleted
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={decrypt}>
                <h2 className="text-italic text-center text-gray-400 text-lg">
                  Please enter the key to decrypt the note{"'"}s content
                </h2>

                <label className="block mt-3">
                  <span className="block mb-1">Encryption key</span>
                  <input
                    name="key"
                    type="password"
                    className="bg-neutral-800 w-full p-4 rounded focus:outline-none border border-transparent focus:border-cool-red"
                    placeholder="hj!ios_"
                    autoFocus
                    autoComplete="false"
                  />
                </label>

                <div className="flex justify-center">
                  <hr className="my-4 border-neutral-800 w-24" />
                </div>

                <button className="bg-neutral-700 px-4 py-6 rounded w-full text-center focus:outline-none focus:bg-cool-red duration-100">
                  Decrypt
                </button>
              </form>
            )}
          </div>
        </div>
      </Page>
    </>
  );
}
