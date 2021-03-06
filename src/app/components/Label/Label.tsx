import * as React from 'react';
import cc from 'classcat';

import * as classes from './Label.module.scss';

type Props = {
  text: string;
  size?: 'small' | 'normal';
  className?: string;
};

export const Label = ({ text, size = 'normal', className }: Props) => (
  <div
    className={cc([className, {
      [classes.label]: true,
      [classes.small]: size === 'small',
    }])}
  >
    {text}
  </div>
);
