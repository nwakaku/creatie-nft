import { Carousel } from 'antd';
import React from 'react';
import Detail from './Detail';

interface imgType {
  image_url: string;
  owner_name?: string;
  name?: string;
}
interface propsType {
  data: imgType[];
  className?: string;
  wrapClassName?: string;
  showDetail?: boolean;
  type?: string;
}

export default (props: propsType) => {
  const { data = [], showDetail = false, type, className = '', wrapClassName = '' } = props;
  return (
    <div className={className}>
      <Carousel dots={{ className: 'dc-carouse-dots' }}>
        {data.length > 0 &&
          data.map((item, index) => {
            return (
              <div key={index} className="carouse-card">
                <img alt="" className={wrapClassName} src={item.image_url} />
                {showDetail && <Detail data={item} type={type} />}
              </div>
            );
          })}
      </Carousel>
    </div>
  );
};
