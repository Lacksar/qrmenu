import { FaUser } from "react-icons/fa";

const testimonials = [
  {
    name: "Christina Hoskins",
    quote:
      "Best gnocchi I have ever had! Better than Italy:) very impressed so light and fresh and pizza so authentic 😊🇮🇹",
  },
  {
    name: "Anthony Comninos",
    quote:
      "Recently ordered food from this venue and it was outstanding! Quick service and tasty food",
  },
  {
    name: "Romain P",
    quote:
      "Quite simply the only authentic Italian pizza in Engadine. Everywere else offers American style pizza with too much toppings. Thumbs up to cafe pancetta the toppings taste great and the dough is amazing!",
  },
  {
    name: "Santiago Tenorio",
    quote:
      "it was a truly unbelievable experience that I decided to try last Thursday night and I couldn't be more satisfied by the quality of the pizzas.. definitely worth my time to write this review. Can't wait to get more!",
  },
];

const TestimonialCard = ({ name, quote }) => (
  <div className="flex items-start space-x-4 sansita-regular">
    <div className="flex-shrink-0">
      <div className="w-20 h-20 rounded-full bg-orange-400 flex items-center justify-center">
        <FaUser className="text-white text-4xl" />
      </div>
    </div>
    <div>
      <p className="text-gray-600 italic">"{quote}"</p>
      <p className="mt-2 font-semibold text-gray-800 poppins-medium">
        - {name}
      </p>
    </div>
  </div>
);

const Testimonials = () => {
  return (
    <section
      className="bg-white py-20 ml-auto mr-auto max-w-5xl"
      style={{
        backgroundImage: "url(/images/background.webp)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl  text-gray-800 sansita-regular">
          Our Happy Customers
        </h2>
        <p className="text-gray-600 mt-2 mb-12 poppins-regular">
          Hear what our happy customers say about us
        </p>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 text-left">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
