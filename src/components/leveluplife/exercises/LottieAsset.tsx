import { useEffect, useState } from "react";
import Lottie from "lottie-react";

/**
 * Lazily-loaded Lottie renderer. Only imported (and only fetches the
 * animation JSON) when an exercise actually has a Lottie asset, so the
 * player stays lightweight for the common SVG path.
 */
export default function LottieAsset({ url }: { url: string }) {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (alive) setData(json);
      })
      .catch(() => {
        if (alive) setData(null);
      });
    return () => {
      alive = false;
    };
  }, [url]);

  if (!data) return null;
  return <Lottie animationData={data} loop className="h-full w-full" />;
}
