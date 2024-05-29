
let drawInfo = []
let ecdCanvas = document.createElement("canvas")
let ecdCtx = ecdCanvas.getContext('2d')
let ecdP = document.createElement("p")
let ecdPage = document.createElement("p")
ecdP.style.display = "none"
ecdPage.style.display = "none"
ecdP.id = "ecdP"
ecdPage.id = "ecdPage"
document.body.appendChild(ecdP)
document.body.appendChild(ecdPage)
let canvas
document.ecdCreate = document.createElement
document.createElement = function (tag) {
  if (tag == 'canvas') {
    canvas = document.ecdCreate(tag)
    catchPage()
    return canvas
  } else {
    return document.ecdCreate(tag)
  }
}

function catchPage() {

  let ctx = canvas.getContext('2d')
  ctx.ecdDraw = ctx.drawImage
  let page = {}
  ctx.drawImage = function (image, t, r, c, i, u, o, a, f) {
    if ((u == 0 && o == 0) || (u == page.width && o == 0)) {
      //画满一页
      if (page.list && page.list.length >= 15 * 16) {
        if (!drawInfo.some(item => {
          if (item.url == page.url) {
            return true
          }
        })) {
          drawInfo.push(page)
          if (document.getElementById('ecdP')) document.getElementById('ecdP').innerText = JSON.stringify(drawInfo)

          ecdPage.innerText = JSON.stringify(page)


        }

      }
      page = {
        url: image.src,
        list: [[t, r, c, i, u - canvas.width > 0 ? u - canvas.width : u, o, a, f]],
        width: canvas.width,
        height: canvas.height
      }
    } else {
      if (page.list.length) {
        //如果中途更换url 舍弃这页
        if (image.src !== page.url) { page.list.length = [] }
        else {
          page.list.push([t, r, c, i, u - page.width > 0 ? u - page.width : u, o, a, f])
        }

      }

    }
    ctx.ecdDraw(image, t, r, c, i, u, o, a, f)
  }
}
