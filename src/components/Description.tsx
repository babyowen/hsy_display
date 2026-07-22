import { Info, Sun, BarChart3, RefreshCcw, FileText } from 'lucide-react'

export default function Description() {
  return (
    <section className="glass-panel rounded-2xl p-8 text-sm text-slate-300">
      <div className="mb-6 flex items-center gap-3">
        <Info className="h-5 w-5 text-ember-400" />
        <h2 className="text-lg font-semibold tracking-wider text-white">关于本站</h2>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-7">
          {/* 左侧：主要功能和数据更新 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-400" />
              <h3 className="font-medium text-slate-100">本站主要功能</h3>
            </div>
            <p className="leading-relaxed text-slate-400">
              为身处南京，喜欢拍摄日出日落主题的摄影爱好者服务，监测出现火烧云的概率、质量以及空气质量，用数据帮助科学摄影。
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-emerald-400" />
              <h3 className="font-medium text-slate-100">数据更新</h3>
            </div>
            <p className="leading-relaxed text-slate-400">
              每天更新 4 次，时间分别是
              <span className="font-mono-num text-emerald-300"> 1:40 / 8:40 / 13:40 / 20:40</span>
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              <h3 className="font-medium text-slate-100">备注</h3>
            </div>
            <p className="leading-relaxed text-slate-400">
              本网站监测数据来源于
              <a
                href="https://sunsetbot.top"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ember-300 underline decoration-ember-500/40 underline-offset-4 transition-colors hover:text-ember-200"
              >
                sunsetbot.top
              </a>
              ，预测仅供参考
            </p>
          </div>
        </div>

        <div>
          {/* 右侧：数据说明 */}
          <div className="mb-4 flex items-center gap-2">
            <Sun className="h-4 w-4 text-ember-400" />
            <h3 className="font-medium text-slate-100">数据说明</h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-ember-500/20 bg-ember-500/5 p-4">
              <p className="mb-3 font-mono-num text-xs font-medium uppercase tracking-[0.2em] text-ember-300">
                火烧云指数 (0-2.5)
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-slate-200">轻度 (0-0.4)</div>
                  <div className="text-slate-400">
                    <div>0.001-0.05: 微微烧</div>
                    <div>0.05-0.2: 小烧</div>
                    <div>0.2-0.4: 小到中烧</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-slate-200">中度 (0.4-1.0)</div>
                  <div className="text-slate-400">
                    <div>0.4-0.6: 中等烧</div>
                    <div>0.6-0.8: 中到大烧</div>
                    <div>0.8-1.0: 不完美大烧</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-red-400">强度 (1.0+)</div>
                  <div className="text-slate-400">
                    <div>1.0-1.5: 典型大烧</div>
                    <div>1.5-2.0: 优质大烧</div>
                    <div>2.0-2.5: 世纪大烧</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <p className="mb-3 font-mono-num text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
                气溶胶数值 (0-0.8+)
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-emerald-300">优 (0-0.2)</div>
                  <div className="text-slate-400">
                    <div>0.0-0.1: 高级水晶天</div>
                    <div>0.1-0.2: 普通水晶天</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-slate-200">良 (0.2-0.4)</div>
                  <div className="text-slate-400">
                    <div>0.2-0.3: 有蓝天</div>
                    <div>0.3-0.4: 普通天空</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-violet-300">差 (0.4+)</div>
                  <div className="text-slate-400">
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
