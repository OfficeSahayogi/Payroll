import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const initialState = {
  role: null,
  organizations: [],
  selectedOrg: null,
  name:null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      
      state.name=action.payload.name
      state.role = action.payload.role;
      state.organizations = action.payload.organizations;
    },
    selectOrganization: (state, action) => {
     
      state.selectedOrg = action.payload;
    },
    logout: (state) => {
      state.role = null;
      state.organizations = [];
      state.selectedOrg = null;
    },
  },
});

export const { login, selectOrganization, logout } = userSlice.actions;
export default userSlice.reducer;
