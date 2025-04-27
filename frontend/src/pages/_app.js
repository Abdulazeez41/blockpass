import { useEffect, useState } from "react";

import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
      <Component {...pageProps} />
  );
}
