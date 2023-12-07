import type { LambdaHandlerEventSource } from '@phasma/handler-aws/component/event';
import type { HandlerResponsePresetNothing } from '@phasma/handler/component/response';

/**
 * Declare custom events here.
 */
declare module '@phasma/handler-aws/definition/events' {
  interface LambdaHandlerEventSources {
    /**
     * A custom service event for the synchronise cron-worker handler.
     */
    readonly 'service:synchronise-land-registry-data': (
      /* eslint-disable @typescript-eslint/indent */
        LambdaHandlerEventSource<
          'service:synchronise-land-registry-data',
          never,
          HandlerResponsePresetNothing
        >
      /* eslint-enable @typescript-eslint/indent */
    );
  }
}
