import React from "react";

interface SkeletonLoaderProps {
  height?: string;
  width?: string;
  rounded?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = "h-6",
  width = "w-full",
  rounded = "rounded-lg",
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 ${height} ${width} ${rounded}`}
    ></div>
  );
};

export default SkeletonLoader;
