// 数据获取
let imageData = {}
let query = window.location.href.split("?")[1]


// u1 u2 cookie
fetch(`https://book.dmm.com/viewerapi/auth/?${query}&u1=18tchdnk18lc&u2=18tchdnk18lc`, {
  "headers": {
    "accept": "*/*",
  },
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
}).then(r => r.json()).then(r => {
  // 名 r.cti
  let ourl = r.url
  let data = "?"
  if (r.auth_info)
    for (let key in r.auth_info) {
      data += `${key}=${r.auth_info[key]}&`

    }
  fetch(`${ourl}configuration_pack.json` + data, {
    method: 'GET',
    credentials: 'include' // 发送cookies
  }).then(r => r.json()).then(r => {
    imageData = r

    loadImage(0, ourl, data)
  })
})


function loadImage(i = 0, ourl, data) {
  v = imageData.configuration.contents[i].file + "/0"
  let w = 0
  for (let f = 0; f < v.length; f++) {
    w += v.charCodeAt(f);
  }

  a = {
    type: "start",
    url: ourl + v + ".jpeg" + data
  }
  window.req = new XMLHttpRequest,
    window.req.open("GET", a.url),
    window.req.withCredentials = !0,
    window.req.responseType = "blob",
    window.req.send(),
    new Promise(function (a, b) {
      window.req.onreadystatechange = function () {
        window.req && 4 === window.req.readyState && (200 === self.req.status ? a(self.req.response) : b(new Error("network error in worker")), self.req = null)
      }
    }).then(function (a) {
      return window.createImageBitmap(a)
    }).then(a => {
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      canvas.width = a.width
      canvas.height = a.height
      n = makeList(a.width, a.height, 64, 64, w % 4 + 1)
      for (p = 0; p < n.length; p++) {
        o = n[p]
        ctx.drawImage(a, o.destX, o.destY, o.width, o.height, o.srcX, o.srcY, o.width, o.height);
      }

      console.log(canvas.toDataURL())
    })

}



var a = 61
  , b = 73
  , c = 4
  , d = 43
  , e = 47
  , f = 53
  , g = 59
  , h = 67
  , i = 71
  , j = 29
  , k = 37
  , l = 31
  , m = 41;
let makeList = function (a, b, f, g, h) {

  var i, n, o, p, q, r, s, t, u, v, w, x, y = Math.floor(a / f), z = Math.floor(b / g), A = a % f, B = b % g, C = [];
  if (i = y - 43 * h % y,
    i = i % y == 0 ? (y - c) % y : i,
    i = 0 == i ? y - 1 : i,
    n = z - e * h % z,
    n = n % z == 0 ? (z - c) % z : n,
    n = 0 == n ? z - 1 : n,
    A > 0 && B > 0 && (o = i * f,
      p = n * g,
      C.push({
        srcX: o,
        srcY: p,
        destX: o,
        destY: p,
        width: A,
        height: B
      })),
    B > 0)
    for (s = 0; s < y; s++)
      u = this.calcXCoordinateXRest_(s, y, h),
        v = this.calcYCoordinateXRest_(u, i, n, z, h),
        q = this.calcPositionWithRest_(u, i, A, f),
        r = v * g,
        o = this.calcPositionWithRest_(s, i, A, f),
        p = n * g,
        C.push({
          srcX: o,
          srcY: p,
          destX: q,
          destY: r,
          width: f,
          height: B
        });
  if (A > 0)
    for (t = 0; t < z; t++)
      v = this.calcYCoordinateYRest_(t, z, h),
        u = this.calcXCoordinateYRest_(v, i, n, y, h),
        q = u * f,
        r = this.calcPositionWithRest_(v, n, B, g),
        o = i * f,
        p = this.calcPositionWithRest_(t, n, B, g),
        C.push({
          srcX: o,
          srcY: p,
          destX: q,
          destY: r,
          width: A,
          height: g
        });
  for (s = 0; s < y; s++)
    for (t = 0; t < z; t++)
      u = (s + h * j + l * t) % y,
        v = (t + h * k + m * u) % z,
        w = u >= this.calcXCoordinateYRest_(v, i, n, y, h) ? A : 0,
        x = v >= this.calcYCoordinateXRest_(u, i, n, z, h) ? B : 0,
        q = u * f + w,
        r = v * g + x,
        o = s * f + (s >= i ? A : 0),
        p = t * g + (t >= n ? B : 0),
        C.push({
          srcX: o,
          srcY: p,
          destX: q,
          destY: r,
          width: f,
          height: g
        });
  return C
}

calcPositionWithRest_ = function (a, b, c, d) {
  return a * d + (a >= b ? c : 0)
}
calcXCoordinateXRest_ = function (b, c, d) {
  var e = (b + a * d) % c;
  return e
}
calcYCoordinateXRest_ = function (a, b, c, d, e) {
  var h, i, j, k, l = e % 2 === 1;
  return k = a < b ? l : !l,
    k ? (j = c,
      i = 0) : (j = d - c,
        i = c),
    h = (a + e * f + c * g) % j + i
}
calcXCoordinateYRest_ = function (a, b, c, d, e) {
  var f, g, j, k, l = e % 2 == 1;
  return k = a < c ? l : !l,
    k ? (j = d - b,
      g = b) : (j = b,
        g = 0),
    f = (a + e * h + b + i) % j + g
}
calcYCoordinateYRest_ = function (a, c, d) {
  var e = (a + b * d) % c;
  return e
}







