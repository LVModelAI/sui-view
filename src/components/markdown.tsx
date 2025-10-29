import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Streamdown } from "streamdown";
import remarkGfm from "remark-gfm";

const components: Partial<Components> = {
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-2xl font-bold" {...props}>
        {children}
        <hr className="my-4" />
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-xl font-bold mt-4" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-lg font-bold" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-base font-bold" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-sm font-bold" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-xs font-bold" {...props}>
        {children}
      </h6>
    );
  },
  p: ({ node, children, ...props }) => {
    return (
      <p className="text-base" {...props}>
        {children}
      </p>
    );
  },
  code: ({ node, children, ...props }) => {
    return (
      <code className="text-base" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-disc list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <Streamdown
      remarkPlugins={remarkPlugins}
      components={components}
      className="w-full "
    >
      {children}
    </Streamdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
