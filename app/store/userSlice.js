import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as SecureStore from "expo-secure-store";  // ✅ import added
import { baseurl } from "../Components/allapi";

// Async thunk
export const getUser = createAsyncThunk("/user", async (_, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");

    if (!token) {
      return rejectWithValue("No token found");
    }

    const res = await axios.get(`${baseurl}/getuser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    info: null,
    isLoading: false,
    isError: false,
    isUser: false,
    errorMessage: "",
  },
  reducers: {
    clearUser: (state) => {
      state.info = null;
      state.isUser = false;
      state.isError = false;
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.info = action.payload;
        state.isUser = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "Something went wrong";
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
