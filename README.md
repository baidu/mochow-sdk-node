# 百度向量数据库 Mochow Node.js SDK

针对百度智能云向量数据库，我们推出了一套 Node.js SDK（下称Mochow SDK），方便用户通过代码调用百度向量数据库。

## 如何安装

使用`npm`命令行工具工具进行安装：
```
npm install @mochow/mochow-sdk-node
```
目前Node.js SDK可以在Node18及以上环境下运行。

## 快速使用

在使用Mochow SDK 之前，用户需要在百度智能云上创建向量数据库，以获得 API Key。API Key 是用户在调用Mochow SDK 时所需要的凭证。具体获取流程参见平台的[向量数据库使用说明文档](https://cloud.baidu.com/)。

获取到 API Key 后，用户还需要传递它们来初始化Mochow SDK。 可以通过如下方式初始化Mochow SDK：

```javascript
let mochowClient = new MochowClient({
    endpoint: "http://x.x.x.x:x",
    credential: {
        account: "xxxx",
        apiKey: "xxxx",
    },
})

let resp = await mochowClient.createDatabase(database_name)
if (resp.code != 0) {
    console.log("fail to create database due to: " + resp.msg)
    return
}
console.log("create database success")
```

## 功能

目前Mochow SDK 支持用户使用如下功能:

+ Databse 操作
+ Table 操作
+ Alias 操作
+ Index 操作
+ Row 操作

## License

Apache-2.0
