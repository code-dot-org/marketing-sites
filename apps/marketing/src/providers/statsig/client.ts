import {useClientBootstrapInit} from '@statsig/react-bindings';
import plugins from '@/providers/statsig/plugins';

export function getClient(clientKey: string, values: string) {
  return useClientBootstrapInit(clientKey, {userID: 'marketing-user'}, values, {
    plugins: plugins,
  });
}
