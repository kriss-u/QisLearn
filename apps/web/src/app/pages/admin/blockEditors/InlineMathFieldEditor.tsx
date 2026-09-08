import { Box, Input, Text } from "@chakra-ui/react";
import { InlineMath } from "../../../../components/lesson/InlineMath";

/**
 * Titles render through the site's InlineMath component (see MdxCard's
 * `eyebrow`), which only renders `$...$` math segments — not full GFM
 * markdown (no bold/lists/links). This mirrors that exactly rather than
 * offering a full markdown editor that would imply formatting titles don't
 * actually support.
 */
export function InlineMathFieldEditor({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <Box w="full">
      <Input variant="flushed" size="sm" w="full" fontFamily="mono" value={value} onChange={(e) => onChange(e.target.value)} />
      {value && (
        <Box w="full" mt="1.5" px="2.5" py="2" borderWidth="1px" borderColor="border" rounded="l2" bg="bg.muted">
          <Text fontSize="2xs" color="fg.subtle" mb="1">
            Preview — only <code>$...$</code> math renders here, no bold/lists/links
          </Text>
          <Text fontSize="sm">
            <InlineMath>{value}</InlineMath>
          </Text>
        </Box>
      )}
    </Box>
  );
}
