import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import {useAuthState} from '../context/auth'


export default function Home() {
//Local State
//Global State
const {authenticated} = useAuthState()
//Utils
const router = useRouter();
  const enterRoom =(e: FormEvent) =>{
  
    e.preventDefault();
    if(!authenticated) router.push('/login')
    else router.push('/room')
    // Send request to server to start websocket
    console.log("working");
  }

  return (
    <div className="flex justify-center">
      <Head>
        <title>Sonder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="pt-14 flex flex-col justify-center content-start align-center  w-60 ">
        <h1 className="text-3xl">Welcome to Sonder</h1>
        <h1>Online <span className="text-green-500">22</span> 🤖</h1>
        <button onClick={enterRoom} className="mt-2 w-full py-2 mb-4 text-m font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
            Enter Room
          </button>
      </div>
    </div>
  )
}

