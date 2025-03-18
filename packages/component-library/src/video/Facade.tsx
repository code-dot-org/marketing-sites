import styles from './video.module.scss';

export interface FacadeProps {
  alt: string;
  posterThumbnail?: string;
}

const Facade = ({posterThumbnail, alt}: FacadeProps) => {
  return (
    posterThumbnail && (
      <img
        className={styles.posterImage}
        src={posterThumbnail}
        loading={'lazy'}
        alt={alt}
      />
    )
  );
};

export default Facade;
