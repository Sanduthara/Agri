import React, { useRef } from "react";
import bannerImg1 from "../assets/banner.jpg";
import bannerImg2 from "../assets/banner2.jpg";
import bannerImg3 from "../assets/banner3.jpg";
import bannerImg4 from "../assets/banner4.jpg";
import bannerImg5 from "../assets/banner5.jpg";
import bannerImg6 from "../assets/banner6.jpg";

interface HeroProps {
  navigate: (path: string) => void;
}

const imageData = [
  {
    src: bannerImg1,
    title: "Sunset Skies",
    caption: "Central West, NSW",
  },
  {
    src: bannerImg2,
    title: "On-Farm Storage",
    caption: "VIC 1870",
  },
  {
    src: bannerImg3,
    title: "Harvesting Wheat",
    caption: "QLD Region",
  },
  {
    src: bannerImg4,
    title: "Canola Fields",
    caption: "SA Landscape",
  },
  {
    src: bannerImg5,
    title: "Green Growth",
    caption: "Northern Territory",
  },
  {
    src: bannerImg6,
    title: "Agricultural Machinery",
    caption: "Western Australia",
  },
];

const Hero: React.FC<HeroProps> = ({ navigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -500 : 500,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full relative" style={{ fontFamily: "'Alegreya Sans', sans-serif" }}>
      {/* Background layering */}
      <div className="absolute inset-0 flex flex-col z-0">
        <div className="h-2/4" style={{ backgroundColor: "#d4ff47" }}></div>
        <div className="h-2/4 bg-white"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Text Section */}
        <div className="py-16 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-6">
            A fairer future is possible
          </h1>
          <p className="text-xl sm:text-2xl text-gray-800 max-w-3xl mx-auto mb-8">
            Fairtrade changes the way trade works through better prices, decent
            working conditions, and a fairer deal for farmers and workers.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-medium py-3 px-8 rounded-full transition duration-300 mb-12"
          >
            Learn more about Fairtrade
          </button>
        </div>

        {/* Image Gallery Section */}
        <div className="relative max-w-7xl mx-auto pb-20">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar space-x-6 px-4 scroll-smooth"
          >
            {imageData.map((img, idx) => (
              <div key={idx} className="flex-none w-72">
                <div className="rounded-xl overflow-hidden shadow-xl">
                  <img
                    src={img.src}
                    alt={img.title}
                    className="h-[460px] w-full object-cover"
                  />
                </div>
                <div className="text-center mt-3 font-semibold text-lg italic">
                  {img.title}
                </div>
                <div className="text-center text-sm text-gray-500">
                  {img.caption}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => scroll("left")}
              className="bg-white shadow p-3 rounded-full hover:bg-gray-100"
            >
              ◀
            </button>
          </div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => scroll("right")}
              className="bg-white shadow p-3 rounded-full hover:bg-gray-100"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
