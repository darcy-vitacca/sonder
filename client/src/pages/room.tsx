import axios from "axios";
import { GetServerSideProps } from "next";

export default function Room(){
    return (
        <div>
            <h1>Room</h1>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
      const cookie = req.headers.cookie;
      if (!cookie) throw new Error("Missing auth token cookie");
  
      await axios.get("/auth/me", { headers: { cookie } });
      return { props: {} };
    } catch (err) {
      res.writeHead(307, { Location: "/login" }).end();
    }
  };