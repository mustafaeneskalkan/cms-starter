"use client";

import React from "react";
import { SessionProvider } from "./session/SessionContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
