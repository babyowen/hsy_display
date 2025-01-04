import React from 'react'
import LatestData from '../components/LatestData'
import DataTable from '../components/DataTable'
import Description from '../components/Description'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full overflow-hidden">
        <Header />
      </div>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16 py-8 space-y-8 flex-grow">
        <LatestData />
        <DataTable />
        <Description />
      </div>
      <Footer />
    </main>
  )
}
