import {MuiVideoPosterImage} from './styledMuiComponents';

export interface FacadeProps {
  /** Facade poster thumbnail */
  posterThumbnail?: string;
  /** Facade onClick */
  onClick?: () => void;
  /** Facade poster image onLoad */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Facade alt text */
  alt: string;
}

const FacadeBackground = ({
  posterThumbnail,
  alt,
  onClick,
  onLoad,
}: FacadeProps) => {
  return (
    posterThumbnail && (
      <MuiVideoPosterImage
        onClick={onClick}
        src={posterThumbnail}
        loading="lazy"
        alt={alt}
        aria-hidden="true"
        onLoad={onLoad}
      />
    )
  );
};

export default FacadeBackground;
