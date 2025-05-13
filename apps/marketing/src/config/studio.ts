import {getStage} from './stage';

export function getStudioUrl(path = '') {
  let hostname;

  switch (getStage()) {
    case 'development':
    case 'pr':
      hostname = 'http://localhost-studio.code.org:3000';
      break;
    case 'test':
      hostname = 'https://test-studio.code.org';
      break;
    case 'production':
    default:
      hostname = 'https://studio.code.org';
      break;
  }

  return path ? new URL(path, hostname).toString() : hostname;
}
