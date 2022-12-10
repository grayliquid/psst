import { NextApiRequest, NextApiResponse } from "next";
import { ExternalNote } from "..";
import { deta } from "../../_deta";

export async function getNote(id: string): Promise<ExternalNote | null> {
  const notes = deta.Base("notes");
  const note = await notes.get(id);

  if (!note) {
    return null;
  }

  note.id = note.key;
  delete note.key;

  return note as unknown as ExternalNote;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const noteId = req.query.id;

  if (typeof noteId !== "string") {
    return res.status(400).end();
  }

  switch (req.method) {
    case "GET": {
      const note = await getNote(noteId);

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      res.status(200).json({
        data: {
          note,
        },
      });
      break;
    }
    case "DELETE": {
      const notes = deta.Base("notes");

      const note = await getNote(noteId);

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      await notes.delete(noteId);
      res.status(200).json({ data: {} });
      break;
    }
    default:
      return res.status(405).end();
  }
}
