"use client";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { usePathname, useRouter } from "next/navigation";
import Tpos from "./tpos/page";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  }, []);
  const [presale, setPresale] = useState(true);
  // console.log(pathname, "asdfasd");

  return (
    <>
      <Tpos />
    </>
  );
}
