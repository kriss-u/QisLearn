import { Code, Heading, Link, List, Table, Text } from "@chakra-ui/react";
import type { Components } from "react-markdown";
import { MarkdownCodeBlock } from "./MarkdownCodeBlock";

/**
 * HTML-element overrides shared by both the standalone ReactMarkdown renderer
 * (`Markdown.tsx`, for prop-string content like quiz questions) and the
 * compiled MDX lesson body (`mdxComponents.ts`) — both accept the same
 * `{ h1, p, code, ... }` component-override shape.
 */
export const markdownElements: Components = {
  h1: (props) => <Heading size="lg" mt="6" mb="3" {...props} />,
  h2: (props) => <Heading size="md" mt="6" mb="3" {...props} />,
  h3: (props) => <Heading size="sm" mt="4" mb="2" {...props} />,
  p: (props) => <Text mb="3" lineHeight="1.7" {...props} />,
  ul: (props) => <List.Root mb="3" pl="5" {...props} />,
  ol: (props) => <List.Root as="ol" mb="3" pl="5" {...props} />,
  li: (props) => <List.Item {...props} />,
  a: (props) => <Link colorPalette="quantum" color="colorPalette.fg" {...props} />,
  table: (props) => (
    <Table.ScrollArea mb="3" borderWidth="1px" rounded="md">
      <Table.Root size="sm" variant="outline" {...props} />
    </Table.ScrollArea>
  ),
  thead: (props) => <Table.Header {...props} />,
  tbody: (props) => <Table.Body {...props} />,
  tr: (props) => <Table.Row {...props} />,
  th: (props) => <Table.ColumnHeader {...props} />,
  td: (props) => <Table.Cell {...props} />,
  code: ({ children, className }) => {
    if (!className) return <Code fontSize="0.9em">{children}</Code>;
    const language = /language-(\w+)/.exec(className)?.[1];
    const code = String(children).replace(/\n$/, "");
    return <MarkdownCodeBlock code={code} language={language} />;
  },
};

export const inlineMarkdownElements: Components = {
  ...markdownElements,
  p: (props) => <Text as="span" display="inline" {...props} />,
};
