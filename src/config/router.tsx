// import { defer, RouteObject } from 'react-router-dom';
import RouteErrorBoundary from '@/components/ErrorBoundary/RouteError';
import Exception404 from '@/components/Exception/Exception404';
import Layout from '@/Layout';

// import { getUserInfo } from '@/services/demo';

// async function getUserData() {
//   try {
//     const res = await getUserInfo();
//     return res;
//     // return data
//   } catch (err) {
//     return { error: 'error' };
//   }
// }

// const rootLoader = async () => {
//   return defer({
//     user: getUserData(),
//   });
// };

export default [
  {
    path: '/',
    id: 'root',
    errorElement: <RouteErrorBoundary />,
    element: <Layout />,
    // loader: rootLoader,
    children: [
      {
        index: true,
        component: './Home',
      },
      {
        title: '全景图片展示 (单图)',
        path: '/panoImage',
        component: './PanoImage',
      },
      {
        title: '车内全景图片展示 (单图)',
        path: '/panoImage/carInner',
        component: './PanoImage/CarInner',
      },
      {
        title: '全景图片展示 (6图)',
        path: '/panoImage/cube',
        component: './PanoImage/Cube',
      },
      {
        title: '多图模拟3D (36图)',
        path: '/panoImage/multiple-img',
        component: './PanoImage/MultipleImgs',
      },
      {
        title: '车模型3D - 换色',
        path: '/carView',
        component: './carView',
      },
      {
        title: '车模型3D - 开门',
        path: '/carView-door',
        component: './carViewDoor',
      },
    ],
  },
  {
    path: '*',
    element: <Exception404 />,
  },
];
