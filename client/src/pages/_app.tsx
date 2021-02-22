import Axios from "axios";
import { AppProps } from "next/app";
import "../styles/tailwind.css";
// import "../styles/icons.css";
// import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { AuthProvider } from "../context/auth";
// import { AuthProvider } from "../context/auth";
// import useSWR, { SWRConfig } from "swr";

Axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api`;
Axios.defaults.withCredentials = true; // this always sends cookie on client side

// const fetcher = async (url: string) => {
//   try {
//     const res = await Axios.get(url);
//     return res.data;
//   } catch (err) {
//     throw err.response.data;
//   }
// };

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRouter = authRoutes.includes(pathname);
  return (
    // <SWRConfig
    //   value={{
    //     fetcher,
    //     //this allows fetches to not be made within 10 seconds
    //     dedupingInterval: 10000,
    //   }}
    // >
    <AuthProvider>
      {/* //     {!authRouter && <Navbar />} */}
      <div className={authRouter ? "" : "pt-12"}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
    // </SWRConfig>
  );
}

export default App;
