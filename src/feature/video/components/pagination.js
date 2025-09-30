'use client';

import { useCallback } from 'react';
import { BsCaretLeft, BsCaretRight } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';
import './pagination.scss';

const Pagination = (props) => {
  const { page, totalPage, setPage, inSharing } = props;
  const pageIndication = `${page + 1}/${totalPage}`;
  
  const toPreviousPage = useCallback(() => {
    if (page > 0) {
      setPage(page - 1);
    }
  }, [page, setPage]);
  
  const toNextPage = useCallback(() => {
    if (page < totalPage - 1) {
      setPage(page + 1);
    }
  }, [page, totalPage, setPage]);
  
  return (
    <div className={classnames('pagination', { 'in-sharing': inSharing })}>
      <Button
        key="left"
        variant="outline-secondary"
        className="previous-page-button"
        onClick={toPreviousPage}
      >
        <BsCaretLeft /> {pageIndication}
      </Button>
      <Button key="right" variant="outline-secondary" className="next-page-button" onClick={toNextPage}>
        {pageIndication} <BsCaretRight />
      </Button>
    </div>
  );
};

export default Pagination;
