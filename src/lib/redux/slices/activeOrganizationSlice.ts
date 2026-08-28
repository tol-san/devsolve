import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "devsolve.activeOrganization";

/**
 * Which organization the workspace is currently showing.
 *
 * An account can be on several — owning one and invited into another, or
 * invited into two — and the company screens can only show one at a time. This
 * is that choice, kept out of the URL deliberately: it belongs to the person,
 * not to the page they happen to be on, so it survives navigation and reloads
 * rather than having to be re-made on every screen.
 *
 * `null` means "no choice made", which resolves to the first membership — the
 * API returns owned entries first, so that is the sensible default.
 */
type ActiveOrganizationState = {
  organizationId: string | null;
};

/* Read at store construction rather than during a render: reading storage while
   rendering is neither pure nor available on the server. */
function storedOrganizationId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    /* Private windows and blocked site data both throw; a forgotten choice is
       not worth breaking the store over. */
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

/** Persists the choice. Called from the switcher, not from the reducer. */
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
