import LatestData from '@/components/LatestData'
import Description from '@/components/Description'
import DataTable from '@/components/DataTable'
import Header from '@/components/Header'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full overflow-hidden">
        <Header />
      </div>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16 py-8 space-y-8">
        <LatestData />
        <DataTable />
        <Description />
      </div>
    </main>
  )
}
