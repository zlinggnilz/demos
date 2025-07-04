/*
 * @Author: Ling
 * @Date: 2023-02-14 12:36:53
 * @LastEditors: Ling
 * @LastEditTime: 2023-05-25 21:11:43
 * @Description:
 */
import fs from 'fs';
import { debounce, startCase } from 'lodash-es';
import path from 'path';

const fileObj = {
  watcher: undefined as any,
  // fileList: [],
  watchFile: path.resolve('./src/config/router.tsx'),
  pagesPath: path.resolve('./src/pages'),
  srcPath: path.resolve('./src'),
  routerFolder: path.resolve('./src/router'),
  routerPath: path.resolve('./src/router/router.tsx'),
  routerIndex: path.resolve('./src/router/index.tsx'),
  routerComponent: path.resolve('./src/router/component.tsx'),
  pageLoadingPath: '@/components/PageLoading',
  stamp: 0,
};

interface pathItem {
  name: string;
  path: string;
  fp: string;
}

const re = /(\/\/ route-start)[\s\S]+(\/\/ route-end)/;

export default function routeScript() {
  return {
    name: 'routeScript',
    async buildStart() {
      await writeRoute();
      watchFiles();
    },
    buildEnd() {
      stopWatch();
    },
    closeBundle() {
      stopWatch();
    },
  };
}

function readFile() {
  const content = fs.readFileSync(fileObj.watchFile, 'utf-8');
  const routesContent = content.match(re)[0];
  // return
  const routes = eval(routesContent);
  const arr = [];
  function handle(list) {
    if (Array.isArray(list)) {
      list.forEach((item) => {
        if (item.component) {
          arr.push(item.component);
        }
        if (item.children && Array.isArray(item.children)) {
          handle(item.children);
        }
      });
    }
  }
  handle(routes);
  return { routeFlatList: arr, routeList: routes, routeContent: content };
}

async function writeRoute() {
  const { routeFlatList, routeList, routeContent } = readFile();

  if (!fs.existsSync(fileObj.routerFolder)) {
    // 文件夹不存在，创建新文件夹
    fs.mkdirSync(fileObj.routerFolder);
    console.log(`文件夹创建成功`);
  }

  const t = Date.now();
  fileObj.stamp = t;
  // const list = fileObj.fileList;
  const arr = (await fileDisplay(fileObj.pagesPath, t)) as pathItem[];
  arr.sort((a, b) => (a.name > b.name ? 1 : -1));
  // if (isEqual(list, arr)) {
  //   return;
  // }
  const arr_filter: pathItem[] = [];
  const arr_obj = {};
  arr.forEach((item) => {
    if (routeFlatList.includes(item.fp)) {
      arr_filter.push(item);
      arr_obj[item.fp] = item;
    }
  });

  function handleNewRoute(list) {
    if (Array.isArray(list)) {
      list.forEach((item) => {
        if (item.component && arr_obj[item.component]) {
          item.element = `**LazyLoad(routers.${arr_obj[item.component].name})**`;
        }
        if (item.children && Array.isArray(item.children)) {
          handleNewRoute(item.children);
        }
      });
    }
  }

  handleNewRoute(routeList);
  const routeString = JSON.stringify(routeList, null, 2).replace(/"\*\*|\*\*"/g,'');
  let newContent = routeContent.replace(re, `${routeString}`);

  newContent = `// @ts-nocheck
import * as routers from './component';
const LazyLoad = routers.LazyLoad

${newContent}
`;

  const pageLoadingContent = `
${fileObj.pageLoadingPath ? "import PageLoading from '@/components/PageLoading'" : ''};
export const LazyLoad = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => {
  return (
    <Suspense fallback={${fileObj.pageLoadingPath ? '<PageLoading />' : 'null'}}>
      <Component />
    </Suspense>
  );
};`;

  const fileList = arr_filter;
  let componentContent = `// @ts-nocheck
// This file is generated by Plugin automatically
// DO NOT CHANGE IT MANUALLY!

import { lazy, Suspense } from 'react';

${pageLoadingContent}

`;

  const routeIndexContent = `// @ts-nocheck
import { createBrowserRouter } from 'react-router-dom';
import routesConfig from './router'

export const routes = createBrowserRouter(routesConfig, {
  basename: import.meta.env.BASE_URL,
});

`;

  fileList.forEach((item) => {
    componentContent += `export const ${item.name} = lazy(() => import('${item.path}'));
`;
  });
  fs.writeFile(fileObj.routerFolder + '/component.tsx', componentContent, function (err) {
    if (err) {
      console.error('写入 routerComponent 文件失败');
    }
  });
  fs.writeFile(fileObj.routerFolder + '/router.tsx', newContent, function (err) {
    if (err) {
      console.error('写入 routerPath 文件失败');
    }
  });
  fs.writeFile(fileObj.routerFolder + '/index.tsx', routeIndexContent, function (err) {
    if (err) {
      console.error('写入 routerIndex 文件失败');
    }
  });
  console.log(new Date().toLocaleTimeString('en', { hour12: false }), '-------', 'write route');
  // fileObj.fileList = fileList;
}

const writeRouteFn = debounce(writeRoute, 100);

function watchFiles() {
  fileObj.watcher = fs.watch(fileObj.watchFile, (event, filename) => {
    console.log('event===',event)
    // if (event === 'change') {
    //   return;
    // }
    // if (/(\\components\\|\\component\\)/.test(filename)) {
    //   return;
    // }
    writeRouteFn();
  });
}

function stopWatch() {
  console.log('stop watch');
  if (fileObj.watcher) {
    fileObj.watcher.close();
    fileObj.watcher = undefined;
  }
}

function fileDisplay(url, t) {
  let timer = null;
  let arr: pathItem[] = [];
  return new Promise((resolve, reject) => {
    handle(url, t);
    function handle(url, t) {
      if (fileObj.stamp !== t) {
        reject();
        return;
      }
      const filePath = path.resolve(url);
      fs.readdir(filePath, (err, files) => {
        if (err) {
          return;
        }
        files.forEach((filename) => {
          if (
            filename === 'components' ||
            filename === 'component' ||
            // ['components', 'component'].includes(filename) ||
            filename.startsWith('_')
          ) {
            return;
          }
          const filedir = path.join(filePath, filename);
          fs.stat(filedir, (eror, stats) => {
            if (eror) {
              console.error('Error:(spec)', err);
              return;
            }
            const isFile = stats.isFile() && (filename.endsWith('tsx') || filedir.endsWith('jsx'));
            const isDir = stats.isDirectory();
            if (isFile) {
              const fpath = filedir.replace(fileObj.srcPath, '@').replace(/\\/g, '/');
              const fp = fpath.replace(/^@\/pages/, '.');
              let fname = fpath.replace(/index.tsx$/, '').replace(/(^@\/pages|\.tsx$)/g, '');
              fname = startCase(fname).replace(/ /g, '');
              if (fileObj.stamp !== t) {
                return;
              }
              let fp_arr = [fp, fp.replace(/\/index.tsx$/, ''), fp.replace(/\.tsx$/, '')];

              // fp_arr = [...new Set(fp_arr)];
              fp_arr = Array.from(new Set(fp_arr));

              arr = arr.concat(fp_arr.map((item) => ({ name: fname, path: fpath, fp: item })));

              // arr.push({ name: fname, path: fpath });

              if (fileObj.stamp !== t) {
                reject();
                return;
              }

              if (timer) {
                clearTimeout(timer);
              }
              timer = setTimeout(() => resolve(arr), 200);
            }
            if (isDir) handle(filedir, t);
          });
        });
      });
    }
  });
}
