import crel from 'crel';

import { MenuItemSpec } from 'prosemirror-menu';
import { getIcon } from './icons';
import { setClass, translate } from './common';
import { EditorView } from 'prosemirror-view';

const prefix = 'ProseMirror-menu';

export class MenuItem {
  protected spec: MenuItemSpec;
  // :: (MenuItemSpec)
  constructor(spec: MenuItemSpec) {
    // :: MenuItemSpec
    // The spec used to create the menu item.
    this.spec = spec;
  }

  // :: (EditorView) → {dom: dom.Node, update: (EditorState) → bool}
  // Renders the icon according to its [display
  // spec](#menu.MenuItemSpec.display), and adds an event handler which
  // executes the command when the representation is clicked.
  protected render(view: EditorView): any {
    let spec: MenuItemSpec = this.spec;
    let dom = spec.render
      ? spec.render(view)
      : spec.icon
      ? getIcon(spec.icon)
      : spec.label
      ? crel('div', null, translate(view, spec.label))
      : null;
    if (!dom) throw new RangeError('MenuItem without icon or label property');
    if (spec.title) {
      const title =
        typeof spec.title === 'function' ? spec.title(view.state) : spec.title;
      dom.setAttribute('title', translate(view, title));
    }
    if (spec.class) dom.classList.add(spec.class);
    if (spec.css) dom.style.cssText += spec.css;

    dom.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!dom.classList.contains(prefix + '-disabled'))
        spec.run(view.state, view.dispatch, view, e);
    });

    function update(state): boolean {
      if (spec.select) {
        let selected = spec.select(state);
        dom.style.display = selected ? '' : 'none';
        if (!selected) return false;
      }
      let enabled = true;
      if (spec.enable) {
        enabled = spec.enable(state) || false;
        setClass(dom, prefix + '-disabled', !enabled);
      }
      if (spec.active) {
        let active = (enabled && spec.active(state)) || false;
        setClass(dom, prefix + '-active', active);
      }
      return true;
    }

    return { dom, update };
  }
}

// MenuItemSpec:: interface
// The configuration object passed to the `MenuItem` constructor.
//
//   run:: (EditorState, (Transaction), EditorView, dom.Event)
//   The function to execute when the menu item is activated.
//
//   select:: ?(EditorState) → bool
//   Optional function that is used to determine whether the item is
//   appropriate at the moment. Deselected items will be hidden.
//
//   enable:: ?(EditorState) → bool
//   Function that is used to determine if the item is enabled. If
//   given and returning false, the item will be given a disabled
//   styling.
//
//   active:: ?(EditorState) → bool
//   A predicate function to determine whether the item is 'active' (for
//   example, the item for toggling the strong mark might be active then
//   the cursor is in strong text).
//
//   render:: ?(EditorView) → dom.Node
//   A function that renders the item. You must provide either this,
//   [`icon`](#menu.MenuItemSpec.icon), or [`label`](#MenuItemSpec.label).
//
//   icon:: ?Object
//   Describes an icon to show for this item. The object may specify
//   an SVG icon, in which case its `path` property should be an [SVG
//   path
//   spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d),
//   and `width` and `height` should provide the viewbox in which that
//   path exists. Alternatively, it may have a `text` property
//   specifying a string of text that makes up the icon, with an
//   optional `css` property giving additional CSS styling for the
//   text. _Or_ it may contain `dom` property containing a DOM node.
//
//   label:: ?string
//   Makes the item show up as a text label. Mostly useful for items
//   wrapped in a [drop-down](#menu.Dropdown) or similar menu. The object
//   should have a `label` property providing the text to display.
//
//   title:: ?union<string, (EditorState) → string>
//   Defines DOM title (mouseover) text for the item.
//
//   class:: ?string
//   Optionally adds a CSS class to the item's DOM representation.
//
//   css:: ?string
//   Optionally adds a string of inline CSS to the item's DOM
//   representation.
//
//   execEvent:: ?string
//   Defines which event on the command's DOM representation should
//   trigger the execution of the command. Defaults to mousedown.
