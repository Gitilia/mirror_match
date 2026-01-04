"use client"

import Image from "next/image"

export default function PhotoThumbnail({ src, alt }: { src: string; alt: string }) {
  // Handle external URLs and local paths
  const isExternal = src.startsWith("http://") || src.startsWith("https://")
  const isLocalUpload = src.startsWith("/uploads/")
  
  return (
    <div className="w-full h-full relative">
      {isExternal || isLocalUpload ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23ddd' width='400' height='400'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage not found%3C/text%3E%3C/svg%3E"
          }}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          loading="lazy"
        />
      )}
    </div>
  )
}
