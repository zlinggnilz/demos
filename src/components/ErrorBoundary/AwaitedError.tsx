import { useAsyncError } from 'react-router-dom';

function RenderAwaitedError() {
  const error = useAsyncError() as Error;
  return (
    <>
      <h4 style={{ fontSize: 15 }}>抱歉, 出现了一些错误。</h4>
      <p>{error.message}</p>
      {error.stack}
    </>
  );
}

export default RenderAwaitedError;
