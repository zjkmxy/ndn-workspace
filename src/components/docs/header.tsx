import styles from "./header.module.css";

export default function Header ({ onClick }: {
  onClick: React.MouseEventHandler<HTMLParagraphElement>
}) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title} onClick={onClick}>
        Docs
      </p>
    </div>
  );
}