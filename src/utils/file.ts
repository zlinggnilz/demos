/*
 * @Author: Ling
 * @Date: 2023-02-23 11:19:56
 * @LastEditors: Ling
 * @LastEditTime: 2023-02-23 11:20:14
 * @Description: 下载
 */

export const downloadFile = (url: string, fileName: string) => {
  const link = document.createElement('a');
  link.target = '_blank';
  link.download = fileName;
  link.style.display = 'none';
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadBlob = (content: any, fileName: string) => {
  const blob = new Blob([content]);
  if ('download' in document.createElement('a')) {
    // 非IE下载
    const url = URL.createObjectURL(blob);
    downloadFile(url, fileName);
    URL.revokeObjectURL(url);
  } else {
    // IE10+下载
    const nav = window.navigator as any;
    if (nav.msSaveBlob) {
      nav.msSaveBlob(blob, fileName);
    }
  }
};
