import styles from "./add-button.module.css";

export default function AddButton({ onClick }: {
  onClick: React.MouseEventHandler<HTMLDivElement>,
}) {
  return (
    <div className={styles.wrapper} onClick={onClick}>
      <p className={styles.sign}>+</p>
    </div>
  );
}
