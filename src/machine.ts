export type Listener<S> = (state: S) => void;

export type DispatchResult = { accepted: boolean };

export type TransitionResult<S, C> =
  | { accepted: true; state: S; command?: C }
  | { accepted: false };

export type TransitionFn<S, E, C> = (state: S, event: E) => TransitionResult<S, C>;

export type Machine<S, E> = {
  dispatch(event: E): DispatchResult;
  readonly state: S;
  subscribe(listener: Listener<S>): () => void;
};
