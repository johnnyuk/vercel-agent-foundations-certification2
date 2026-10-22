import { Sandbox } from "@vercel/sandbox";

export const SANDBOX_NAME = "admin-agent-sandbox";

// Save a data tool's full result into the sandbox (e.g. /tmp/sales.json) so
// saved scripts and ad-hoc python3 can read it directly, instead of the model
// re-typing large JSON into a heredoc. Returns fields to merge into the tool
// result: the model reads tool results right before choosing its next step,
// so the reminder to use a logged script lands there rather than only in the
// system prompt. Best-effort: a failure here must not break the tool call.
export const saveToolResult = async (path: string, result: unknown) => {
  try {
    const sandbox = await createOrGetSandbox(SANDBOX_NAME);
    await sandbox.writeFiles([
      { path, content: Buffer.from(JSON.stringify(result)) },
    ]);
    return {
      savedTo: path,
      note: `Full result saved to ${path} in the sandbox. If memories.md logs a script for this kind of request, run it now with bash (cd /vercel/sandbox && python3 scripts/<name>.py) and base your answer on its output.`,
    };
  } catch (err) {
    console.error(`saveToolResult(${path}) failed`, err);
    return {};
  }
};

export const createOrGetSandbox = async (name: string) => {
  try {
    const sandbox = await Sandbox.get({ name });
    return sandbox;
  } catch {
    const sandbox = await Sandbox.create({
      name,
      // persistent: true is the beta default; auto-snapshots on stop, auto-resumes on next get
      snapshotExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days
      timeout: 2700000, // 45 minutes
    });
    return sandbox;
  }
};