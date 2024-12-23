

let p_dom
Array.prototype.map = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }
  if (this[0] && this[0].type && this[0].type == 'image' && !p_dom) {
    p_dom = document.createElement("p")
    p_dom.id = "imageToContent"
    p_dom.innerText = JSON.stringify(this)
    document.body.appendChild(p_dom)
  }
  return result;
};