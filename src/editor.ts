import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "./schema";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "./state";

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes as any, "paragraph block*", "block"),
  marks: schema.spec.marks
});

// @ts-ignore
window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector("#content")
    ),
    plugins: exampleSetup({ schema: mySchema })
  })
});
