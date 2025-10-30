import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Streamdown } from "streamdown";
import remarkGfm from "remark-gfm";

function shortenAddresses(markdown: string): string {
  // Shorten long hex addresses like 0x1234...abcd
  // Matches 0x followed by >=10 hex chars to avoid tiny literals like 0x2
  const addrRe = /\b0x[0-9a-fA-F]{10,}\b/g;
  return markdown.replace(addrRe, (addr) => {
    const head = addr.slice(0, 6); // 0x + 4 hex
    const tail = addr.slice(-4);
    return `${head}...${tail}`;
  });
}

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
      <h3 className="text-lg font-bold mt-4" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-base font-bold mt-4" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-sm font-bold mt-4" {...props}>
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
  const shortened = shortenAddresses(children);
  return (
    <Streamdown
      remarkPlugins={remarkPlugins}
      components={components}
      className="w-full "
    >
      {shortened}
    </Streamdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
