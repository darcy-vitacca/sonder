import Axios from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";
import { User } from "../types";

interface State {
  authenticated: boolean;
  user: User | undefined;
  loading: boolean;
}

interface Action {
  type: String;
  payload: any;
}

//State
const StateContext = createContext<State>({
  authenticated: false,
  user: null,
  loading: true,
});
//DispatchState
const DispatchContext = createContext(null);

//Where out dispatch gets passed through
const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case "LOGIN":
      return { ...state, authenticated: true, user: payload };
    case "LOGOUT":
      return { ...state, authenticated: false, user: null };
    case "STOP_LOADING":
      return { ...state, loading: false };
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
};
//Dispatch
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, defaultDispatch] = useReducer(reducer, {
    user: null,
    authenticated: false,
    loading: true,
  });
  //This one liner is so we don't have to specify type and payload everytime.
  const dispatch = (type: string, payload?: any) =>
    defaultDispatch({ type, payload });

  //On first load we load the user using the cookie
  useEffect(() => {
    const loadUser = (async () => {
      try {
        const res = await Axios.get("/auth/me");
        dispatch("LOGIN", res.data);
      } catch (err) {
        console.log(err);
        //excecutes after try or catch
      } finally {
        dispatch("STOP_LOADING");
      }
    })();
  }, []);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};
export const useAuthState = () => useContext(StateContext);
export const useAuthDispatch = () => useContext(DispatchContext);