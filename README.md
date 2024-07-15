# 簡介

## 架構

這是一個簡易的爬蟲專案，大致可分為三個部分

1. Crawler
2. Database
3. LINE Notify 推播

### Crawler

可以分成 crawler & parse
crawler 負責爬資料 (撈 api)
parse 負責資料處理 (處理成我們需要的格式)

### Database

由於我們存的資料量不大，所以選擇 JSON Server 作為簡易資料庫。

### LINE Notify

這邊沒什麼好特別講，直接查官方文件即可
https://notify-bot.line.me/doc/en/

## 操作方式

- 打開 DB，啟動 json server

```
json-server ./db.json
```

- 開始爬蟲 + 推播

```
node ./project.js
```
