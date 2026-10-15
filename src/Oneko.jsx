import { useEffect, useRef } from "react";

/**
 * <Oneko /> — a cat that chases your cursor.
 * Based on oneko.js by adryd.
 *
 * Props:
 *   src      URL of the sprite sheet (default "/oneko.gif" -> put it in /public)
 *   speed    pixels moved per tick (default 10)
 *   zIndex   CSS z-index of the cat (default 2147483647)
 */

const SPRITES = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratch: [[-5, 0], [-6, 0], [-7, 0]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]],
};

export default function Oneko({
  src = "/oneko.gif",
  speed = 10,
  zIndex = 2147483647,
}) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.style.display = "none";
      return;
    }

    let nekoX = 500;
    let nekoY = 500;
    let mouseX = 0;
    let mouseY = 0;
    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation = null;
    let idleAnimationFrame = 0;

    const setSprite = (name, frame) => {
      const set = SPRITES[name];
      const [sx, sy] = set[frame % set.length];
      el.style.backgroundPosition = `${sx * 32}px ${sy * 32}px`;
    };

    const resetIdleAnimation = () => {
      idleAnimation = null;
      idleAnimationFrame = 0;
    };

    const idle = () => {
      idleTime += 1;

      if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation == null) {
        idleAnimation = ["sleeping", "scratch"][Math.floor(Math.random() * 2)];
      }

      switch (idleAnimation) {
        case "sleeping":
          if (idleAnimationFrame < 8) {
            setSprite("tired", 0);
            break;
          }
          setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) resetIdleAnimation();
          break;
        case "scratch":
          setSprite("scratch", idleAnimationFrame);
          if (idleAnimationFrame > 9) resetIdleAnimation();
          break;
        default:
          setSprite("idle", 0);
          return;
      }
      idleAnimationFrame += 1;
    };

    const tick = () => {
      frameCount += 1;
      const diffX = nekoX - mouseX;
      const diffY = nekoY - mouseY;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

      if (distance < speed || distance < 48) {
        idle();
        return;
      }

      resetIdleAnimation();

      if (idleTime > 1) {
        setSprite("alert", 0);
        idleTime = Math.min(idleTime, 7) - 1;
        return;
      }

      let direction = diffY / distance > 0.5 ? "N" : "";
      direction += diffY / distance < -0.5 ? "S" : "";
      direction += diffX / distance > 0.5 ? "W" : "";
      direction += diffX / distance < -0.5 ? "E" : "";
      setSprite(direction, frameCount);

      nekoX -= (diffX / distance) * speed;
      nekoY -= (diffY / distance) * speed;

      el.style.left = `${nekoX - 16}px`;
      el.style.top = `${nekoY - 16}px`;
    };

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    setSprite("idle", 0);
    window.addEventListener("mousemove", onMouseMove);
    const interval = setInterval(tick, 100);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clearInterval(interval);
    };
  }, [speed]);

  return (
    <div
      ref={elRef}
      id="oneko"
      aria-hidden="true"
      style={{
        width: 32,
        height: 32,
        position: "fixed",
        left: 16,
        top: 16,
        backgroundImage: `url('${src}')`,
        imageRendering: "pixelated",
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
}
