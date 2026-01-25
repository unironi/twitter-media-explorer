import { useEffect } from "react";

// pause video when off screen
export function useAutoPauseVideo(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  threshold = 0.6 // % of video visible before playing
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // autoplay may fail, ignore
          });
        } else {
          video.pause();
        }
      },
      { threshold }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [videoRef, threshold]);
}
