import React from "react";

const SectionHeaders = ({ subTitle, title }) => {
  return (
    <div className="text-center mb-8">
      <h3 className="uppercase text-gray-500 font-semibold leading-4">
        {subTitle}
      </h3>
      <h2 className="text-primary font-bold text-4xl italic">{title}</h2>
    </div>
  );
};

export default SectionHeaders;
