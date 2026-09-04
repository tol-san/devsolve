import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "devsolve.activeOrganization";

type ActiveOrganizationState = {
  organizationId: string | null;
};

function storedOrganizationId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

const initialState: ActiveOrganizationState = {
  organizationId: storedOrganizationId(),
};

export const activeOrganizationSlice = createSlice({
  name: "activeOrganization",
  initialState,
  reducers: {
    setActiveOrganization(state, action: PayloadAction<string | null>) {
      state.organizationId = action.payload;
    },
  },
});

export const { setActiveOrganization } = activeOrganizationSlice.actions;

export function rememberActiveOrganization(organizationId: string | null) {
  if (typeof window === "undefined") return;

  try {
    if (organizationId) {
      window.localStorage.setItem(STORAGE_KEY, organizationId);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* The choice still holds for this session; it just will not outlive it. */
  }
}

export default activeOrganizationSlice.reducer;
