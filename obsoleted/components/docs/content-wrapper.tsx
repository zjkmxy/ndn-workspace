import styles from "./content-wrapper.module.css";
import { PropsWithChildren } from "react";

export default function ContentWrapper(props: PropsWithChildren<object>) {
  return (<div className={styles.wrapper}>{props.children}</div>);
}
