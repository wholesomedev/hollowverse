import {
  RouterState,
  LocationChangeAction,
  RouterAction,
} from 'react-router-redux';
import { AsyncResult } from 'helpers/asyncResults';
import { AlgoliaResponse } from 'algoliasearch';

/** A map of all app actions to their corresponding payloads */
export type TypeToPayload = {
  REQUEST_SEARCH_RESULTS: {
    query: string;
  };
  SET_SEARCH_RESULTS: AsyncResult<AlgoliaResponse | null>;
  SET_LAST_SEARCH_MATCH: string;
  SET_STATUS_CODE: number;
  '@@router/LOCATION_CHANGE': LocationChangeAction['payload'];
  '@@router/CALL_HISTORY_METHOD': RouterAction['payload'];
};

export type AppState = {
  statusCode: number;
  searchResults: AsyncResult<AlgoliaResponse | null>;
  lastSearchMatch: string | null;
};

/**
 * Contains AppState as well as other state keys that are
 * required by external modules
 */
export type StoreState = Readonly<AppState & { routing: RouterState }>;

export type StoreKey = keyof AppState;

/**
 * This type covers all possible action types that may be dispatched
 * throughout the app.
 */
export type ActionType = keyof TypeToPayload;

/**
 * A typed payload.
 * It must one of the payloads defined above,
 * and must correspond to the action type `T`.
 */
export type Payload<T extends ActionType> = TypeToPayload[T];

export type GenericPayload = Payload<ActionType>;

/** Generic action, used when we do not care about what the type */
export type GenericAction = {
  type: ActionType;
  payload?: GenericPayload;
};

/**
 * Typed app-specific action
 * The `payload` must correspond to the `type`.
 * This provides improved type checking and prevents dispatching an action
 * with the wrong payload type.
 */
export type Action<T extends ActionType = ActionType> = {
  type: T;
  payload: Payload<T>;
};

export type ActionCreator<T extends ActionType> = (
  payload: Payload<T>,
) => Action<T>;

export type Reducer<S> = (state: S, action: GenericAction) => S;

export type ReducerMap<State extends object = AppState> = {
  [Key in keyof State]: Reducer<State[Key]> | any
};

export type ActionToReducerMap<Key extends StoreKey> = {
  [A in ActionType]: Reducer<AppState[Key]>
};
