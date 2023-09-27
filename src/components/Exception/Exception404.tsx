import { Link } from 'react-router-dom';

const Exception404 = () => {
  return (
    <div>
      抱歉，您访问的页面不存在
      <div>
        <Link to="/">返 回</Link>
      </div>
    </div>
  );
};

export default Exception404;
