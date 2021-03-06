import * as React from 'react';
import { MessageWithIcon } from 'components/MessageWithIcon/MessageWithIcon';
import { LoadingSpinner } from 'components/LoadingSpinner/LoadingSpinner';
import { Shim } from './ReactIntersectionObserverShim';
import { IntersectionObserverProps } from 'react-intersection-observer';
import universal from 'react-universal-component';

/** A wrapper around `react-intersection-observer` that conditionally loads
 * the library only in browsers that support `IntersectionObserver`.
 * 
 * For browsers without `IntersectionObserver` support, it just renders the children
 * components immediately.
 * 
 * **Why not load a polyfill for `IntersectionObserver`?**
 * The whole point of this component is to avoid loading stuff until
 * it is actually needed. For example, we can delay loading the Facebook
 * comments plugin until the user has scrolled further down the page so 
 * that the initial rendering of the page is not affected by the size of
 * the Facebook JS SDK.
 * 
 * It does not make sense to load a polyfill that adds to the size of the resources
 * needed to do the initial rendering. Also, the polyfill will have to use a poll strategy
 * to check for intersection, which may lead to janky scrolling.
 * 
 * So this is a sort of progressive enhancement where better browsers can delay
 * the load of non-critical resources until they are (almost) visible on the page, and
 * older browsers can still load these resources, albeit in a less efficient way.
 */
export const OptionalIntersectionObserver = universal<
  IntersectionObserverProps
>(
  {
    async load() {
      const supportsIntersectionObserver =
        'IntersectionObserver' in global &&
        'IntersectionObserverEntry' in global &&
        'intersectionRatio' in IntersectionObserverEntry.prototype;

      if (supportsIntersectionObserver) {
        return import('react-intersection-observer');
      }

      return Shim;
    },
  },
  {
    loading: p => {
      if (__SERVER__) {
        return <Shim {...p} />;
      }

      return <MessageWithIcon caption="Loading..." icon={<LoadingSpinner />} />;
    },
  },
);
