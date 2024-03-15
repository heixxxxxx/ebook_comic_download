function solve() {
    drawImage(0, 0, width, height, 0, 0);
    for (let e = 0; e < 4 * 4; e++) {
        const t = Math.floor(e / 4) * cell_height,
            i = e % 4 * cell_width,
            r = Math.floor(e / 4),
            n = e % 4 * 4 + r,
            s = n % 4 * cell_width,
            o = Math.floor(n / 4) * cell_height;
        drawImage(i, t, cell_width, cell_height, s, o)
    }
}

function drawImage(e, t, i, r, s, o) {
    const a = solvedImage.getContext("2d");
    a ? (a.imageSmoothingEnabled = !1,
        a.drawImage(puzzledImage, e, t, i, r, s, o, i, r)) : l || ((0,
            n.T)(new Error("Failed to getContext")),
        l = !0)
}


function initMembers(e) {
    puzzledImage = e
    width = e.naturalWidth
    height = e.naturalHeight
    cell_width = Math.floor(width / (4 * 8)) * 8
    cell_height = Math.floor(height / (4 * 8)) * 8
    solvedImage = document.createElement("canvas")
    solvedImage.width = width
    solvedImage.height = height
}

let width
let height
let cell_width
let cell_height
let solvedImage
let puzzledImage

let image = new Image()
image.src = "https://cdn-ak-img.shonenjumpplus.com/public/page/2/10834108156648241044-31ea188b967b3694d8fcda5d2fba3bec"
image.setAttribute("crossOrigin", "anonymous");
image.onload = function () {
    initMembers(image)
    solve()
    console.log(solvedImage.toDataURL())
}