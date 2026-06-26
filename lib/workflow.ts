export const WORKFLOW_ORDER = [
  "New",
  "Measurement Pending",
  "Vendor Assignment Pending",
  "In Production",
  "Received at Shop",
  "Delivered at Site",
  "Installation Pending",
  "Completed",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_ORDER)[number];

export function calculateOrderWorkflow(
  itemStatuses: string[]
): WorkflowStatus {
  if (!itemStatuses.length) {
    return "New";
  }

  let lowestIndex = WORKFLOW_ORDER.length - 1;

  for (const status of itemStatuses) {
    const index = WORKFLOW_ORDER.indexOf(
      status as WorkflowStatus
    );

    if (index !== -1 && index < lowestIndex) {
      lowestIndex = index;
    }
  }

  return WORKFLOW_ORDER[lowestIndex];
}