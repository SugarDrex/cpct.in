"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { motion } from "framer-motion"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import FloatingContactForm from "./Chat"

const slides = [
  {
    img: "/cpct/cpct-about.jpg",
    title: "Master the CPCT Exam",
    subtitle: "Boost your confidence with our expertly designed CPCP practice set papers.",
  },
  {
    img: "/cpct/cpct-exams.jpg",
    title: "Structured Preparation for Success",
    subtitle: "Our practice sets follow the latest exam patterns to ensure you're fully prepared.",
  },
  {
    img: "/cpct/cpct-in.jpg",
    title: "Simulate the Real Exam",
    subtitle: "Time-bound mock tests help you build speed and accuracy before the real exam.",
  },
  {
    img: "/cpct/cpct-mock-test.jpg",
    title: "Your CPCT Exam Success Journey",
    subtitle: "Get Ready to Conquer the CPCT Exam with Confidence!",
  },
]

export default function HeroCarousel() {
  // ✅ separate plugin instances
  const desktopPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  )

  const mobilePlugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false })
  )

  return (
    <>
      <div id="home" className="hidden md:block w-full py-21">
        <Carousel opts={{ loop: true }} plugins={[mobilePlugin.current]}>
          <CarouselContent>
            {slides.map((slide, i) => (
              <CarouselItem key={i}>
                <div className="relative h-[82vh] w-full overflow-hidden">
                  <img
                    src={slide.img}
                    className="w-full h-full object-cover"
                    alt=""
                  />

                  <div className="absolute inset-0 bg-black/60" />
                  <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="
    backdrop-blur-md rounded-2xl w-full max-w-3xl
    h-[200px] sm:h-[240px] md:h-[280px]
    px-6 md:px-12
    flex flex-col justify-center items-center text-center shadow-2xl
    bg-black/60 dark:bg-black/70
  ">

                      <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="
        font-extrabold leading-tight
        text-2xl sm:text-3xl md:text-5xl
        text-white dark:text-blue-400
      "
                      >
                        {slide.title}
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9 }}
                        className="
        mt-4 text-sm sm:text-base md:text-xl
        text-white/90 dark:text-blue-300
      "
                      >
                        {slide.subtitle}
                      </motion.p>

                    </div>
                  </div>

                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-2 size-7" />
          <CarouselNext className="right-2 size-7" />
        </Carousel>
      </div>
      <div className="w-full lg:hidden py-10 sm:py-14 md:py-16">
        <Carousel opts={{ loop: true }} plugins={[desktopPlugin.current]}>
          <CarouselContent> {slides.map((slide, i) => (
            <CarouselItem key={i}> <div className="relative h-[] w-full overflow-hidden rounded">

              <div className="relative h-[70vh] sm:h-[80vh] w-full overflow-hidden rounded">

                <motion.img
                  src={slide.img}
                  alt=""
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />

              </div>
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-3xl px-16">
                  <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="text-white font-bold text-5xl leading-tight" >
                    {slide.title}
                  </motion.h2>
                  <motion.p initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="text-white/90 mt-4 text-xl" > {slide.subtitle} </motion.p>
                </div>
              </div> </div> </CarouselItem>))} </CarouselContent>
          <CarouselPrevious className="left-3 ml-0 size-7" />
          <CarouselNext className="-right-3 size-7" />
        </Carousel>

      </div>
    </>
  )
}
