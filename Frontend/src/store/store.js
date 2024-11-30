import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("reduxState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (error) {
    console.error("Failed to load state from localStorage", error);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("reduxState", serializedState);
  } catch (error) {
    console.error("Failed to save state to localStorage", error);
  }
};

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState, // Use preloaded state
});

// Save state on every Redux state change
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
