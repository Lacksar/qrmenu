import Image from "next/image";

const GallerySection = () => {
  const images = [
    "/images/home/one.webp",
    "/images/home/two.webp",
    "/images/home/three.webp",
    "/images/home/four.webp",
    "/images/home/five.webp",
    "/images/home/eleven.webp",
    "/images/home/seven.webp",
    "/images/home/eight.webp",
    "/images/home/nine.webp",
    "/images/home/ten.webp",
  ];

  return (
    <section className="relative py-16 bg-gradient-to-b  from-white/20 via-orange-100/30 to-white/20 ">
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-gray-800 sansita-regular">
            Our Gallery
          </h2>
        </div>

        {/* Masonry Layout */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <Image
                src={src}
                alt={`Gallery image ${index + 1}`}
                width={500}
                height={500}
                className="w-full h-auto rounded-2xl object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
