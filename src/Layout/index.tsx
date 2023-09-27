import { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import PageLoading from '@/components/PageLoading';

import styles from './index.module.less';

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <>
      {pathname !== '/' && (
        <div className={styles.menu}>
          <Link to="/">返回</Link>
        </div>
      )}
      <Suspense fallback={<PageLoading />}>
        <Outlet />
      </Suspense>
    </>
  );
};

export default Layout;
