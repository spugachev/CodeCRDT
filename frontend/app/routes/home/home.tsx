import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CodeCRDT" },
    { name: "description", content: "A platform for collaborative agents." },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const uuid = crypto.randomUUID();
    navigate(`/code/${uuid}`, { replace: true });
  }, [navigate]);

  return null;
}
