import Image from "next/image";
import solarIcon from "./solar.png";
import styles from "./kaizen-logo.module.css";

export function KaizenLogo() {
  return (
    <span aria-hidden="true" className="relative block size-14 shrink-0 md:size-16">
      <Image
        src={solarIcon}
        fill
        sizes="(min-width: 48rem) 64px, 56px"
        alt=""
        className="size-full"
      />
      <span data-kaizen-solar-layer="" className={styles.glow}>
        <span data-kaizen-solar-layer="" className={styles.halo} />
        <span data-kaizen-solar-layer="" className={styles.disc}>
          <span data-kaizen-solar-layer="" className={styles.light} />
        </span>
      </span>
    </span>
  );
}
