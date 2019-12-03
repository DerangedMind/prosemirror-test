// Work around classList.toggle being broken in IE11
export function setClass(dom, cls, on?) {
  if (on) dom.classList.add(cls);
  else dom.classList.remove(cls);
}

export function combineUpdates(updates, nodes) {
  return (state) => {
    let something = false;
    for (let i = 0; i < updates.length; i++) {
      let up = updates[i](state);
      nodes[i].style.display = up ? '' : 'none';
      if (up) something = true;
    }
    return something;
  };
}

export function translate(view, text) {
  return view._props.translate ? view._props.translate(text) : text;
}
