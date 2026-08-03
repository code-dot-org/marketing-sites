import FacadeBackground from '@/video/FacadeBackground';
import PlayButton from '@/video/PlayButton';

import moduleStyles from './video.module.scss';

const Facade = ({
  label,
  posterThumbnail,
  onClick,
  onPosterLoad,
}: {
  label: string;
  posterThumbnail: string;
  onClick: () => void;
  onPosterLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
  return (
    <div className={moduleStyles.facade}>
      <FacadeBackground
        posterThumbnail={posterThumbnail}
        alt={label}
        onClick={onClick}
        onLoad={onPosterLoad}
      />
      <PlayButton label={label} onClick={onClick} />
    </div>
  );
};

export default Facade;
