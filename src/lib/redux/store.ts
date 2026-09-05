import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import activeOrganizationReducer from "./slices/activeOrganizationSlice";
import { baseApi } from "./services/baseApi";
import { proxyApi } from "./services/proxyApi";
import { publicApi } from "./services/publicApi";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [proxyApi.reducerPath]: proxyApi.reducer,
      [publicApi.reducerPath]: publicApi.reducer,
      activeOrganization: activeOrganizationReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        baseApi.middleware,
        proxyApi.middleware,
        publicApi.middleware,
      ),
  });

  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
