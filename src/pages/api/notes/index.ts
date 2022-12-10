import { Deta, Base } from "deta";
import { NextApiRequest, NextApiResponse } from "next";
import { deta } from "../_deta";

export interface DatabaseNote {
  key: string;
  message: string;
  createdAt: number;
}

export interface ExternalNote extends Omit<DatabaseNote, "key"> {
  id: string;
}

// it's scalable, don't think about it
async function getId(base: ReturnType<typeof Base>) {
  let key = Math.random().toString(16).slice(2, 6);

  while (true) {
    const matchingItems = (await base.fetch({ key }))
      .items as unknown as DatabaseNote[];

    if (matchingItems.length === 0) {
      return key;
    }

    // older than 30 days, let's delete it
    if (
      new Date().getTime() - matchingItems[0].createdAt >
      1000 * 60 * 60 * 24 * 14
    ) {
      await base.delete(matchingItems[0].key);
      return key;
    }

    key = Math.random().toString(16).slice(2, 6);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (!req.body || typeof req.body.message !== "string") {
    return res
      .status(400)
      .end({ error: "Expected payload to have a `message` key." });
  }

  const message = req.body.message as string;

  const notes = deta.Base("notes");

  const note = await notes.insert({
    key: await getId(notes),
    message,
    createdAt: new Date().getTime(),
  });

  note.id = note.key;
  delete note.key;

  res.status(201).json({
    data: {
      note,
    },
  });
}
