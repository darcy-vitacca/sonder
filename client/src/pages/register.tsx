import { FormEvent, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import InputGroup from "../components/InputGroup";
import {useAuthState} from '../context/auth'
import Axios from "axios";

export default function Register() {
  //Local State
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("0");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<any>({});
  // const [phoneNumber, setphoneNumber] = useState("")

  //Global State
  const {authenticated} = useAuthState() 

  //Util
  const router = useRouter();
  if(authenticated) router.push('/')
  

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    console.log(parseInt(age));
    if (parseInt(age) < 18) {
      setErrors({ age: "Must be older than 18 to register" });
      return;
    } else if (confirmPassword !== password) {
      setErrors({ password: "Passwords do not match" });
      return;
    }
    try {
      await Axios.post("auth/register", {
        email,
        username,
        password,
        age: parseInt(age),
        name,
      });
      router.push("/login");
    } catch (err) {
      setErrors(err.response.data);
    }
  };
  return (
    <div className="flex justify-center ">
      <Head>
        <title>Signup</title>
      </Head>
      <div className="pt-14 flex flex-col justify-center content-start align-center  w-60 ">
        <h1 className="text-xl ">Register</h1>
        <form className="content-center" onSubmit={submitForm}>
          <p className="my-2 text-xs">
            By continuing, you agree to our User Agreement and Privacy Policy
          </p>
          <InputGroup
            type="email"
            setValue={setEmail}
            placeholder="EMAIL"
            value={email}
            helperText={"Email"}
            error={errors.email}
          />
          <InputGroup
            type="text"
            setValue={setUsername}
            placeholder="USERNAME"
            value={username}
            helperText={"Username (6 characters or more without spaces)"}
            error={errors.username}
          />
          <InputGroup
            type="password"
            setValue={setPassword}
            placeholder="PASSWORD"
            value={password}
            helperText={
              "Password (A combination of 8 letters and numbers, including uppecase and lower case, without spaces)"
            }
            error={errors.password}
          />
          <InputGroup
            type="password"
            setValue={setConfirmPassword}
            placeholder="CONFIRM PASSWORD"
            value={confirmPassword}
            error={errors.confirmPassword}
          />
          <InputGroup
            type="name"
            setValue={setName}
            placeholder="NAME"
            value={name}
            helperText={"Name"}
            error={errors.name}
          />

          <InputGroup
            type="number"
            setValue={setAge}
            placeholder="SELECT AGE"
            value={age}
            error={errors.age}
            helperText={"You must be 18+"}
          />

          {/* <small className="block font-medium text-red-600">
            {errors.agreement}
          </small> */}
          <button className="mt-2 w-full py-2 mb-4 text-m font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
            Signup
          </button>
        </form>
        <small>
            Already a sonder member?
            <Link href="/login">
              <a className="ml-1 text-green-500 uppercase">Login</a>
            </Link>
          </small>
      </div>
    </div>
  );
}
