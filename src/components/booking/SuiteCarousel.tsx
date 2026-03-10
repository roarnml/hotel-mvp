"use client"
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"

interface Props { images: string[]; name: string }

export default function SuiteCarousel({ images, name }: Props) {
  return (
    <Carousel showThumbs={false} showStatus={false} infiniteLoop autoPlay interval={5000}>
      {images.map((img, idx) => (
        <img key={idx} src={img} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
      ))}
    </Carousel>
  )
}
