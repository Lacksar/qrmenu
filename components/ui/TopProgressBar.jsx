// "use client";
// import { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import { Progress } from "./progress";

// export default function TopProgressBar() {
//   const pathname = usePathname();
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     setProgress(20);
//     const interval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev < 90) return prev + Math.random() * 10;
//         clearInterval(interval);
//         return prev;
//       });
//     }, 200);

//     const timeout = setTimeout(() => setProgress(100), 800);
//     const reset = setTimeout(() => setProgress(0), 1000);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(timeout);
//       clearTimeout(reset);
//     };
//   }, [pathname]);

//   return <Progress value={progress} />;
// }
