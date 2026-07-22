// 火烧云 / 气溶胶数值的展示颜色（深色主题）
// 火烧云：偏高用红色（值得关注），偏低用绿色，无数据用灰色
export function getHsyszColor(value: string): string {
  const numValue = parseFloat(value)
  if (numValue > 0.8) return 'text-red-400'
  if (numValue > 0.2) return 'text-emerald-400'
  return 'text-slate-500'
}

// 气溶胶：越高越差，>0.8 重度污染用浅色，>0.4 紫色，其余绿色系
export function getQrjszColor(value: string): string {
  const numValue = parseFloat(value)
  if (numValue > 0.8) return 'text-slate-300'
  if (numValue > 0.4) return 'text-violet-400'
  if (numValue > 0.2) return 'text-emerald-500'
  return 'text-emerald-400'
}
