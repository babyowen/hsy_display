import { Info, Sun, BarChart3, RefreshCcw, FileText } from 'lucide-react'

export default function Description() {
  return (
    <section className="bg-white/50 backdrop-blur-sm rounded-xl p-8 text-sm text-gray-600 border border-gray-100/50 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Info className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-medium text-gray-700">关于本站</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* 左侧：主要功能和数据更新 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="font-medium text-gray-700">本站主要功能</h3>
            </div>
            <p className="leading-relaxed">
              为身处南京，喜欢拍摄日出日落主题的摄影爱好者服务，监测出现火烧云的概率、质量以及空气质量，用数据帮助科学摄影。
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCcw className="w-4 h-4 text-green-500" />
              <h3 className="font-medium text-gray-700">数据更新</h3>
            </div>
            <p className="leading-relaxed">每天更新 4 次，时间分别是 1:40 8:40 13:40 20:40</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <h3 className="font-medium text-gray-700">备注</h3>
            </div>
            <p className="leading-relaxed">
              本网站监测数据来源于
              <a 
                href="https://sunsetbot.top" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                sunsetbot.top
              </a>
              ，预测仅供参考
            </p>
          </div>
        </div>

        <div>
          {/* 右侧：数据说明 */}
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-4 h-4 text-orange-500" />
            <h3 className="font-medium text-gray-700">数据说明</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100/50">
              <p className="font-medium text-gray-700 mb-2">火烧云指数 (0-2.5)</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-gray-600">轻度 (0-0.4)</div>
                  <div className="text-gray-500">
                    <div>0.001-0.05: 微微烧</div>
                    <div>0.05-0.2: 小烧</div>
                    <div>0.2-0.4: 小到中烧</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-600">中度 (0.4-1.0)</div>
                  <div className="text-gray-500">
                    <div>0.4-0.6: 中等烧</div>
                    <div>0.6-0.8: 中到大烧</div>
                    <div>0.8-1.0: 不完美大烧</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-600">强度 (1.0+)</div>
                  <div className="text-gray-500">
                    <div>1.0-1.5: 典型大烧</div>
                    <div>1.5-2.0: 优质大烧</div>
                    <div>2.0-2.5: 世纪大烧</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/50">
              <p className="font-medium text-gray-700 mb-2">气溶胶数值 (0-0.8+)</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-gray-600">优 (0-0.2)</div>
                  <div className="text-gray-500">
                    <div>0.0-0.1: 高级水晶天</div>
                    <div>0.1-0.2: 普通水晶天</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-600">良 (0.2-0.4)</div>
                  <div className="text-gray-500">
                    <div>0.2-0.3: 有蓝天</div>
                    <div>0.3-0.4: 普通天空</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-600">差 (0.4+)</div>
                  <div className="text-gray-500">
                    <div>0.4-0.6: 天空略污</div>
                    <div>0.6-0.8: 天空较污</div>
                    <div>&gt;0.8: 重度污染</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 