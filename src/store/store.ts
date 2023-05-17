import { configureStore } from "@reduxjs/toolkit"
import appStore from "./reducer"

// https://redux-toolkit.js.org/tutorials/quick-start
export const store = configureStore({
  reducer: {
    appStore: appStore
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
