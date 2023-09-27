import { generateService } from '@umijs/openapi';
import path from 'path';

const fileNames = {
  xiansuoyonghu: 'clueUser',
};

const str = `import request from '@/utils/request';

// --------------------------------------------------- //
// ------- 该文件由 OpenAPI 自动生成, 请勿手动修改 ------- //
// --------------------------------------------------- //
`;

const __dirname = path.resolve();
const schemaPath = path.join(__dirname, `./scripts/a.json`);
console.log(schemaPath);

generateService({
  requestLibPath: str,
  schemaPath,
  serversPath: './src/services',
  projectName: 'viteT', // folder name
  namespace: 'API', //typeings namespace
  hook: {
    // 自定义类名 生成 controller 对应的文件名
    customClassName: (tagName) => {
      return fileNames[tagName] || tagName;
    },
    // 自定义函数名
    customFunctionName: (data) => {
      let funName = data.operationId ? data.operationId : '';
      const i = funName.lastIndexOf('_');
      if (i > -1) {
        funName = funName.substring(0, i);
      }
      funName = funName.replace(/Using(GET|POST|PUT|DELETE)$/, '_$1');
      return funName;
    },
  },
});
