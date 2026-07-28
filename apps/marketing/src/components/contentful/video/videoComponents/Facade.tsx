import FacadeBackground from './FacadeBackground';
import PlayButton from './PlayButton';
import {MuiVideoFacade} from './styledMuiComponents';

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
    <MuiVideoFacade>
      <FacadeBackground
        posterThumbnail={posterThumbnail}
        alt={label}
        onClick={onClick}
        onLoad={onPosterLoad}
      />
      <PlayButton label={label} onClick={onClick} />
    </MuiVideoFacade>
  );
};

export default Facade;
