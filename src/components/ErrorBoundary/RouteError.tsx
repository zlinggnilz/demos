import { useRouteError } from 'react-router-dom';

const ErrorBoundary = () => {
  const err = useRouteError() as any;
  return (
    <div
      style={{
        color: '#999',
        fontSize: 16,
        padding: '32px 24px',
        background: '#fafafa',
        border: '1px solid #e3e3e3',
        marginBottom: 24,
      }}
    >
      <h4 style={{ fontSize: 15 }}>抱歉, 出现了一些错误。</h4>
      <p>{err.message}</p>
      <p></p>
    </div>
  );
};

export default ErrorBoundary;
