import { IApi } from "umi";

export default (api: IApi) => {
  api.modifyHTML(($) => {
    $("head").append(["<title>DEMOS</title>",`<link rel="shortcut icon" type="image/x-icon" href="/demos/icon.png"
  />`]);
    $("#root").append([
      `<div class='loaderWrap'><span class='loader'></span></div>`,
      `<!-- ${new Date().toLocaleString()} -->`
    ]);
    return $;
  });
  api.addHTMLStyles(() => [
    `.loaderWrap{ padding:50px 20px; text-align:center;}
  .loader { width: 48px; height: 48px; border: 5px solid #ddd; border-bottom-color: transparent; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; }
  @keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`,
  ]);


  // api.addHTMLMetas(() => [{ name: 'foo', content: 'bar' }]);
  // api.addHTMLLinks(() => [{ rel: 'foo', content: 'bar' }]);
  // api.addHTMLHeadScripts(() => [`console.log('hello world from head')`]);
  // api.addHTMLScripts(() => [`console.log('hello world')`]);
  // api.addEntryCodeAhead(() => [`console.log('entry code ahead')`]);
  // api.addEntryCode(() => [`console.log('entry code')`]);
  // api.onDevCompileDone((opts) => {
  //   opts;
  //   // console.log('> onDevCompileDone', opts.isFirstCompile);
  // });
  // api.onBuildComplete((opts) => {
  //   opts;
  //   // console.log('> onBuildComplete', opts.isFirstCompile);
  // });
  // api.chainWebpack((memo) => {
  //   memo;
  // });
  // api.onStart(() => {});
  // api.onCheckCode((args) => {
  //   args;
  //   // console.log('> onCheckCode', args);
  // });
};
