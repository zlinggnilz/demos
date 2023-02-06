import { Link, Outlet, useLocation } from 'umi';
import styles from './index.less';

export default function Layout() {
  const {pathname} = useLocation()
  return (
    <>
      { pathname!=='/' && <div className={styles.menu}><Link to="/">返回</Link></div>}
      <Outlet />
    </>
  );
}
