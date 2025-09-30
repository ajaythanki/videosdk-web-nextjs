import React from 'react';
import { BsArrowRepeat } from 'react-icons/bs';
import './loading-layer.scss';

const LoadingLayer = (props) => {
  const { content } = props;
  return (
    <div className="loading-layer">
      <BsArrowRepeat style={{ fontSize: '52px', animation: 'spin 1s linear infinite', color: '#fff' }} />
      <p className="loading-text">{content}</p>
    </div>
  );
};

export default LoadingLayer;
