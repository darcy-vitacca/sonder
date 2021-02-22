import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {useAuthState, useAuthDispatch} from '../context/auth'
import InputGroup from "../components/InputGroup";
import Axios from "axios";
import { GetServerSideProps } from "next";

export default function Login() {
  //Local State

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});

  //Global State
  const {authenticated } = useAuthState() 
  const dispatch = useAuthDispatch()
  

  //Util
  const router = useRouter();
  if(authenticated) router.push('/')

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const res = await Axios.post("auth/login", {
        username,
        password,
      });
      dispatch("LOGIN", res.data );
      router.push("/");
    } catch (err) {
      console.log(err);
      setErrors(err.response.data);
    }
  };
  return (
    <div className="flex justify-center ">
      <Head>
        <title>Login</title>
      </Head>
      <div className="pt-40 flex flex-col justify-center content-start align-center  w-60 ">
        <h1 className="text-xl ">Login</h1>
        <form className="content-center" onSubmit={submitForm}>
          <p className="my-2 text-xs">
            By continuing, you agree to our User Agreement and Privacy Policy
          </p>
  
          <InputGroup
            type="text"
            setValue={setUsername}
            placeholder="USERNAME"
            value={username}
            error={errors.username}
          />
          <InputGroup
            type="password"
            setValue={setPassword}
            placeholder="PASSWORD"
            value={password}
            error={errors.password}
          />

          <button className="mt-2 w-full py-2 mb-4 text-m font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
            Login
          </button>
        </form>
        <small>
            New to Sonder?
            <Link href="/register">
              <a className="ml-1 text-green-500 uppercase">Sign up</a>
            </Link>
          </small>
      </div>
    </div>
  );
}

