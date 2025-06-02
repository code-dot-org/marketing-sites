import NewRelicAgent from '@/providers/newrelic/agent';
export function handleError(error: Error, errorTraceId: string) {
  console.error(error, errorTraceId);
  console.log(`Error ${errorTraceId} received ${error.message}`);
  console.log(`Error ${errorTraceId} stack ${error.stack}`);

  NewRelicAgent.then(agent => {
    if (agent) {
      agent.noticeError(error, {errorTraceId});
    }
  });
}
