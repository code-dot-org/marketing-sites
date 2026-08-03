import styles from './video.module.scss';

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
      <img
        onClick={onClick}
        className={styles.posterImage}
        src={posterThumbnail}
        loading={'lazy'}
        alt={alt}
        aria-hidden="true"
        onLoad={onLoad}
      />
    )
  );
};

export default FacadeBackground;
