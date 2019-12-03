import { LitElement, html, TemplateResult } from "lit-element";
import "./editor";

export class MyElement extends LitElement {
  protected render(): TemplateResult {
    return html`
      <!-- template content -->
      <p>A wonderful paragraph</p>
    `;
  }
}

customElements.define("my-element", MyElement);
