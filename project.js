async function getTotal() {
  return fetch("https://publicartap.moc.gov.tw/data/api/artPlanAnnouncement?page=0&size=10&typeId=1&lang=zh-tw&sort=start_datetime,desc&sort=create_date,desc", {
    "headers": {
      "accept": "application/json, text/plain, */*",
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
  }).then(res => res.json())
    .then(res => res.total);
}

async function getDatas(size) {
  return fetch(`https://publicartap.moc.gov.tw/data/api/artPlanAnnouncement?page=0&size=${size}&typeId=1&lang=zh-tw&sort=start_datetime,desc&sort=create_date,desc`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
  }).then(res => res.json())
    .then(res => res.rows);
}

function parseData(data) {
  let item = {
    id: 0,
    orgName: '',
    title: '',
    content: '',
    link: '',
    createDate: '',
    endDatetime: ''
  }
  item.id = `${data.id}`
  item.orgName = data.orgName
  item.title = data.title
  item.content = '\n\t\t' + data.content.replaceAll('\n', '\n\t\t')
  item.link = `https://publicart.moc.gov.tw/home/zh-tw/ann/${data.id}?typeId=1&inPageIndex=1&size=10&page=0&totalPages=5`
  item.createDate = data.createDate
  item.endDatetime = data.endDatetime
  return item
}

function parseDataToMessage(data) {
  let txt = ''
  txt += `公告單位: ${data.orgName} \n`
  txt += `計畫名稱: ${data.title} \n`
  txt += `公告內容: ${data.content} \n`
  txt += `公告時間: ${new Date(data.createDate).toLocaleString()} \n`
  txt += `結束時間: ${new Date(data.endDatetime).toLocaleString()} \n`
  txt += `公告連結: ${data.link}`
  return txt
}

async function sendMessage(token, message) {
  return fetch('https://notify-api.line.me/api/notify', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`
    },
    body: `message=\n${message}`,
    method: 'POST'
  })
}

async function getJsonServer(url) {
  return fetch(url)
    .then(res => res.json())
}

async function postJsonServer(url, data) {
  return fetch(url, {
    "headers": {
      "content-type": "application/json",
    },
    "body": JSON.stringify(data),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  });
}

const main = async function () {
  // line notify token
  let pushToken = ''
  let logsToken = ''

  // crawler & parse
  let url = "http://localhost:3000/posts"
  let total = await getTotal()
  let datas = (await getDatas(total))
    .filter(data => data.pickType===1)
    .map(parseData)
    .reverse()
  
  // write data to db
  let saveDatas = await getJsonServer(url)
  let filterDatas = datas.filter(data => !saveDatas.map(tmp => tmp.id).includes(data.id))
  console.log('filterDatas:', filterDatas?.length)
  for (let data of filterDatas) {
    await postJsonServer(url, data)
    await sendMessage(pushToken, parseDataToMessage(data))
  }

  // send message to line
  await sendMessage(logsToken, "執行推播紀錄")
}

main()