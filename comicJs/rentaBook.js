
let canvas = document.createElement("canvas")
let ctx = canvas.getContext("2d")
class RentaComic {

  constructor(webObj) {

    injectedScriptToPage("/modules/renta.js")
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.data = {}
    this.imageList = []
    this.getInfo()
    this.zipFlag = false
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.downloadImg()
  }
  downloadZip() {
    this.zipFlag = true
zip = new JSZip();
    this.downloadImg()
  }
  getInfo() {
    if (document.getElementById("msgToECD")) {
      this.data = JSON.parse(document.getElementById("msgToECD").innerText)
      this.comicMsg["总页数"] = this.data.max_page
      this.sendMsg(1)
    } else {
      setTimeout(() => { this.getInfo() }, 100)
    }
  }
  downloadImg(pagePart = 1) {
    if (pagePart > this.data.max_page) {
      if (this.zipFlag) {
        zip.generateAsync({ type: "blob" })
          .then((content) => {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = (this.comicMsg['漫画名'] || this.comicMsg['书名'] || '下载') + ".zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.sendMsg(4)
          });
      } else {
        this.sendMsg(4)
      }
      return 0
    }
    //发送请求
    var data_url = this.data.url_base2 + pagePart;
    data_url = this.add_param(data_url);
    var data_xhr = new XMLHttpRequest();
    data_xhr.open("GET", data_url, true);
    data_xhr.responseType = "arraybuffer";
    //发送请求
    data_xhr.withCredentials = true;
    data_xhr.send();
    //请求的回调
    data_xhr.onreadystatechange = (e) => {
      if (e.target.readyState == 4) {
        if (e.target.status == 200) {
          //res就是加密二进制
          var res = e.target.response;
          var cdata = new Uint8Array(res);
          var idx_len = "";
          for (var i = 0; i < 9; i++) {
            idx_len += String.fromCharCode(cdata[i]);
          }
          idx_len = Math.ceil(idx_len, 10);
          var idx_len = "";
          for (var i = 0; i < 9; i++) {
            idx_len += String.fromCharCode(cdata[i]);
          }
          idx_len = Math.ceil(idx_len, 10);
          var idx = "";
          for (var i = 9; i < (idx_len + 9); i++) {
            idx += String.fromCharCode(cdata[i]);
          }
          var cnt = 0;
          var data = new Array();
          for (var i = (9 + idx_len); i < cdata.length; i++) {
            data[cnt] = cdata[i];
            cnt++;
          }
          var x = 7;
          var y = 7;

          //关键数据 ar_idx的前4个参数是 全图宽度 全图高度 横着的小边（大概7像素）竖着的
          //后面49个参数是用来计算绘制位置的
          var ar_idx = idx.split("|");

          var o_width = ar_idx[0];
          var o_height = ar_idx[1];

          var diff_w_idx = ar_idx[2]
          var diff_h_idx = ar_idx[3]

          ar_idx = ar_idx.splice(4);
          canvas.width = o_width;
          canvas.height = o_height;

          //很好笑 他们画不画横竖两条边 是用宽高算的
          var width = parseInt(o_width / x);
          var height = parseInt(o_height / y);

          var diff_w = parseInt(o_width % x);
          var diff_h = parseInt(o_height % y);

          var src = "";
          if (diff_w != 0 || diff_h != 0) {
            //分别是  只画左边 只画上边 都画 
            if (diff_w != 0 && diff_h == 0) {
              // x軸のみ差分あり
              var dx_obj = new Image();
              src = this.f_get_data(diff_w_idx, data);
              dx_obj.src = "data:image/jpeg;base64," + src;
              dx_obj.onload = () => {
                ctx.drawImage(dx_obj, 0, 0, diff_w, o_height, 0, 0, diff_w, o_height);
              }
            }
            else if (diff_w == 0 && diff_h != 0) {
              // y軸のみ差分あり
              var dy_obj = new Image();
              src = this.f_get_data(diff_h_idx, data);
              dy_obj.src = "data:image/jpeg;base64," + src;
              dy_obj.onload = () => {
                ctx.drawImage(dy_obj, 0, 0, o_width, diff_h, 0, 0, o_width, diff_h);
              }
            }
            else {
              // 両軸差分あり
              var dx_obj = new Image();
              src = this.f_get_data(diff_w_idx, data);
              dx_obj.src = "data:image/jpeg;base64," + src;
              dx_obj.onload = () => {
                ctx.drawImage(dx_obj, 0, 0, diff_w, o_height, 0, 0, diff_w, o_height);
              }

              var dy_obj = new Image();
              src = this.f_get_data(diff_h_idx, data);
              dy_obj.src = "data:image/jpeg;base64," + src;
              dy_obj.onload = () => {
                ctx.drawImage(dy_obj, 0, 0, o_width, diff_h, 0, 0, o_width, diff_h);
              }
            }
          }
          //下面这我也不知道在干嘛 感觉能删
          var cnt = 0;
          var ar_number = new Array(x);
          for (var i = 0; i < y; i++) {
            ar_number[i] = new Array(y);
            for (var j = 0; j < x; j++) {
              ar_number[i][j] = cnt;
              cnt++;
            }
          }
          for (var i = 0; i < y; i++) {
            var ar_tmp = new Array(x);
            var st = x - i % x;
            for (var j = 0; j < x; j++) {
              if (st >= x) { st = 0; }
              ar_tmp[j] = ar_number[i][st];
              st += 1;
            }
            for (var j = 0; j < x; j++) {
              ar_number[i][j] = ar_tmp[j];
            }
          }
          for (var i = 0; i < x; i++) {
            var ar_tmp = new Array(y);
            var st = y - i % y;
            for (var j = 0; j < y; j++) {
              if (st >= y) { st = 0; }
              ar_tmp[j] = ar_number[st][i];
              st += 1;
            }
            for (var j = 0; j < y; j++) {
              ar_number[j][i] = ar_tmp[j];
            }
          }
          //从这里开始算具体绘制位置 主要是得到ar_number，再来计算下面需要的ar_didx
          var max_loop = 20;
          for (var i = 0; i < x; i++) {
            var num = i + 1;
            var seed = parseInt(pagePart) + parseInt(this.data.prd_ser);
            if (seed % max_loop == 0) {
              seed = Math.abs(pagePart - this.data.prd_ser) + (max_loop + 1);
            }

            var k = parseInt(((num * seed) + (pagePart / max_loop)) % max_loop);
            for (var j = k - 1; j >= 0; j--) {
              ar_number = this.f_shuffle_r(ar_number, j, i, y);
            }
          }
          //ar_didx 排序
          let total = x * y
          var ar_didx = new Array(total);
          for (var i = 0; i < y; i++) {
            for (var j = 0; j < x; j++) {
              var number = ar_number[i][j];
              ar_didx[number] = new Array(2);
              ar_didx[number]["0"] = j;
              ar_didx[number]["1"] = i;
            }
          }

          //这里循环绘制49次
          this.draw(pagePart, ar_idx, ar_didx, total, width, height, diff_w, diff_h, data)
        }
      }
    };


  }
  draw(page, ar_idx, ar_didx, total, width, height, diff_w, diff_h, data, i = 0) {
    //画完
    if (i == total) {
      if (this.zipFlag) {
        zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
      } else {
        chrome.runtime.sendMessage({
          downloadUrl: canvas.toDataURL(),
          filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
        });
      }
      this.sendMsg(2, {
        allPage: this.data.max_page,
        nowPage: page
      })
      setTimeout(() => {
        this.downloadImg(page + 1)
      }, 200)
      return 0
    }
    let src = this.f_get_data(ar_idx[i], data);
    let img_obj = new Image();

    img_obj.src = "data:image/jpeg;base64," + src;
    img_obj.w = ar_didx[i][0] * width + diff_w
    img_obj.h = ar_didx[i][1] * height + diff_h

    img_obj.onload = () => {
      ctx.drawImage(img_obj, 0, 0, width, height, img_obj.w, img_obj.h, width, height);

      this.draw(page, ar_idx, ar_didx, total, width, height, diff_w, diff_h, data, i + 1)


    }


  }
  //拼图绘制顺序（直接复制的）
  f_shuffle_r(ar_number, snum, x_idx, y) {
    let kn = parseInt(y / 2)
    var gn = kn
    if (y % 2 != 0) { gn += 1; }

    var ar_g = new Array(gn);
    var ar_k = new Array(kn);

    var k_cnt = 0;
    var g_cnt = 0;

    var ar_tmp = new Array(y);
    var cnt = 0;
    if (snum % 2 == 0) {
      for (var i = 0; i < y; i++) {
        if (i % 2 == 0) {
          ar_g[g_cnt] = ar_number[i][x_idx];
          g_cnt++;
        }
        else {
          ar_k[k_cnt] = ar_number[i][x_idx];
          k_cnt++;
        }
      }

      for (var i = 0; i < gn; i++) {
        // 奇数、偶数の入れ替え
        if (ar_k[i] != undefined) {
          ar_tmp[cnt] = ar_k[i];
          cnt++;
        }
        if (ar_g[i] != undefined) {
          ar_tmp[cnt] = ar_g[i];
          cnt++;
        }
      }
    }
    else {
      for (var i = 0; i < y; i++) {
        if (i < gn) {
          ar_g[g_cnt] = ar_number[i][x_idx];
          g_cnt++;
        }
        else {
          ar_k[k_cnt] = ar_number[i][x_idx];
          k_cnt++;
        }
      }

      for (var i = 0; i < gn; i++) {
        // 偶数->奇数の順番に挿入
        if (ar_g[i] != undefined) {
          ar_tmp[cnt] = ar_g[i];
          cnt++;
        }
        if (ar_k[i] != undefined) {
          ar_tmp[cnt] = ar_k[i];
          cnt++;
        }
      }
    }

    // 元配列を書き換える	
    for (var i = 0; i < y; i++) {
      ar_number[i][x_idx] = ar_tmp[i];
    }

    ar_tmp = null;
    ar_g = null;
    ar_k = null;
    return ar_number;
  }
  //参数补充（直接复制的）
  add_param(chk_url) {
    if (this.data.cache_update != "0") {
      chk_url += "?date=" + this.data.cache_update;
      if (this.data.auth_key != "") {
        chk_url += "&" + this.data.auth_key;
      }
    }
    else {
      if (this.data.auth_key != "") {
        chk_url += "?" + this.data.auth_key;
      }
    }

    if (this.data.viewer_mode == "akamai") {
      // akamaiの場合、originクエリ文字列を付けることで別キャッシュ扱いにする
      chk_url += "&origin=" + this.data.server_name;
    }
    return chk_url;
  }
  //图像地址（直接复制的）
  f_get_data(idx, data) {

    if (idx == 0) { return ""; }
    var ar_tmp = idx.split(",");

    var st = parseInt(ar_tmp[0]);
    var ed = parseInt(ar_tmp[0]) + parseInt(ar_tmp[1]);

    var cdata = "";
    for (var i = st; i < ed; i++) {
      cdata += String.fromCharCode(data[i]);
    }

    // base64encode


    return window.btoa(cdata);
  }
}


