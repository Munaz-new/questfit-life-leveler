import { useEffect, useState } from "react";
import { signedUrl } from "@/lib/leveluplife/progressMirror";
import { ImageOff } from "lucide-react";

/** Loads a private image via short-lived signed URL. */
export function PrivateImage({
  path,
  className = "",
  alt = "Progress photo",
}: {
  path: string;
  className?: string;
  alt?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setUrl(null);
    setFailed(false);
    signedUrl(path)
      .then((u) => {
        if (!active) return;
        if (u) setUrl(u);
        else setFailed(true);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [path]);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-white/5 ${className}`}>
        <ImageOff className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }
  if (!url) {
    return <div className={`animate-pulse bg-white/5 ${className}`} />;
  }
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
