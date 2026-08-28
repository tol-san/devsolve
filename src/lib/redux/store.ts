import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import activeOrganizationReducer from "./slices/activeOrganizationSlice";
import { baseApi } from "./services/baseApi";
import { proxyApi } from "./services/proxyApi";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      // Endpoints that route through the Next handlers in `src/app/api/*`.
      [proxyApi.reducerPath]: proxyApi.reducer,
      // Which organization the company screens are showing, for accounts on
      // more than one.
      activeOrganization: activeOrganizationReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware, proxyApi.middleware),
  });

  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
