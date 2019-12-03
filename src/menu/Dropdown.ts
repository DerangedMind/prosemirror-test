import crel from 'crel';
import { setClass, combineUpdates, translate } from './common';

const prefix = 'ProseMirror-menu';

// ::- An icon or label that, when clicked, executes a command.
let lastMenuEvent = { time: 0, node: null };
function markMenuEvent(e) {
  lastMenuEvent.time = Date.now();
  lastMenuEvent.node = e.target;
}
function isMenuEvent(wrapper) {
  return (
    Date.now() - 100 < lastMenuEvent.time &&
    lastMenuEvent.node &&
    wrapper.contains(lastMenuEvent.node)
  );
}

interface DropdownOptions {
  label?: string;
  title?: string;
  class?: string;
  css?: string;
}

// ::- A drop-down menu, displayed as a label with a downwards-pointing
// triangle to the right of it.
export class Dropdown {
  // :: ([MenuElement], ?Object)
  // Create a dropdown wrapping the elements. Options may include
  // the following properties:
  //
  // **`label`**`: string`
  //   : The label to show on the drop-down control.
  //
  // **`title`**`: string`
  //   : Sets the
  //     [`title`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title)
  //     attribute given to the menu control.
  //
  // **`class`**`: string`
  //   : When given, adds an extra CSS class to the menu control.
  //
  // **`css`**`: string`
  //   : When given, adds an extra set of CSS styles to the menu control.
  protected options: DropdownOptions;
  protected content: any;

  constructor(content, options: DropdownOptions) {
    this.options = options || {};
    this.content = Array.isArray(content) ? content : [content];
  }

  // :: (EditorView) → {dom: dom.Node, update: (EditorState)}
  // Render the dropdown menu and sub-items.
  render(view) {
    let content = renderDropdownItems(this.content, view);

    let label = crel(
      'div',
      {
        class: prefix + '-dropdown ' + (this.options.class || ''),
        style: this.options.css,
      },
      translate(view, this.options.label)
    );
    if (this.options.title)
      label.setAttribute('title', translate(view, this.options.title));
    let wrap = crel('div', { class: prefix + '-dropdown-wrap' }, label);
    let open = null,
      listeningOnClose = null;
    let close = () => {
      if (open && open.close()) {
        open = null;
        window.removeEventListener('mousedown', listeningOnClose);
      }
    };
    label.addEventListener('mousedown', (e) => {
      e.preventDefault();
      markMenuEvent(e);
      if (open) {
        close();
      } else {
        open = this.expand(wrap, content.dom);
        window.addEventListener(
          'mousedown',
          (listeningOnClose = () => {
            if (!isMenuEvent(wrap)) close();
          })
        );
      }
    });

    function update(state) {
      let inner = content.update(state);
      wrap.style.display = inner ? '' : 'none';
      return inner;
    }

    return { dom: wrap, update };
  }

  expand(dom, items) {
    let menuDOM = crel(
      'div',
      { class: prefix + '-dropdown-menu ' + (this.options.class || '') },
      items
    );

    let done = false;
    function close() {
      if (done) return;
      done = true;
      dom.removeChild(menuDOM);
      return true;
    }
    dom.appendChild(menuDOM);
    return { close, node: menuDOM };
  }
}

function renderDropdownItems(items, view) {
  let rendered = [],
    updates = [];
  for (let i = 0; i < items.length; i++) {
    let { dom, update } = items[i].render(view);
    rendered.push(crel('div', { class: prefix + '-dropdown-item' }, dom));
    updates.push(update);
  }
  return { dom: rendered, update: combineUpdates(updates, rendered) };
}

// ::- Represents a submenu wrapping a group of elements that start
// hidden and expand to the right when hovered over or tapped.
export class DropdownSubmenu {
  // :: ([MenuElement], ?Object)
  // Creates a submenu for the given group of menu elements. The
  // following options are recognized:
  //
  // **`label`**`: string`
  //   : The label to show on the submenu.

  protected options: any;
  protected content: any;

  constructor(content, options) {
    this.options = options || {};
    this.content = Array.isArray(content) ? content : [content];
  }

  // :: (EditorView) → {dom: dom.Node, update: (EditorState) → bool}
  // Renders the submenu.
  render(view) {
    let items = renderDropdownItems(this.content, view);

    let label = crel(
      'div',
      { class: prefix + '-submenu-label' },
      translate(view, this.options.label)
    );
    let wrap = crel(
      'div',
      { class: prefix + '-submenu-wrap' },
      label,
      crel('div', { class: prefix + '-submenu' }, items.dom)
    );
    let listeningOnClose = null;
    label.addEventListener('mousedown', (e) => {
      e.preventDefault();
      markMenuEvent(e);
      setClass(wrap, prefix + '-submenu-wrap-active');
      if (!listeningOnClose)
        window.addEventListener(
          'mousedown',
          (listeningOnClose = () => {
            if (!isMenuEvent(wrap)) {
              wrap.classList.remove(prefix + '-submenu-wrap-active');
              window.removeEventListener('mousedown', listeningOnClose);
              listeningOnClose = null;
            }
          })
        );
    });

    function update(state) {
      let inner = items.update(state);
      wrap.style.display = inner ? '' : 'none';
      return inner;
    }
    return { dom: wrap, update };
  }
}
