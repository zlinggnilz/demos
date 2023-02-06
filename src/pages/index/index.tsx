import { memo } from "react";
import { Link } from "umi";
import styles from './style.less';

const index = () => {
  return (
    <>
      <ul className={styles.menu}>
        <li>
          <Link to="/panoImage">全景图片展示</Link>
        </li>
      </ul>
    </>
  );
};

export default memo(index);
