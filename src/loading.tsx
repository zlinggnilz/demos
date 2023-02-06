import { memo } from 'react';

const Loading = () => {
  return <div className='loaderWrap'>
    <span className='loader'></span>
  </div>;
};

export default memo(Loading);