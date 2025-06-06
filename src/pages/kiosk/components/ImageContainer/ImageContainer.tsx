import "./ImageContainer.scss";

const ImageContainer: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  
  return (
    <div className="image-container">
      <img src={imageUrl} />
    </div>
  );
};

export default ImageContainer;
