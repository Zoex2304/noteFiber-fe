import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook untuk animasi counter (dependency-free).
 * @param end Nilai akhir yang dituju.
 * @param duration Durasi animasi dalam milidetik.
 * @param startDelay Penundaan sebelum animasi dimulai.
 */
export function useCountUp(
  end: number,
  duration: number = 2000,
  startDelay: number = 300
) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | null = null;
    let observer: IntersectionObserver;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOutValue = 1 - Math.pow(1 - progressRatio, 3);
      
      setCount(Math.floor(easeOutValue * end));

      if (progress < duration) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end); // Pastikan nilai akhir tepat
      }
    };

    const startAnimation = () => {
      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(animate);
      }, startDelay);
    };

    // Gunakan Intersection Observer untuk memulai animasi saat terlihat
    const currentRef = ref.current;
    if (currentRef) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            startAnimation();
            observer.unobserve(currentRef); // Hanya jalankan sekali
          }
        },
        { threshold: 0.5 } // Mulai saat 50% terlihat
      );
      observer.observe(currentRef);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (observer && currentRef) {
        observer.unobserve(currentRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration, startDelay]);

  return { count, ref };
}

