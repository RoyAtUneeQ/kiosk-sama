import React, { useState, useEffect } from "react";
import "./ImageContainer.scss";

const ImageContainer: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const [loaded, setLoaded] = useState(false);

  // Optional: add a delay for smoother fade-in
  const handleImageLoad = () => {
    setLoaded(true);
  };

  useEffect(() => {
    setLoaded(false);
  }, [imageUrl]);

  return (
    <div className="image-container" style={{ opacity: loaded ? 1 : 0 }}>
      <img src={imageUrl} onLoad={handleImageLoad} />
    </div>
  );
};

export default ImageContainer;
