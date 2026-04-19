import UserShipmentsClient from "@/components/tracking/UserShipmentsClient";
import { use } from "react";


export default function Page({
  params,
}: {
  params: Promise<{ user: string; ship: string }>;
}) {
  const { user, ship } = use(params); // `user` is $id, `ship` is profileId

  return <UserShipmentsClient userId={user} profileId={ship} />;
}
