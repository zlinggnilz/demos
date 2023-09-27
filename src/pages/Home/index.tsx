import { memo } from 'react';
import { Link } from 'react-router-dom';

import routes from '@/config/router';

import styles from './style.module.less';

const index = () => {
  return (
    <>
      <ul className={styles.menu}>
        {routes[0].children?.map(
          (item) =>
            item.path && (
              <li key={item.path}>
                <Link to={item.path}>{item.title}</Link>
              </li>
            ),
        )}
      </ul>
    </>
  );
};

export default memo(index);
