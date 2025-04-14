declare module 'next/dynamic' {
  export default function dynamic<P = {}>(
    dynamicOptions: {
      loader: () => Promise<React.ComponentType<P>>;
      loading?: React.ComponentType<any>;
      ssr?: boolean;
      suspense?: boolean;
    } | (() => Promise<React.ComponentType<P>>),
    options?: {
      loading?: React.ComponentType<any>;
      ssr?: boolean;
      suspense?: boolean;
    }
  ): React.ComponentType<P>;
}

declare module 'next/script' {
  type ScriptProps = {
    src: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
    strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
    onReady?: () => void;
    dangerouslySetInnerHTML?: { __html: string };
    children?: React.ReactNode;
  };

  export default function Script(props: ScriptProps): JSX.Element;
}