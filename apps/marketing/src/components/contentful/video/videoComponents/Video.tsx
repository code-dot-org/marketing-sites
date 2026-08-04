import ErrorIcon from '@mui/icons-material/Error';
import MuiButton from '@mui/material/Button';
import MuiTypography from '@mui/material/Typography';
import classNames from 'classnames';
import {useState} from 'react';
import ReactPlayer from 'react-player/file';
import {JsonLd} from 'react-schemaorg';
import type {VideoObject} from 'schema-dts';

import {resolvedCssVarForBrandColor} from '@/components/common/colors';
import TextLink from '@/components/contentful/link/Link';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';

import Facade from './Facade';
import NativeVideo from './NativeVideo';
import {
  MuiVideoRoot,
  MuiVideoWrapper,
  MuiVideoErrorPlaceholder,
  MuiVideoFooter,
} from './styledMuiComponents';
import {RenderState, VideoProps} from './types';
import YouTubeVideo from './YoutubeVideo';

const Video: React.FC<VideoProps> = ({
  youTubeId,
  videoTitle,
  videoDesc,
  videoFallback,
  posterImage,
  showCaption,
  downloadLabel,
  uploadDate,
  errorHeading,
  errorBody,
  className,
  isYouTubeCookieAllowed,
}: VideoProps) => {
  const youtubeVideoUrl = `https://www.youtube-nocookie.com/watch?v=${youTubeId}`;

  const enclosingBackground = useSectionBackground();
  const [renderState, setRenderState] = useState<RenderState>('facade');

  // An authored poster bypasses the YouTube thumbnail (and its placeholder
  // detection below) entirely.
  const authoredPoster = getAbsoluteImageUrl(posterImage);

  // Prefer the 1280x720 thumbnail; videos uploaded in SD don't have one, and
  // YouTube then serves a 120x90 placeholder (rendered despite the 404), so
  // detect it by size and fall back to the always-available 480x360.
  const [useFallbackThumbnail, setUseFallbackThumbnail] = useState(false);
  const posterThumbnail =
    authoredPoster ??
    `//i.ytimg.com/vi/${youTubeId}/${
      useFallbackThumbnail ? 'hqdefault' : 'maxresdefault'
    }.jpg`;

  const handlePosterLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (!authoredPoster && event.currentTarget.naturalWidth <= 120) {
      setUseFallbackThumbnail(true);
    }
  };

  const handleError = (
    error: Error | undefined,
    nextRenderState: RenderState,
  ) => {
    // If blocked due to an interaction autoplay issue, don't move to the next render state but allow the user to
    // manually click the play button
    if (error?.name === 'NotAllowedError') {
      console.warn(error);
    } else {
      setRenderState(nextRenderState);
    }
  };

  const handleFacadeClick = () => {
    if (isYouTubeCookieAllowed && !window.CDOVideoPlayer?.isYouTubeBlocked) {
      setRenderState('youtube');
    } else {
      if (videoFallback && ReactPlayer.canPlay(videoFallback)) {
        setRenderState('native');
      } else {
        if (window.CDOVideoPlayer?.isYouTubeBlocked) {
          setRenderState('error');
        } else {
          setRenderState('cookie-blocked');
        }
      }
    }
  };

  const getVideoPlayer = () => {
    switch (renderState) {
      case 'facade':
        return (
          <Facade
            label={`Play video ${videoTitle}`}
            posterThumbnail={posterThumbnail}
            onClick={handleFacadeClick}
            onPosterLoad={handlePosterLoad}
          />
        );
      case 'youtube':
        return (
          <YouTubeVideo
            posterThumbnail={posterThumbnail}
            videoTitle={videoTitle}
            src={youtubeVideoUrl}
            onError={error => {
              const nextRenderState =
                videoFallback && ReactPlayer.canPlay(videoFallback)
                  ? 'native'
                  : 'error';

              handleError(error, nextRenderState);
            }}
          />
        );
      case 'native':
        return (
          <NativeVideo
            posterThumbnail={posterThumbnail}
            videoTitle={videoTitle}
            src={videoFallback}
            onError={error => handleError(error, 'error')}
          />
        );
      case 'error':
        return (
          <MuiVideoErrorPlaceholder
            className={classNames('video-error-container')}
          >
            <ErrorIcon />
            <MuiTypography variant="body2">
              <strong>{errorHeading || 'Video unavailable'}</strong>
            </MuiTypography>
            <MuiTypography variant="body3">
              {errorBody || 'This video is blocked on your network.'}
            </MuiTypography>
          </MuiVideoErrorPlaceholder>
        );
      case 'cookie-blocked':
        return (
          <MuiVideoErrorPlaceholder
            className={classNames('video-error-container')}
          >
            <ErrorIcon />
            <MuiTypography variant="body2">
              <strong>{errorHeading || 'Cookie consent required'}</strong>
            </MuiTypography>
            <MuiTypography variant="body2">
              {errorBody ||
                'Please enable "Functional Cookies" and refresh the page to play this video.'}
            </MuiTypography>
            <MuiButton
              className="button--color-emphasized"
              variant="contained"
              size="small"
              sx={{marginTop: '1rem'}}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).OneTrust.ToggleInfoDisplay();
              }}
              disableElevation
              disableRipple
            >
              Cookie Settings
            </MuiButton>
          </MuiVideoErrorPlaceholder>
        );
    }
  };
  return (
    <MuiVideoRoot className={classNames(className)}>
      <MuiVideoWrapper>{getVideoPlayer()}</MuiVideoWrapper>
      <MuiVideoFooter>
        {showCaption && (
          <MuiTypography
            variant="caption"
            component="figcaption"
            // Contrast-aware default black: flips to white on dark sections.
            // Scoped to out-specify the theme's caption color rule.
            sx={{
              '&.MuiTypography-caption': {
                color: resolvedCssVarForBrandColor(
                  'black',
                  enclosingBackground,
                ),
              },
            }}
          >
            {videoTitle}
          </MuiTypography>
        )}
        {videoFallback && (
          <TextLink
            className="video-download-button"
            href={videoFallback}
            isLinkExternal={false}
            openInNewTab
            color="black"
            size="s"
            icon="download"
            iconPosition="right"
            removeMarginBottom
          >
            {downloadLabel || 'Download'}
          </TextLink>
        )}
      </MuiVideoFooter>

      {/* JSON-LD for structured data. Needed for Google SEO.
      (see https://developers.google.com/search/docs/appearance/structured-data/video#json-ld) */}
      {videoTitle && posterThumbnail && uploadDate && (
        <JsonLd<VideoObject>
          item={{
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: videoTitle,
            description: videoDesc,
            thumbnailUrl: posterThumbnail,
            uploadDate: uploadDate,
            embedUrl: youtubeVideoUrl,
            contentUrl: videoFallback,
          }}
        />
      )}
    </MuiVideoRoot>
  );
};

export default Video;
