import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Collapsible,
  Heading,
  HStack,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import {
  useContentSnapshotLazyQuery,
  usePreviewContentRestoreMutation,
  useRestoreContentSnapshotMutation,
} from "@qislearn/graphql-schema";

type EntityType = "course" | "track" | "module" | "tag" | "widgetCategory" | "widget" | "lesson";

interface EntityChange {
  entityType: EntityType;
  key: string;
  change: "create" | "update" | "delete";
  before?: unknown;
  after?: unknown;
}

interface SnapshotDiff {
  counts: Record<string, { create: number; update: number; delete: number; unchanged: number }>;
  changes: EntityChange[];
}

const ENTITY_ORDER: EntityType[] = ["course", "track", "module", "tag", "widgetCategory", "widget", "lesson"];
const ENTITY_LABEL: Record<EntityType, string> = {
  course: "Courses",
  track: "Tracks",
  module: "Modules",
  tag: "Tags",
  widgetCategory: "Widget categories",
  widget: "Widgets",
  lesson: "Lessons",
};

const CHANGE_COLOR: Record<EntityChange["change"], string> = {
  create: "green",
  update: "orange",
  delete: "red",
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ChangeRow({ change }: { change: EntityChange }) {
  const [open, setOpen] = useState(false);
  const hasDetail = change.before !== undefined || change.after !== undefined;

  return (
    <Box borderWidth="1px" borderColor="border" rounded="l2" p="2">
      <HStack
        justify="space-between"
        cursor={hasDetail ? "pointer" : undefined}
        onClick={() => hasDetail && setOpen((o) => !o)}
      >
        <HStack gap="2">
          <Badge size="sm" colorPalette={CHANGE_COLOR[change.change]}>
            {change.change}
          </Badge>
          <Text fontSize="sm" fontFamily="mono">
            {change.key}
          </Text>
        </HStack>
      </HStack>
      {hasDetail && (
        <Collapsible.Root open={open}>
          <Collapsible.Content>
            <HStack align="start" gap="4" mt="2" fontSize="xs" fontFamily="mono">
              {change.before !== undefined && (
                <Box flex="1" minW="0" whiteSpace="pre-wrap" color="fg.muted">
                  {JSON.stringify(change.before, null, 2)}
                </Box>
              )}
              {change.after !== undefined && (
                <Box flex="1" minW="0" whiteSpace="pre-wrap">
                  {JSON.stringify(change.after, null, 2)}
                </Box>
              )}
            </HStack>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </Box>
  );
}

function DiffSummary({ diff }: { diff: SnapshotDiff }) {
  const changesByType = new Map<EntityType, EntityChange[]>();
  for (const change of diff.changes) {
    changesByType.set(change.entityType, [...(changesByType.get(change.entityType) ?? []), change]);
  }

  return (
    <VStack align="stretch" gap="4">
      <VStack align="stretch" gap="1">
        {ENTITY_ORDER.map((type) => {
          const counts = diff.counts[type];
          if (!counts) return null;
          return (
            <HStack key={type} justify="space-between" fontSize="sm">
              <Text color="fg.muted">{ENTITY_LABEL[type]}</Text>
              <HStack gap="3">
                <Text color="green.fg">+{counts.create}</Text>
                <Text color="orange.fg">~{counts.update}</Text>
                <Text color="red.fg">-{counts.delete}</Text>
                <Text color="fg.subtle">{counts.unchanged} unchanged</Text>
              </HStack>
            </HStack>
          );
        })}
      </VStack>

      {diff.changes.length === 0 ? (
        <Text fontSize="sm" color="fg.muted">
          No differences — the snapshot matches the current database exactly.
        </Text>
      ) : (
        <VStack align="stretch" gap="2">
          {diff.changes.map((change) => (
            <ChangeRow key={`${change.entityType}:${change.key}`} change={change} />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default function ContentBackupPage() {
  const [fetchSnapshot] = useContentSnapshotLazyQuery({ fetchPolicy: "network-only" });
  const [previewRestore, { loading: previewing }] = usePreviewContentRestoreMutation();
  const [applyRestore, { loading: restoring }] = useRestoreContentSnapshotMutation();

  const [downloading, setDownloading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedSnapshot, setUploadedSnapshot] = useState<Record<string, unknown> | null>(null);
  const [diff, setDiff] = useState<SnapshotDiff | null>(null);
  const [prune, setPrune] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoreResult, setRestoreResult] = useState<SnapshotDiff | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const { data } = await fetchSnapshot();
      if (data) downloadJson(`qislearn-content-${new Date().toISOString().slice(0, 10)}.json`, data.contentSnapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download snapshot.");
    } finally {
      setDownloading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setDiff(null);
    setRestoreResult(null);
    setFileName(file.name);
    file
      .text()
      .then((text) => setUploadedSnapshot(JSON.parse(text)))
      .catch(() => setError("That file isn't valid JSON."));
  }

  async function handlePreview() {
    if (!uploadedSnapshot) return;
    setError(null);
    setRestoreResult(null);
    try {
      const { data } = await previewRestore({ variables: { snapshot: uploadedSnapshot } });
      if (data) setDiff(data.previewContentRestore as unknown as SnapshotDiff);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compute diff.");
    }
  }

  async function handleRestore() {
    if (!uploadedSnapshot || !diff) return;
    const deleteCount = Object.values(diff.counts).reduce((sum, c) => sum + c.delete, 0);
    const warning =
      prune && deleteCount > 0
        ? `This will also DELETE ${deleteCount} item(s) not present in the uploaded snapshot. `
        : "";
    if (!window.confirm(`${warning}Apply this snapshot to the database now?`)) return;

    setError(null);
    try {
      const { data } = await applyRestore({ variables: { snapshot: uploadedSnapshot, prune } });
      if (data) {
        setRestoreResult(data.restoreContentSnapshot as unknown as SnapshotDiff);
        setDiff(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore snapshot.");
    }
  }

  return (
    <VStack align="stretch" gap="8" maxW="3xl">
      <Box>
        <Heading size="lg">Content backup</Heading>
        <Text fontSize="sm" color="fg.muted" mt="1">
          Export or restore the full content model (courses, tracks, modules, lessons, content blocks, tags, and the
          widget catalog) as a JSON file, keyed by slug so it's meaningful across databases. This never touches user
          accounts, progress, or organizations.
        </Text>
      </Box>

      <VStack align="stretch" gap="3">
        <Heading size="sm">Export</Heading>
        <Box>
          <Button onClick={handleDownload} loading={downloading} colorPalette="quantum" variant="outline">
            Download current content as JSON
          </Button>
        </Box>
      </VStack>

      <Separator />

      <VStack align="stretch" gap="3">
        <Heading size="sm">Import / restore</Heading>
        <Text fontSize="xs" color="fg.muted">
          Upload a snapshot (from this database earlier, or downloaded from another environment) to see what it
          would change, before applying anything.
        </Text>
        <HStack>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Choose file
          </Button>
          <Text fontSize="sm" color="fg.muted">
            {fileName ?? "No file selected"}
          </Text>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
        </HStack>

        {uploadedSnapshot && (
          <HStack>
            <Button size="sm" onClick={handlePreview} loading={previewing} colorPalette="quantum" variant="outline">
              Preview diff
            </Button>
          </HStack>
        )}

        {error && (
          <Alert.Root status="error" rounded="l2">
            <Alert.Indicator />
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        {diff && (
          <VStack align="stretch" gap="3" borderWidth="1px" borderColor="border" rounded="l2" p="4">
            <DiffSummary diff={diff} />
            <Separator />
            <Checkbox.Root checked={prune} onCheckedChange={(d) => setPrune(!!d.checked)} size="sm">
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                Also delete items not in this snapshot (rows marked "-" above only get removed with this checked —
                otherwise restore only creates/updates)
              </Checkbox.Label>
            </Checkbox.Root>
            <HStack>
              <Button onClick={handleRestore} loading={restoring} colorPalette="red">
                Restore this snapshot
              </Button>
            </HStack>
          </VStack>
        )}

        {restoreResult && (
          <VStack align="stretch" gap="3" borderWidth="1px" borderColor="green.subtle" rounded="l2" p="4">
            <Alert.Root status="success" rounded="l2">
              <Alert.Indicator />
              <Alert.Description>Restore applied.</Alert.Description>
            </Alert.Root>
            <DiffSummary diff={restoreResult} />
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
