import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      children?: React.ReactNode;
    }
  }
}
