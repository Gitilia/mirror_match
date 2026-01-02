"use client"

import Image from "next/image"

export default function PhotoImage({ src, alt }: { src: string; alt: string }) {
  // Handle external URLs and local paths
  const isExternal = src.startsWith("http://") || src.startsWith("https://")
  
  if (isExternal) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        style={{ maxHeight: "100%" }}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23ddd' width='800' height='600'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage not found%3C/text%3E%3C/svg%3E"
        }}
      />
    )
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
      loading="lazy"
      unoptimized={src.startsWith("/uploads/")}
    />
  )
}
