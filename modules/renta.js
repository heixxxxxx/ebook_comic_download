//原脚本的数据获取
let p_dom = document.createElement("p")
p_dom.id = "msgToECD"
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
document.body.appendChild(p_dom)