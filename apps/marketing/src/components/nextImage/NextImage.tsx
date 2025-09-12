import BaseNextImage, {ImageProps} from 'next/image';

const NextImage = (props: ImageProps) => {
  const baseImageProps: ImageProps = {
    ...props,
    fill: props?.fill ? props.fill : true, // Fill by default to make responsive and avoid absolute width/height
  };

  return <BaseNextImage {...baseImageProps} />;
};

export default NextImage;
