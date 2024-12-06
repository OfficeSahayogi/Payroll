import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  role: null,
  organizations: [],
  selectedOrg: null,
  name: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      const { role, organizations, name } = action.payload;
      state.isAuthenticated = true;
      state.role = role;
      state.organizations = organizations;
      state.name = name;
    },
    selectOrganization: (state, action) => {
      state.selectedOrg = action.payload;
    },
    logout: (state) => {
      return initialState;
    },
  },
});

export const { login, selectOrganization, logout } = userSlice.actions;
export default userSlice.reducer;
