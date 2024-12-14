export default function Description() {
  return (
    <section className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600 border border-gray-100">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">关于本站</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-700">🧾 本站主要功能</h3>
          <p>为身处南京，喜欢拍摄日出日落主题的摄影爱好者服务，监测出现火烧云的概率、质量以及空气质量，用数据帮助科学摄影。</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-700">📈 数据说明</h3>
          <div className="mt-2 space-y-4">
            <div>
              <p className="font-medium text-gray-700 mb-1">火烧云指数 (0-2.5)：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>0.001-0.05：微微烧，或者火烧云云况不典型</li>
                <li>0.05~0.2：小烧，大气很通透的情况下才会比较好看</li>
                <li>0.2~0.4：小烧到中等烧</li>
                <li>0.4~0.6：中等烧，比较值得看的火烧云</li>
                <li>0.6~0.8：中等烧到大烧程度的火烧云</li>
                <li>0.8~1.0：不是很完美的大烧火烧云</li>
                <li>1.0~1.5：典型的火烧云大烧</li>
                <li>1.5~2.0：优质大烧，范围广、云量大、颜色明亮</li>
                <li>2.0~2.5：世纪大烧，范围很广、接近满云量、颜色鲜艳</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-gray-700 mb-1">气溶胶数值 (0-0.8+)：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>0.0~0.1：（晴朗时）高级水晶天，多见于青藏高原</li>
                <li>0.1~0.2：（晴朗时）普通水晶天，天空湛蓝</li>
                <li>0.2~0.3：（晴朗时）不算水晶天但也有蓝天</li>
                <li>0.3~0.4：普通的天空</li>
                <li>0.4~0.6：天空看起来会有点污</li>
                <li>0.6~0.8：天空会相当的污，地面附近可能有霾</li>
                <li>&gt;0.8：非常污的天空，地面附近可能有比较重的霾</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700">📊 数据更新</h3>
          <p>每天更新 4 次，时间分别是 1:40 8:40 13:40 20:40</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-700">🗳️ 备注</h3>
          <p>本网站监测数据来源于https://sunsetbot.top，预测仅供参考</p>
        </div>
      </div>
    </section>
  )
} 