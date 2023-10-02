import styles from "./document-card.module.css";

export default function DocumentCard ({ text, onClick, deleteHandler }: {
  text: string,
  onClick: React.MouseEventHandler<HTMLDivElement>,
  deleteHandler: React.MouseEventHandler<HTMLDivElement>
}) {
  const createTitle = (text: string) => {
    if (text.replace(/<\/?[^>]+(>|$)/g, "")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const title =
        (doc.body.childNodes[0].lastChild as Element)?.innerHTML ||
        (doc.body.childNodes[0] as Element)?.innerHTML;
      return title.length > 10 ? `${title.slice(0, 10)}...` : title;
    }
    return "Untitled doc";
  };
  return (
    <div className={styles.wrapper} onClick={onClick}>
      <div
        className={styles.preview}
        dangerouslySetInnerHTML={{ __html: text }}
      ></div>
      <div className={styles.footer}>
        <div className={styles.title}>{createTitle(text)}</div>
        <div className={styles.delete} onClick={deleteHandler}>
          <span role="img" aria-label="bin">
            ❌
          </span>
        </div>
      </div>
    </div>
  );
}