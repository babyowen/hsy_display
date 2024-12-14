# 程序需求综述
本页面是一个现代感极强的页面，用于展示南京这个城市火烧云和空气质量的状况。

# 数据来源
本页面的数据从飞书多维表格中读取

## 数据结构
datetime: 事件日期和时间
type: 事件类型(日出或日落)
hsysz: 火烧云的数值(越高表示火烧云概率越大，最小为0，最大为2.5)
        - 0.001-0.05：微微烧，或者火烧云云况不典型没有预报出来；
        - 0.05~0.2：小烧，大气很通透的情况下才会比较好看；
        - 0.2~0.4：小烧到中等烧；
        - 0.4~0.6：中等烧，比较值得看的火烧云；
        - 0.6~0.8：中等烧到大烧程度的火烧云；
        - 0.8~1.0：不是很完美的大烧火烧云，例如云量没有最高、大气偏污、持续时间偏短、有低云遮挡等；
        - 1.0~1.5：典型的火烧云大烧；
        - 1.5~2.0：优质大烧，火烧云范围广、云量大（不一定满云量）、颜色明亮、持续时间长，且大气通透；
        - 2.0~2.5：世纪大烧，火烧云范围很广、接近满云量、颜色明亮鲜艳、持续时间长，且大气非常通透；
hsypj: 火烧云评价
qrjsz: 气溶胶数值(最小为0，最大大于0.8)
     - 0.0~0.1：（如果天气晴朗）高级水晶天，多见于青藏高原；
     - 0.1~0.2：（如果天气晴朗）普通水晶天，天空湛蓝；
     - 0.2~0.3：（如果天气晴朗）不算水晶天但也有蓝天；
     - 0.3~0.4：普通的天空；
     - 0.4~0.6：天空看起来会有点污；
     - 0.6~0.8：天空会相当的污，地面附近可能有霾；
     - >0.8：非常污的天空，地面附近可能有比较重的霾；
kqzl: 空气质量评价
updatetime: 数据更新时间

## 数据说明
原始的数据源是包含今天和明天两天南京火烧云及空气质量的数据，我的飞书表格每天会更新4次，分别是1:40/8:40/13:40/20:40，更新时只会更新未来的数据，所以每次更新时可能更新两条可能更新三条或四条。
你需要从我的飞书表格中读取未来的"事件日期和时间"，然后选取最新的一次更新时间，在页面的第二部分突出显示。


# 数据展示
页面的最上部分是一个大图，展示了南京的火烧云。你可以先用一张图片演示，后期我会替换。
第二部分，突出展示。根据前面的"数据说明"，将未来的数据进行突出展示，但仅展示最近一次更新的数据。
第三部分，网站的说明，我会写一些文字，先放如下内容:
-----
🧾 本站主要功能
为身处南京，喜欢拍摄日出日落主题的摄影爱好者服务，监测出现火烧云的概率、质量以及空气质量，用数据帮助科学摄影。

📈 数据更新展示
每天更新 4 次，时间分别是 1:40 8:40 13:40 20:40
数据以”日期”、”事件时间时间”、”网站更新时间”排序，同一天同一事件数据集中展示，方便评估。
🗳️ 备注
本网站监测数据来源于https://sunsetbot.top，一个非常专业的火烧云预测网站，感谢原作者的付出。
我的小红书，欢迎关注

预测就是预测,仅供参考
-----

第四部分，表格展示。以表格形式展现最近一周的数据，如果用户有需要，可以通过翻页的形式继续展示更多的数据。


# 页面风格要求
页面风格要求现代感极强，颜色以蓝色和白色为主，页面布局要求简洁大方。
第二部分的突出展示，要将数值用红色和绿色进行突出展示，红色表示数值偏高，绿色表示数值偏低。可以增加一些图表，以增加页面的美观度。
要有苹果和google的现代风格。


# 飞书API文档
1. 获取飞书的tenant_access_token，官方文档为:https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal
2. 查询飞书的多维表格，官方文档为:https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search?appId=cli_a780c99a19ba1013
我在官方的调示台做了一个测试，随意做了一个查询已经成功，代码供你参考:
// node-sdk使用说明：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/preparation-before-development
const lark = require('@larksuiteoapi/node-sdk');

// 开发者复制该Demo后，需要修改Demo里面的"app id", "app secret"为自己应用的appId, appSecret
const client = new lark.Client({
	appId: 'app id',
	appSecret: 'app secret',
	// disableTokenCache为true时，SDK不会主动拉取并缓存token，这时需要在发起请求时，调用lark.withTenantToken("token")手动传递
	// disableTokenCache为false时，SDK会自动管理租户token的获取与刷新，无需使用lark.withTenantToken("token")手动传递token
	disableTokenCache: true
});

client.bitable.appTableRecord.search({
		path: {
			app_token: 'Uag2brDRPaZ8llsOk2Xc8wP7nfc',
			table_id: 'tblphcjqiqUCDnEE',
		},
		data: {
			view_id: 'vewuyA6api',
			field_names: ['datetime', 'type'],
			filter: {
				conjunction: 'and',
				conditions: [{
					field_name: 'type',
					operator: 'is',
					value: ['日出'],
				}],
			},
			automatic_fields: false,
		},
	},
	lark.withTenantToken("t-g104cej636N2DCFZQ4FQ6URLH2GGGRU2HJDS3S7S")
).then(res => {
	console.log(res);
}).catch(e => {
	console.error(JSON.stringify(e.response.data, null, 4));
});

// 还可以使用迭代器的方式便捷的获取数据，无需手动维护page_token
(async () => {
	for await (const item of await client.bitable.appTableRecord.searchWithIterator({
			path: {
				app_token: 'Uag2brDRPaZ8llsOk2Xc8wP7nfc',
				table_id: 'tblphcjqiqUCDnEE',
			},
		},
		lark.withTenantToken("t-g104cej636N2DCFZQ4FQ6URLH2GGGRU2HJDS3S7S")
	)) {
		console.log(item);
	}
})();


