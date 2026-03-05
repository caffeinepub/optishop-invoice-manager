import { useEffect, useRef, useState } from "react";
import { useActor } from "./useActor";

/**
 * Returns `isReady: true` only after the actor is available AND a brief
 * initialization window has passed (500ms after actor becomes available).
 *
 * This prevents ICP query calls from firing before the ICP update call
 * `_initializeAccessControlWithSecret` has propagated to all replicas.
 */
export function useIsActorReady(): { isReady: boolean } {
  const { actor, isFetching } = useActor();
  const [isReady, setIsReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevActorRef = useRef<typeof actor>(null);

  useEffect(() => {
    // Clear any pending timer when actor/fetching state changes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (actor && !isFetching) {
      // Actor just became available (or changed) — wait 500ms before enabling queries
      if (actor !== prevActorRef.current) {
        setIsReady(false);
        prevActorRef.current = actor;
        timerRef.current = setTimeout(() => {
          setIsReady(true);
        }, 500);
      }
    } else {
      // Actor not yet available
      setIsReady(false);
      prevActorRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [actor, isFetching]);

  return { isReady };
}
