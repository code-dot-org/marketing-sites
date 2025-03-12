import {Statsig} from '@statsig/statsig-node-core';

export default process.env.STATSIG_SERVER_KEY
  ? new Statsig(process.env.STATSIG_SERVER_KEY)
  : undefined;
