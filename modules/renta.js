//原脚本的数据获取
let p_dom
if (!document.getElementById("msgToECD")) {
  p_dom = document.createElement("p")
  p_dom.id = "msgToECD"
  document.body.appendChild(p_dom)
} else
  p_dom = document.getElementById("msgToECD")


let data = {
  prd_ser,
  url_base2,
  max_page,
  viewer_mode,
  auth_key,
  cache_update,
  server_name
}
p_dom.innerText = JSON.stringify(data)