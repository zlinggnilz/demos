import { Link } from 'react-router-dom';

const Exception403 = () => {
  return (
    <div>
      抱歉，您无权访问该页面。
      <div>
        <Link to="/">返 回</Link>
      </div>
    </div>
  );
};

export default Exception403;
