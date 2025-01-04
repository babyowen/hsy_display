'use client'
import Image from 'next/image'

export default function Header() {
  return (
    <div className="w-full h-[400px] relative mb-8">
      <div className="absolute inset-0">
        <Image
          src="/images/cover/sunset.jpg"
          alt="南京火烧云"
          fill
          priority={false}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
      </div>
      <div className="absolute top-0 left-0 p-8">
        <h1 className="
          text-4xl 
          font-bold 
          text-white 
          tracking-wider
          drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]
          backdrop-blur-sm
          px-6
          py-3
          rounded-lg
          bg-black/10
          border
          border-white/20
          hover:bg-black/20
          transition-all
          duration-300
          select-none
        ">
          南京火烧云监测
        </h1>
      </div>
    </div>
  )
} 