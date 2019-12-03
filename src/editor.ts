import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from './schema';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from './plugins';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes as any, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

class EditorRender {
  public view: EditorView;

  public constructor(targetEditor: string, targetContent: string) {
    this.view = new EditorView(document.querySelector(targetEditor), {
      state: EditorState.create({
        doc: DOMParser.fromSchema(mySchema).parse(
          document.querySelector(targetContent)
        ),
        plugins: exampleSetup({ schema: mySchema }),
      }),
    });
  }
}

const editor = new EditorRender('#editor', '#content');
